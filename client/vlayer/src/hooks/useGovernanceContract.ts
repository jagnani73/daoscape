import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useBalance,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import { ensureBalance } from "../utils/ethFaucet";
import governanceAbi from "../../../out/Governance.sol/Governance.json";

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

export const useGovernanceContract = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { openTxToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: txHash,
    error: contractError,
    isPending: isWritePending,
  } = useWriteContract();

  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const governanceAddress = import.meta.env
    .VITE_GOVERNANCE_ADDRESS as `0x${string}`;

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
    }
  }, [contractError]);

  // Effect to open transaction toast
  useEffect(() => {
    if (txHash) {
      openTxToast("84532", txHash); // Base Sepolia chain ID
    }
  }, [txHash, openTxToast]);

  // Create a new proposal
  const createProposal = async (params: CreateProposalParams) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureBalance(address, balance?.value ?? 0n);

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
    } catch (error) {
      setIsLoading(false);
      setError(
        error instanceof Error ? error.message : "Failed to create proposal"
      );
    }
  };

  // Vote on a proposal
  const voteYes = async (daoId: string, proposalId: string) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureBalance(address, balance?.value ?? 0n);

      writeContract({
        address: governanceAddress,
        abi: governanceAbi.abi,
        functionName: "voteYes",
        args: [daoId, proposalId],
      });
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Failed to vote");
    }
  };

  const voteNo = async (daoId: string, proposalId: string) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureBalance(address, balance?.value ?? 0n);

      writeContract({
        address: governanceAddress,
        abi: governanceAbi.abi,
        functionName: "voteNo",
        args: [daoId, proposalId],
      });
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Failed to vote");
    }
  };

  const voteAbstain = async (daoId: string, proposalId: string) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureBalance(address, balance?.value ?? 0n);

      writeContract({
        address: governanceAddress,
        abi: governanceAbi.abi,
        functionName: "voteAbstain",
        args: [daoId, proposalId],
      });
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Failed to vote");
    }
  };

  // Deactivate a proposal (only creator can call)
  const deactivateProposal = async (daoId: string, proposalId: string) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureBalance(address, balance?.value ?? 0n);

      writeContract({
        address: governanceAddress,
        abi: governanceAbi.abi,
        functionName: "deactivateProposal",
        args: [daoId, proposalId],
      });
    } catch (error) {
      setIsLoading(false);
      setError(
        error instanceof Error ? error.message : "Failed to deactivate proposal"
      );
    }
  };

  return {
    createProposal,
    voteYes,
    voteNo,
    voteAbstain,
    deactivateProposal,
    isLoading: isLoading || isWritePending,
    error,
    txHash,
    txStatus,
  };
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
