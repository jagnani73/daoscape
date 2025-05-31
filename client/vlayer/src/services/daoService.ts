import {
  DAO,
  DAOResponse,
  DAODetailResponse,
  JoinDAOResponse,
  CreateMemberResponse,
  CreateProposalRequest,
  CreateProposalResponse,
  TokenDetailsResponse,
  DAOMember,
  MembershipRequest,
  MembershipStatus,
  ProposalDetailResponse,
  VoteRequest,
  VoteResponse,
  ConcludeProposalRequest,
  ConcludeProposalResponse,
  Proposal,
  Vote,
} from "../types/dao";

const API_BASE_URL = import.meta.env.VITE_BE_API_URL;

const membershipStatus: Record<string, MembershipStatus> = {};

export const daoService = {
  getAllDAOs: async (): Promise<DAO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DAOResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching DAOs:", error);
      throw error;
    }
  },

  getAllDAOsRaw: async (): Promise<DAO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DAOResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching DAOs:", error);
      throw error;
    }
  },

  getDAOById: async (id: string): Promise<DAO | null> => {
    try {
      const daos = await daoService.getAllDAOs();
      return daos.find((dao) => dao.dao_id === id) || null;
    } catch (error) {
      console.error("Error fetching DAO by ID:", error);
      return null;
    }
  },

  getDAOByIdRaw: async (id: string): Promise<DAO | null> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      return daos.find((dao) => dao.dao_id === id) || null;
    } catch (error) {
      console.error("Error fetching DAO by ID:", error);
      return null;
    }
  },

  getDAOByIdDetailed: async (id: string): Promise<DAO | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DAODetailResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching detailed DAO by ID:", error);
      return null;
    }
  },

  getDAOsByCategory: async (category: string): Promise<DAO[]> => {
    try {
      const daos = await daoService.getAllDAOs();
      return daos.filter((dao) =>
        dao.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching DAOs by category:", error);
      return [];
    }
  },

  getDAOsByTag: async (tag: string): Promise<DAO[]> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      return daos.filter((dao) =>
        dao.tags.some((daoTag) => daoTag.toLowerCase() === tag.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching DAOs by tag:", error);
      return [];
    }
  },

  getTokenDetails: async (
    tokenAddress: string,
    chainId: number
  ): Promise<TokenDetailsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token_address: tokenAddress,
          chain_id: chainId,
        }),
      });

      const data: TokenDetailsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching token details:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch token details",
      };
    }
  },

  createMember: async (
    walletAddress: string
  ): Promise<CreateMemberResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/member/${walletAddress}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: CreateMemberResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error creating member:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create member",
      };
    }
  },

  joinDAO: async (
    daoId: string,
    walletAddress: string
  ): Promise<JoinDAOResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/membership/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dao_id: daoId,
          wallet_address: walletAddress,
        }),
      });

      const data: JoinDAOResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error joining DAO:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to join DAO",
      };
    }
  },

  requestToJoinDAO: async (
    daoId: string,
    userAddress: string,
    message?: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const key = `${daoId}-${userAddress}`;

    const currentStatus = membershipStatus[key];
    if (currentStatus === "member" || currentStatus === "pending") {
      return false;
    }

    membershipStatus[key] = "pending";

    setTimeout(() => {
      membershipStatus[key] = "member";
    }, 3000);

    return true;
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      const allTags = daos.flatMap((dao) => dao.tags);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags.sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  getTags: async (): Promise<string[]> => {
    return daoService.getCategories();
  },

  createProposal: async (
    proposalData: CreateProposalRequest
  ): Promise<CreateProposalResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proposal/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      const data: CreateProposalResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error creating proposal:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create proposal",
      };
    }
  },

  getProposalById: async (
    proposalId: string
  ): Promise<ProposalDetailResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/proposal/${proposalId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: ProposalDetailResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching proposal:", error);
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to fetch proposal",
      };
    }
  },

  castVote: async (voteData: VoteRequest): Promise<VoteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voteData),
      });

      const data: VoteResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error casting vote:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cast vote",
      };
    }
  },

  getVotesForProposal: async (
    proposalId: string,
    isFeedback: boolean,
    house?: string
  ): Promise<{ success: boolean; data?: Vote[]; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/vote/proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          is_feedback: isFeedback,
          house: house || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching votes:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch votes",
      };
    }
  },

  concludeProposal: async (
    concludeData: ConcludeProposalRequest
  ): Promise<ConcludeProposalResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proposal/conclude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(concludeData),
      });

      const data: ConcludeProposalResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error concluding proposal:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to conclude proposal",
      };
    }
  },

  // Automatically conclude proposals that have exceeded their time limits
  autoConcludeProposals: async (
    proposals: Proposal[]
  ): Promise<{
    concluded: Array<{
      proposalId: string;
      type: "voting" | "feedback";
      success: boolean;
      error?: string;
    }>;
    total: number;
  }> => {
    const results: Array<{
      proposalId: string;
      type: "voting" | "feedback";
      success: boolean;
      error?: string;
    }> = [];

    for (const proposal of proposals) {
      const now = new Date();
      const votingEnd = new Date(proposal.voting_end);
      const feedbackEnd = new Date(proposal.feedback_end);

      // Check if voting needs to be concluded
      if (now > votingEnd && !proposal.conclusion) {
        try {
          const result = await daoService.concludeProposal({
            proposal_id: proposal.proposal_id,
            is_feedback: false,
          });

          results.push({
            proposalId: proposal.proposal_id,
            type: "voting",
            success: result.success,
            error: result.success ? undefined : result.message,
          });

          if (result.success) {
            console.log(
              `✅ Auto-concluded voting for proposal ${proposal.proposal_id.slice(
                0,
                8
              )}...`
            );
          } else {
            console.error(
              `❌ Failed to conclude voting for proposal ${proposal.proposal_id.slice(
                0,
                8
              )}...:`,
              result.message
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          results.push({
            proposalId: proposal.proposal_id,
            type: "voting",
            success: false,
            error: errorMessage,
          });
          console.error(
            `❌ Error concluding voting for proposal ${proposal.proposal_id.slice(
              0,
              8
            )}...:`,
            errorMessage
          );
        }
      }

      // Check if feedback needs to be concluded
      if (now > feedbackEnd && !proposal.feedback_conclusion) {
        try {
          const result = await daoService.concludeProposal({
            proposal_id: proposal.proposal_id,
            is_feedback: true,
          });

          results.push({
            proposalId: proposal.proposal_id,
            type: "feedback",
            success: result.success,
            error: result.success ? undefined : result.message,
          });

          if (result.success) {
            console.log(
              `✅ Auto-concluded feedback for proposal ${proposal.proposal_id.slice(
                0,
                8
              )}...`
            );
          } else {
            console.error(
              `❌ Failed to conclude feedback for proposal ${proposal.proposal_id.slice(
                0,
                8
              )}...:`,
              result.message
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          results.push({
            proposalId: proposal.proposal_id,
            type: "feedback",
            success: false,
            error: errorMessage,
          });
          console.error(
            `❌ Error concluding feedback for proposal ${proposal.proposal_id.slice(
              0,
              8
            )}...:`,
            errorMessage
          );
        }
      }
    }

    return {
      concluded: results,
      total: results.length,
    };
  },
};
