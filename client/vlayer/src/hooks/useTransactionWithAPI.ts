import { useState, useEffect, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import { ensureBalance } from "../utils/ethFaucet";

export interface TransactionWithAPIConfig {
  onSuccess?: (txHash: string, receipt: any) => void;
  onError?: (error: Error) => void;
  enableToast?: boolean;
  chainId?: string;
}

export interface TransactionWithAPIResult {
  executeTransaction: (contractArgs: any) => Promise<void>;
  executeAPI: (apiCall: () => Promise<any>) => Promise<any>;
  executeTransactionThenAPI: (
    contractArgs: any,
    apiCall: () => Promise<any>
  ) => Promise<any>;
  isTransactionPending: boolean;
  isAPIExecuting: boolean;
  isLoading: boolean;
  txHash: string | undefined;
  txStatus: string | undefined;
  error: string | null;
  reset: () => void;
}

/**
 * Custom hook that ensures API requests wait for on-chain transaction settlement
 *
 * @param config Configuration options for the hook
 * @returns Object with methods to execute transactions and API calls in sequence
 */
export const useTransactionWithAPI = (
  config: TransactionWithAPIConfig = {}
): TransactionWithAPIResult => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { openTxToast } = useNotification();

  const [isAPIExecuting, setIsAPIExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAPICall, setPendingAPICall] = useState<
    (() => Promise<any>) | null
  >(null);

  const {
    writeContract,
    data: txHash,
    error: contractError,
    isPending: isWritePending,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    status: txStatus,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction success - execute pending API call
  useEffect(() => {
    if (txStatus === "success" && pendingAPICall && receipt) {
      const executeAPICall = async () => {
        setIsAPIExecuting(true);
        try {
          const result = await pendingAPICall();
          config.onSuccess?.(txHash!, receipt);
          return result;
        } catch (apiError) {
          const errorMessage =
            apiError instanceof Error ? apiError.message : "API call failed";
          setError(errorMessage);
          config.onError?.(new Error(errorMessage));
          throw apiError;
        } finally {
          setIsAPIExecuting(false);
          setPendingAPICall(null);
        }
      };

      executeAPICall();
    }
  }, [txStatus, receipt, pendingAPICall, txHash, config]);

  // Handle transaction errors
  useEffect(() => {
    if (txStatus === "error" || receiptError) {
      const errorMessage = receiptError?.message || "Transaction failed";
      setError(errorMessage);
      config.onError?.(new Error(errorMessage));
      setPendingAPICall(null);
      setIsAPIExecuting(false);
    }
  }, [txStatus, receiptError, config]);

  // Handle contract write errors
  useEffect(() => {
    if (contractError) {
      const errorMessage = contractError.message;
      setError(errorMessage);
      config.onError?.(new Error(errorMessage));
      setPendingAPICall(null);
      setIsAPIExecuting(false);
    }
  }, [contractError, config]);

  // Show transaction toast
  useEffect(() => {
    if (txHash && config.enableToast !== false) {
      const chainId = config.chainId || "84532"; // Default to Base Sepolia
      openTxToast(chainId, txHash);
    }
  }, [txHash, config.enableToast, config.chainId, openTxToast]);

  const executeTransaction = useCallback(
    async (contractArgs: any) => {
      if (!address) {
        const error = new Error("Please connect your wallet");
        setError(error.message);
        config.onError?.(error);
        throw error;
      }

      setError(null);

      try {
        // Ensure sufficient balance before transaction
        await ensureBalance(address, balance?.value ?? 0n);

        // Execute the transaction
        writeContract(contractArgs);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to execute transaction";
        setError(errorMessage);
        config.onError?.(new Error(errorMessage));
        throw error;
      }
    },
    [address, balance, writeContract, config]
  );

  const executeAPI = useCallback(
    async (apiCall: () => Promise<any>) => {
      setIsAPIExecuting(true);
      setError(null);

      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "API call failed";
        setError(errorMessage);
        config.onError?.(new Error(errorMessage));
        throw error;
      } finally {
        setIsAPIExecuting(false);
      }
    },
    [config]
  );

  const executeTransactionThenAPI = useCallback(
    async (contractArgs: any, apiCall: () => Promise<any>) => {
      // Store the API call to be executed after transaction settlement
      setPendingAPICall(() => apiCall);

      // Execute the transaction
      await executeTransaction(contractArgs);

      // The API call will be executed automatically when the transaction settles
      // due to the useEffect above
    },
    [executeTransaction]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsAPIExecuting(false);
    setPendingAPICall(null);
    resetWriteContract();
  }, [resetWriteContract]);

  return {
    executeTransaction,
    executeAPI,
    executeTransactionThenAPI,
    isTransactionPending: isWritePending,
    isAPIExecuting,
    isLoading: isWritePending || isAPIExecuting,
    txHash,
    txStatus,
    error,
    reset,
  };
};
