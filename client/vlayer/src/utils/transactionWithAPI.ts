import { PublicClient, WaitForTransactionReceiptReturnType } from "viem";
import { publicClient } from "./ethFaucet";

export interface TransactionWithAPIOptions {
  /**
   * Maximum time to wait for transaction confirmation (in milliseconds)
   * Default: 60000 (60 seconds)
   */
  timeout?: number;

  /**
   * Number of confirmations to wait for
   * Default: 1
   */
  confirmations?: number;

  /**
   * Custom public client to use for waiting
   */
  client?: PublicClient;

  /**
   * Callback to execute when transaction is confirmed
   */
  onTransactionConfirmed?: (
    receipt: WaitForTransactionReceiptReturnType
  ) => void;

  /**
   * Callback to execute when API call completes
   */
  onAPIComplete?: (result: any) => void;
}

/**
 * Executes an API call only after a transaction has been confirmed on-chain
 *
 * @param txHash The transaction hash to wait for
 * @param apiCall The API call function to execute after transaction confirmation
 * @param options Configuration options
 * @returns Promise that resolves with the API call result
 */
export async function executeAPIAfterTransaction<T>(
  txHash: `0x${string}`,
  apiCall: () => Promise<T>,
  options: TransactionWithAPIOptions = {}
): Promise<T> {
  const {
    timeout = 60000,
    confirmations = 1,
    client = publicClient,
    onTransactionConfirmed,
    onAPIComplete,
  } = options;

  try {
    console.log(`⏳ Waiting for transaction ${txHash} to be confirmed...`);

    // Wait for transaction receipt with timeout
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations,
      timeout,
    });

    console.log(
      `✅ Transaction ${txHash} confirmed in block ${receipt.blockNumber}`
    );

    // Call the confirmation callback if provided
    onTransactionConfirmed?.(receipt);

    // Now execute the API call
    console.log(`🚀 Executing API call after transaction settlement...`);
    const result = await apiCall();

    console.log(`✅ API call completed successfully`);

    // Call the completion callback if provided
    onAPIComplete?.(result);

    return result;
  } catch (error) {
    console.error(`❌ Error in executeAPIAfterTransaction:`, error);
    throw error;
  }
}

/**
 * Creates a wrapper function that ensures API calls wait for transaction settlement
 *
 * @param apiFunction The original API function
 * @param options Default options for transaction waiting
 * @returns A wrapped function that takes a transaction hash as first parameter
 */
export function createTransactionAwareAPI<TArgs extends any[], TReturn>(
  apiFunction: (...args: TArgs) => Promise<TReturn>,
  options: TransactionWithAPIOptions = {}
) {
  return async (txHash: `0x${string}`, ...args: TArgs): Promise<TReturn> => {
    return executeAPIAfterTransaction(
      txHash,
      () => apiFunction(...args),
      options
    );
  };
}

/**
 * Utility type for functions that return transaction hashes
 */
export type TransactionFunction = (...args: any[]) => Promise<`0x${string}`>;

/**
 * Utility type for API functions
 */
export type APIFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * Creates a combined function that executes a transaction and then an API call
 *
 * @param transactionFn Function that executes the transaction and returns a hash
 * @param apiFn Function that makes the API call
 * @param options Configuration options
 * @returns Combined function that executes both in sequence
 */
export function createTransactionThenAPI<
  TxArgs extends any[],
  ApiArgs extends any[],
  ApiReturn
>(
  transactionFn: (...args: TxArgs) => Promise<`0x${string}`>,
  apiFn: (...args: ApiArgs) => Promise<ApiReturn>,
  options: TransactionWithAPIOptions = {}
) {
  return async (
    txArgs: TxArgs,
    apiArgs: ApiArgs
  ): Promise<{ txHash: `0x${string}`; apiResult: ApiReturn }> => {
    // Execute the transaction
    const txHash = await transactionFn(...txArgs);

    // Wait for transaction and then execute API call
    const apiResult = await executeAPIAfterTransaction(
      txHash,
      () => apiFn(...apiArgs),
      options
    );

    return { txHash, apiResult };
  };
}

/**
 * Batch execute multiple API calls after a transaction is confirmed
 *
 * @param txHash The transaction hash to wait for
 * @param apiCalls Array of API call functions to execute
 * @param options Configuration options
 * @returns Promise that resolves with array of API call results
 */
export async function executeMultipleAPIsAfterTransaction<T extends any[]>(
  txHash: `0x${string}`,
  apiCalls: Array<() => Promise<any>>,
  options: TransactionWithAPIOptions = {}
): Promise<T> {
  const {
    timeout = 60000,
    confirmations = 1,
    client = publicClient,
    onTransactionConfirmed,
  } = options;

  try {
    console.log(`⏳ Waiting for transaction ${txHash} to be confirmed...`);

    // Wait for transaction receipt
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations,
      timeout,
    });

    console.log(
      `✅ Transaction ${txHash} confirmed in block ${receipt.blockNumber}`
    );

    // Call the confirmation callback if provided
    onTransactionConfirmed?.(receipt);

    // Execute all API calls in parallel
    console.log(
      `🚀 Executing ${apiCalls.length} API calls after transaction settlement...`
    );
    const results = await Promise.all(apiCalls.map((call) => call()));

    console.log(`✅ All API calls completed successfully`);

    return results as T;
  } catch (error) {
    console.error(`❌ Error in executeMultipleAPIsAfterTransaction:`, error);
    throw error;
  }
}
