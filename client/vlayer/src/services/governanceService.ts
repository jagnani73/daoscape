import { daoService } from "./daoService";
import type {
  VoteRequest,
  VoteResponse,
  CreateProposalRequest,
  CreateProposalResponse,
  ProposalWithVotes,
} from "../types/dao";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface OnChainProposalData {
  daoId: string;
  proposalId: string;
  title: string;
  creator: string;
  active: boolean;
  startTime: bigint;
  endTime: bigint;
}

export interface OnChainVoteCounts {
  yesVotes: bigint;
  noVotes: bigint;
  abstainVotes: bigint;
}

export interface OnChainVoteData {
  hasVoted: boolean;
  voteType: number; // 0 = no, 1 = yes, 2 = abstain
}

export interface CreateOnChainProposalParams {
  daoId: string;
  proposalId: string;
  title: string;
  creator: string;
  startTime: Date;
  endTime: Date;
}

export interface HybridProposalData extends ProposalWithVotes {
  onChain?: {
    active: boolean;
    startTime: bigint;
    endTime: bigint;
    voteCounts: OnChainVoteCounts;
    isVotingActive: boolean;
  };
}

export interface HybridCreateProposalResponse extends CreateProposalResponse {
  onChainCreated?: boolean;
  onChainError?: string;
}

export interface HybridVoteResponse extends VoteResponse {
  onChainVoted?: boolean;
  onChainError?: string;
}

export const governanceService = {
  // Hybrid function: Create proposal both on-chain and in API
  createHybridProposal: async (
    proposalData: CreateProposalRequest,
    onChainParams: CreateOnChainProposalParams,
    contractHooks: {
      createProposal: (params: any) => Promise<void>;
    }
  ): Promise<HybridCreateProposalResponse> => {
    try {
      // First create the proposal in the API (existing functionality)
      const apiResponse = await daoService.createProposal(proposalData);

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || "Failed to create proposal in API"
        );
      }

      // Then create the proposal on-chain
      try {
        await contractHooks.createProposal({
          daoId: onChainParams.daoId,
          proposalId: onChainParams.proposalId,
          title: onChainParams.title,
          creator: onChainParams.creator,
          startTime: BigInt(
            Math.floor(onChainParams.startTime.getTime() / 1000)
          ),
          endTime: BigInt(Math.floor(onChainParams.endTime.getTime() / 1000)),
        });

        return {
          ...apiResponse,
          onChainCreated: true,
        };
      } catch (onChainError) {
        console.warn("On-chain proposal creation failed:", onChainError);
        return {
          ...apiResponse,
          onChainCreated: false,
          onChainError:
            onChainError instanceof Error
              ? onChainError.message
              : "Unknown error",
        };
      }
    } catch (error) {
      console.error("Error creating hybrid proposal:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create proposal",
      };
    }
  },

  // Hybrid function: Cast vote both on-chain and in API
  castHybridVote: async (
    voteData: VoteRequest,
    contractHooks: {
      voteYes: (daoId: string, proposalId: string) => Promise<void>;
      voteNo: (daoId: string, proposalId: string) => Promise<void>;
      voteAbstain: (daoId: string, proposalId: string) => Promise<void>;
    }
  ): Promise<HybridVoteResponse> => {
    try {
      // First cast vote in the API (existing functionality)
      const apiResponse = await daoService.castVote(voteData);

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to cast vote in API");
      }

      // Then cast vote on-chain
      try {
        const { proposal_id, vote } = voteData;
        const daoId = proposal_id; // Assuming proposal_id contains DAO info or you need to map it

        switch (vote) {
          case "YES":
            await contractHooks.voteYes(daoId, proposal_id);
            break;
          case "NO":
            await contractHooks.voteNo(daoId, proposal_id);
            break;
          case "ABSTAIN":
            await contractHooks.voteAbstain(daoId, proposal_id);
            break;
          default:
            throw new Error("Invalid vote type");
        }

        return {
          ...apiResponse,
          onChainVoted: true,
        };
      } catch (onChainError) {
        console.warn("On-chain vote failed:", onChainError);
        return {
          ...apiResponse,
          onChainVoted: false,
          onChainError:
            onChainError instanceof Error
              ? onChainError.message
              : "Unknown error",
        };
      }
    } catch (error) {
      console.error("Error casting hybrid vote:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cast vote",
      };
    }
  },

  // Get enhanced proposal data with on-chain information
  getHybridProposal: async (
    proposalId: string,
    contractReads: {
      proposalData?: OnChainProposalData;
      voteCounts?: OnChainVoteCounts;
      isVotingActive?: boolean;
    }
  ): Promise<{
    success: boolean;
    data?: HybridProposalData;
    message?: string;
  }> => {
    try {
      // Get proposal from API
      const apiResponse = await daoService.getProposalById(proposalId);

      if (!apiResponse.success || !apiResponse.data) {
        return apiResponse;
      }

      // Enhance with on-chain data if available
      const hybridData: HybridProposalData = {
        ...apiResponse.data,
        onChain: contractReads.proposalData
          ? {
              active: contractReads.proposalData.active,
              startTime: contractReads.proposalData.startTime,
              endTime: contractReads.proposalData.endTime,
              voteCounts: contractReads.voteCounts || {
                yesVotes: 0n,
                noVotes: 0n,
                abstainVotes: 0n,
              },
              isVotingActive: contractReads.isVotingActive || false,
            }
          : undefined,
      };

      return {
        success: true,
        data: hybridData,
      };
    } catch (error) {
      console.error("Error getting hybrid proposal:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get proposal",
      };
    }
  },

  // Get all proposals for a DAO with on-chain data
  getHybridDaoProposals: async (
    daoId: string,
    contractReads: {
      onChainProposalIds?: string[];
    }
  ) => {
    try {
      // Since getDaoProposals doesn't exist in daoService, we'll need to implement this differently
      // For now, we'll return a basic structure that can be enhanced later

      return {
        success: true,
        data: [],
        onChainProposalIds: contractReads.onChainProposalIds || [],
        message: "DAO proposals retrieval not yet implemented in API service",
      };
    } catch (error) {
      console.error("Error getting hybrid DAO proposals:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get DAO proposals",
      };
    }
  },

  // Utility function to convert vote type between API and contract formats
  convertVoteType: {
    apiToContract: (apiVote: "YES" | "NO" | "ABSTAIN"): number => {
      switch (apiVote) {
        case "YES":
          return 1;
        case "NO":
          return 0;
        case "ABSTAIN":
          return 2;
        default:
          throw new Error("Invalid vote type");
      }
    },
    contractToApi: (contractVote: number): "YES" | "NO" | "ABSTAIN" => {
      switch (contractVote) {
        case 1:
          return "YES";
        case 0:
          return "NO";
        case 2:
          return "ABSTAIN";
        default:
          throw new Error("Invalid vote type");
      }
    },
  },

  // Utility function to generate proposal ID
  generateProposalId: (): string => {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Utility function to convert timestamps
  convertTimestamp: {
    dateToBlockchain: (date: Date): bigint => {
      return BigInt(Math.floor(date.getTime() / 1000));
    },
    blockchainToDate: (timestamp: bigint): Date => {
      return new Date(Number(timestamp) * 1000);
    },
  },
};
