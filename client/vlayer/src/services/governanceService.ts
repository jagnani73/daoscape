import { daoService } from "./daoService";
import { executeAPIAfterTransaction } from "../utils/transactionWithAPI";
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
  generateProposalId: (): string => {
    return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get proposal data for on-chain operations
  getOnChainProposalData: async (
    proposalId: string
  ): Promise<OnChainProposalData | null> => {
    try {
      const proposal = await daoService.getProposalById(proposalId);
      if (!proposal.success || !proposal.data) {
        return null;
      }

      const data = proposal.data;
      return {
        daoId: data.dao_id,
        proposalId: data.proposal_id,
        title: data.title,
        creator: data.dao_id, // Using dao_id as creator since creator_address doesn't exist
        active: true,
        startTime: BigInt(
          Math.floor(new Date(data.voting_start).getTime() / 1000)
        ),
        endTime: BigInt(Math.floor(new Date(data.voting_end).getTime() / 1000)),
      };
    } catch (error) {
      console.error("Error fetching on-chain proposal data:", error);
      return null;
    }
  },

  // Enhanced hybrid function: Create proposal in API first, then on-chain with the returned ID
  createHybridProposal: async (
    proposalData: CreateProposalRequest,
    onChainParams: CreateOnChainProposalParams,
    contractHooks: {
      createProposal: (params: any) => Promise<`0x${string}`>;
    }
  ): Promise<HybridCreateProposalResponse> => {
    try {
      console.log("🚀 Starting hybrid proposal creation...");

      // First create the proposal in the backend API
      console.log("📝 Creating proposal in backend API...");
      const apiResponse = await daoService.createProposal(proposalData);

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || "Failed to create proposal in API"
        );
      }

      // Extract the proposal ID from the API response
      const backendProposalId = apiResponse.data?.proposal_id;
      if (!backendProposalId) {
        throw new Error("No proposal ID returned from backend");
      }

      console.log(`✅ Proposal created in API with ID: ${backendProposalId}`);

      // Now create the proposal on-chain using the backend proposal ID
      try {
        console.log("🔗 Creating proposal on-chain...");
        const txHash = await contractHooks.createProposal({
          daoId: onChainParams.daoId,
          proposalId: backendProposalId, // Use the ID from backend
          title: onChainParams.title,
          creator: onChainParams.creator,
          startTime: BigInt(
            Math.floor(onChainParams.startTime.getTime() / 1000)
          ),
          endTime: BigInt(Math.floor(onChainParams.endTime.getTime() / 1000)),
        });

        console.log(`✅ On-chain proposal creation initiated: ${txHash}`);

        return {
          ...apiResponse,
          onChainCreated: true,
        };
      } catch (onChainError) {
        console.warn(
          "⚠️ On-chain creation failed, but API proposal exists:",
          onChainError
        );

        return {
          ...apiResponse,
          onChainCreated: false,
          onChainError:
            onChainError instanceof Error
              ? onChainError.message
              : "On-chain creation failed",
        };
      }
    } catch (error) {
      console.error("❌ Error creating hybrid proposal:", error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create proposal",
      };
    }
  },

  // Enhanced hybrid function: Cast vote on-chain first, then API after settlement
  castHybridVote: async (
    voteData: VoteRequest,
    contractHooks: {
      voteYes: (daoId: string, proposalId: string) => Promise<`0x${string}`>;
      voteNo: (daoId: string, proposalId: string) => Promise<`0x${string}`>;
      voteAbstain: (
        daoId: string,
        proposalId: string
      ) => Promise<`0x${string}`>;
    }
  ): Promise<HybridVoteResponse> => {
    try {
      console.log("🗳️ Starting hybrid vote casting...");

      const { proposal_id, vote } = voteData;
      const daoId = proposal_id; // Assuming proposal_id contains DAO info or you need to map it

      // First cast vote on-chain and get transaction hash
      let txHash: `0x${string}`;
      switch (vote) {
        case "YES":
          txHash = await contractHooks.voteYes(daoId, proposal_id);
          break;
        case "NO":
          txHash = await contractHooks.voteNo(daoId, proposal_id);
          break;
        case "ABSTAIN":
          txHash = await contractHooks.voteAbstain(daoId, proposal_id);
          break;
        default:
          throw new Error("Invalid vote type");
      }

      console.log(`🗳️ On-chain vote cast initiated: ${txHash}`);

      // Wait for transaction settlement, then record in API
      const apiResponse = await executeAPIAfterTransaction(
        txHash,
        () => daoService.castVote(voteData),
        {
          onTransactionConfirmed: (receipt) => {
            console.log(
              `✅ Vote transaction confirmed in block ${receipt.blockNumber}`
            );
          },
          onAPIComplete: (result) => {
            console.log(`✅ Vote recorded in API:`, result.success);
          },
        }
      );

      return {
        ...apiResponse,
        onChainVoted: true,
      };
    } catch (error) {
      console.error("❌ Error casting hybrid vote:", error);

      // If on-chain fails, try API only as fallback
      try {
        console.log("🔄 Attempting API-only vote as fallback...");
        const apiResponse = await daoService.castVote(voteData);
        return {
          ...apiResponse,
          onChainVoted: false,
          onChainError:
            error instanceof Error ? error.message : "On-chain vote failed",
        };
      } catch (apiError) {
        return {
          success: false,
          message: `Both on-chain and API vote failed. On-chain: ${
            error instanceof Error ? error.message : "Unknown error"
          }, API: ${
            apiError instanceof Error ? apiError.message : "Unknown error"
          }`,
        };
      }
    }
  },

  // New function: Conclude proposal on-chain first, then update API
  concludeHybridProposal: async (
    proposalId: string,
    contractHooks: {
      deactivateProposal: (
        daoId: string,
        proposalId: string
      ) => Promise<`0x${string}`>;
    }
  ): Promise<HybridVoteResponse> => {
    try {
      console.log("🏁 Starting hybrid proposal conclusion...");

      // Get proposal data for DAO ID
      const proposalData = await governanceService.getOnChainProposalData(
        proposalId
      );
      if (!proposalData) {
        throw new Error("Proposal not found");
      }

      // First deactivate on-chain
      const txHash = await contractHooks.deactivateProposal(
        proposalData.daoId,
        proposalId
      );

      console.log(`🏁 On-chain proposal deactivation initiated: ${txHash}`);

      // Wait for transaction settlement, then update API
      const apiResponse = await executeAPIAfterTransaction(
        txHash,
        () =>
          daoService.concludeProposal({
            proposal_id: proposalId,
            is_feedback: false, // Using the correct property name
          }),
        {
          onTransactionConfirmed: (receipt) => {
            console.log(
              `✅ Proposal conclusion confirmed in block ${receipt.blockNumber}`
            );
          },
          onAPIComplete: (result) => {
            console.log(
              `✅ Proposal conclusion recorded in API:`,
              result.success
            );
          },
        }
      );

      return {
        ...apiResponse,
        onChainVoted: true, // Reusing the field for conclusion status
      };
    } catch (error) {
      console.error("❌ Error concluding hybrid proposal:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to conclude proposal",
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
