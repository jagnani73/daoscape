import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useBalance,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import { ensureBalance } from "../utils/ethFaucet";
import governanceAbi from "../constants/Governance.json";

export interface ProposalData {
  title: string;
  creator: string;
  active: boolean;
  startTime: bigint;
  endTime: bigint;
}

export interface VoteData {
  voter: string;
  daoId: string;
  proposalId: string;
  voteType: number; // 0 = no, 1 = yes, 2 = abstain
}

export interface VoteCounts {
  yesVotes: bigint;
  noVotes: bigint;
  abstainVotes: bigint;
}

export interface CreateProposalParams {
  daoId: string;
  proposalId: string;
  title: string;
  creator: string;
  startTime: bigint;
  endTime: bigint;
}

export interface GovernanceContractResult {
  createProposal: (params: CreateProposalParams) => Promise<`0x${string}`>;
  voteYes: (daoId: string, proposalId: string) => Promise<`0x${string}`>;
  voteNo: (daoId: string, proposalId: string) => Promise<`0x${string}`>;
  voteAbstain: (daoId: string, proposalId: string) => Promise<`0x${string}`>;
  deactivateProposal: (
    daoId: string,
    proposalId: string
  ) => Promise<`0x${string}`>;
  isLoading: boolean;
  error: string | null;
  txHash: string | undefined;
  txStatus: string | undefined;
  reset: () => void;
}

export const useGovernanceContract = (): GovernanceContractResult => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { openTxToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResolvers, setPendingResolvers] = useState<
    Map<string, (hash: `0x${string}`) => void>
  >(new Map());

  const {
    writeContract,
    data: txHash,
    error: contractError,
    isPending: isWritePending,
    reset: resetWriteContract,
  } = useWriteContract();

  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const governanceAddress = import.meta.env
    .VITE_GOVERNANCE_ADDRESS as `0x${string}`;

  // Handle new transaction hash
  useEffect(() => {
    if (txHash) {
      // Resolve any pending promises with the transaction hash
      pendingResolvers.forEach((resolve) => {
        resolve(txHash);
      });
      setPendingResolvers(new Map());
    }
  }, [txHash, pendingResolvers]);

  useEffect(() => {
    if (txStatus === "success") {
      setIsLoading(false);
      setError(null);
    } else if (txStatus === "error") {
      setIsLoading(false);
      setError("Transaction failed");
    }
  }, [txStatus]);

  // Effect to handle contract errors
  useEffect(() => {
    if (contractError) {
      setIsLoading(false);
      setError(contractError.message);
      // Reject any pending promises
      pendingResolvers.forEach((resolve, key) => {
        // We can't reject here since we only have resolve, but we clear them
      });
      setPendingResolvers(new Map());
    }
  }, [contractError, pendingResolvers]);

  useEffect(() => {
    if (txHash) {
      console.log("🔗 Transaction hash:", txHash);
      openTxToast("84532", txHash);
    }
  }, [txHash, openTxToast]);

  // Create a new proposal
  const createProposal = useCallback(
    async (params: CreateProposalParams): Promise<`0x${string}`> => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        throw error;
      }

      setIsLoading(true);
      setError(null);

      try {
        await ensureBalance(address, balance?.value ?? 0n);

        return new Promise<`0x${string}`>((resolve, reject) => {
          const requestId = Math.random().toString(36);
          setPendingResolvers((prev) => new Map(prev).set(requestId, resolve));

          writeContract({
            address: governanceAddress,
            abi: governanceAbi.abi,
            functionName: "createProposal",
            args: [
              params.daoId,
              params.proposalId,
              params.title,
              params.creator,
              params.startTime,
              params.endTime,
            ],
          });

          // Set a timeout to reject if no response
          setTimeout(() => {
            setPendingResolvers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(requestId);
              return newMap;
            });
            reject(new Error("Transaction timeout"));
          }, 30000);
        });
      } catch (error) {
        setIsLoading(false);
        setError(
          error instanceof Error ? error.message : "Failed to create proposal"
        );
        throw error;
      }
    },
    [address, balance, writeContract, governanceAddress]
  );

  // Vote on a proposal - Yes
  const voteYes = useCallback(
    async (daoId: string, proposalId: string): Promise<`0x${string}`> => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        throw error;
      }

      setIsLoading(true);
      setError(null);

      try {
        await ensureBalance(address, balance?.value ?? 0n);

        return new Promise<`0x${string}`>((resolve, reject) => {
          const requestId = Math.random().toString(36);
          setPendingResolvers((prev) => new Map(prev).set(requestId, resolve));

          writeContract({
            address: governanceAddress,
            abi: governanceAbi.abi,
            functionName: "voteYes",
            args: [daoId, proposalId],
          });

          setTimeout(() => {
            setPendingResolvers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(requestId);
              return newMap;
            });
            reject(new Error("Transaction timeout"));
          }, 5000);
        });
      } catch (error) {
        setIsLoading(false);
        setError(error instanceof Error ? error.message : "Failed to vote");
        throw error;
      }
    },
    [address, balance, writeContract, governanceAddress]
  );

  const voteNo = useCallback(
    async (daoId: string, proposalId: string): Promise<`0x${string}`> => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        throw error;
      }

      setIsLoading(true);
      setError(null);

      try {
        await ensureBalance(address, balance?.value ?? 0n);

        return new Promise<`0x${string}`>((resolve, reject) => {
          const requestId = Math.random().toString(36);
          setPendingResolvers((prev) => new Map(prev).set(requestId, resolve));

          writeContract({
            address: governanceAddress,
            abi: governanceAbi.abi,
            functionName: "voteNo",
            args: [daoId, proposalId],
          });

          setTimeout(() => {
            setPendingResolvers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(requestId);
              return newMap;
            });
            reject(new Error("Transaction timeout"));
          }, 30000);
        });
      } catch (error) {
        setIsLoading(false);
        setError(error instanceof Error ? error.message : "Failed to vote");
        throw error;
      }
    },
    [address, balance, writeContract, governanceAddress]
  );

  const voteAbstain = useCallback(
    async (daoId: string, proposalId: string): Promise<`0x${string}`> => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        throw error;
      }

      setIsLoading(true);
      setError(null);

      try {
        await ensureBalance(address, balance?.value ?? 0n);

        return new Promise<`0x${string}`>((resolve, reject) => {
          const requestId = Math.random().toString(36);
          setPendingResolvers((prev) => new Map(prev).set(requestId, resolve));

          writeContract({
            address: governanceAddress,
            abi: governanceAbi.abi,
            functionName: "voteAbstain",
            args: [daoId, proposalId],
          });

          setTimeout(() => {
            setPendingResolvers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(requestId);
              return newMap;
            });
            reject(new Error("Transaction timeout"));
          }, 30000);
        });
      } catch (error) {
        setIsLoading(false);
        setError(error instanceof Error ? error.message : "Failed to vote");
        throw error;
      }
    },
    [address, balance, writeContract, governanceAddress]
  );

  // Deactivate a proposal (only creator can call)
  const deactivateProposal = useCallback(
    async (daoId: string, proposalId: string): Promise<`0x${string}`> => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        throw error;
      }

      setIsLoading(true);
      setError(null);

      try {
        await ensureBalance(address, balance?.value ?? 0n);

        return new Promise<`0x${string}`>((resolve, reject) => {
          const requestId = Math.random().toString(36);
          setPendingResolvers((prev) => new Map(prev).set(requestId, resolve));

          writeContract({
            address: governanceAddress,
            abi: governanceAbi.abi,
            functionName: "deactivateProposal",
            args: [daoId, proposalId],
          });

          setTimeout(() => {
            setPendingResolvers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(requestId);
              return newMap;
            });
            reject(new Error("Transaction timeout"));
          }, 30000);
        });
      } catch (error) {
        setIsLoading(false);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to deactivate proposal"
        );
        throw error;
      }
    },
    [address, balance, writeContract, governanceAddress]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setPendingResolvers(new Map());
    resetWriteContract();
  }, [resetWriteContract]);

  return useMemo(
    () => ({
      createProposal,
      voteYes,
      voteNo,
      voteAbstain,
      deactivateProposal,
      isLoading: isLoading || isWritePending,
      error,
      txHash,
      txStatus,
      reset,
    }),
    [
      createProposal,
      voteYes,
      voteNo,
      voteAbstain,
      deactivateProposal,
      isLoading,
      isWritePending,
      error,
      txHash,
      txStatus,
      reset,
    ]
  );
};

// Hook for reading contract data
export const useGovernanceRead = () => {
  const governanceAddress = import.meta.env
    .VITE_GOVERNANCE_ADDRESS as `0x${string}`;

  // Get proposal details
  const useProposal = (daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getProposal",
      args: [daoId, proposalId],
      query: {
        enabled: !!daoId && !!proposalId,
      },
    });
  };

  // Get vote counts for a proposal
  const useVoteCounts = (daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getVoteCounts",
      args: [daoId, proposalId],
      query: {
        enabled: !!daoId && !!proposalId,
      },
    });
  };

  // Get user's vote for a proposal
  const useAddressVote = (voter: string, daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getAddressVote",
      args: [voter, daoId, proposalId],
      query: {
        enabled: !!voter && !!daoId && !!proposalId,
      },
    });
  };

  // Get all proposal IDs for a DAO
  const useDaoProposals = (daoId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getDaoProposals",
      args: [daoId],
      query: {
        enabled: !!daoId,
      },
    });
  };

  // Get proposal voters
  const useProposalVoters = (daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getProposalVoters",
      args: [daoId, proposalId],
      query: {
        enabled: !!daoId && !!proposalId,
      },
    });
  };

  // Check if proposal exists
  const useProposalExists = (daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "proposalExists",
      args: [daoId, proposalId],
      query: {
        enabled: !!daoId && !!proposalId,
      },
    });
  };

  // Check if voting is active
  const useIsVotingActive = (daoId: string, proposalId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "isVotingActive",
      args: [daoId, proposalId],
      query: {
        enabled: !!daoId && !!proposalId,
      },
    });
  };

  // Get DAO proposal count
  const useDaoProposalCount = (daoId: string) => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getDaoProposalCount",
      args: [daoId],
      query: {
        enabled: !!daoId,
      },
    });
  };

  // Get total votes
  const useTotalVotes = () => {
    return useReadContract({
      address: governanceAddress,
      abi: governanceAbi.abi,
      functionName: "getTotalVotes",
    });
  };

  return {
    useProposal,
    useVoteCounts,
    useAddressVote,
    useDaoProposals,
    useProposalVoters,
    useProposalExists,
    useIsVotingActive,
    useDaoProposalCount,
    useTotalVotes,
  };
};
