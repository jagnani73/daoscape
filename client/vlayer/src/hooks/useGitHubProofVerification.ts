import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
} from "wagmi";
import {
  useCallProver,
  useWaitForProvingResult,
  useWebProof,
  useChain,
} from "@vlayer/react";
import { useNotification } from "@blockscout/app-sdk";
import { useLocalStorage } from "usehooks-ts";
import { WebProofConfig, ProveArgs } from "@vlayer/sdk";
import { Abi, ContractFunctionName } from "viem";
import { startPage, expectUrl, notarize } from "@vlayer/sdk/web_proof";
import { UseChainError, WebProofError } from "../errors";
import proverSpec from "../../../out/GitHubProver.sol/GitHubProver.json";
import verifierSpec from "../../../out/GitHubVerifier.sol/GitHubVerifier.json";
import { AbiStateMutability, ContractFunctionArgs } from "viem";
import debug from "debug";

const log = debug("vlayer:github-proof-verification");

enum ProofVerificationStep {
  IDLE = "idle",
  SENDING_TO_PROVER = "Sending to prover...",
  WAITING_FOR_PROOF = "Waiting for proof...",
  VERIFYING_ON_CHAIN = "Verifying on-chain...",
  DONE = "Done!",
}

// Create web proof configuration for GitHub
const createGitHubWebProofConfig = (
  repoOwner: string,
  repoName: string,
  branch: string
): WebProofConfig<Abi, string> => {
  const githubCommitsUrl = `https://github.com/${repoOwner}/${repoName}/commits/`;

  return {
    proverCallCommitment: {
      address: import.meta.env.VITE_GITHUB_PROVER_ADDRESS as `0x${string}`,
      proverAbi: proverSpec.abi as Abi,
      functionName: "verifyGitHubCommit",
      commitmentArgs: [],
      chainId: 84532, // Base Sepolia
    },
    logoUrl: "https://github.com/favicon.ico",
    steps: [
      startPage(
        `https://github.com/${repoOwner}/${repoName}/commits/`,
        "Go to GitHub"
      ),
      expectUrl(
        githubCommitsUrl,
        `Navigate to ${repoOwner}/${repoName} commits on ${branch} branch`
      ),
      notarize(
        `${githubCommitsUrl}deferred_commit_contributors`,
        "GET",
        "Generate Proof of GitHub contributions",
        [
          {
            request: {
              headers_except: [],
            },
          },
          {
            response: {
              headers_except: ["Transfer-Encoding"],
            },
          },
        ]
      ),
    ],
  };
};

export const useGitHubProofVerification = (
  githubUsername?: string,
  repoOwner?: string,
  repoName?: string,
  branch?: string
) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { openTxToast } = useNotification();
  const [currentStep, setCurrentStep] = useState<ProofVerificationStep>(
    ProofVerificationStep.IDLE
  );
  const [error, setError] = useState<string>();

  // Only create web proof config when we have all required parameters
  const webProofConfig =
    repoOwner && repoName && branch
      ? createGitHubWebProofConfig(repoOwner, repoName, branch)
      : null;

  const {
    requestWebProof,
    webProof,
    isPending: isWebProofPending,
    error: webProofError,
  } = useWebProof(webProofConfig);

  if (webProofError) {
    throw new WebProofError(webProofError.message);
  }

  const {
    writeContract,
    data: txHash,
    error: verificationError,
    status,
  } = useWriteContract();

  const { status: onChainVerificationStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { chain, error: chainError } = useChain("baseSepolia");

  useEffect(() => {
    if (chainError) {
      setError(`Chain error: ${chainError.message}`);
    }
  }, [chainError]);

  const vlayerProverConfig: Omit<
    ProveArgs<Abi, ContractFunctionName<Abi>>,
    "args"
  > = {
    address: import.meta.env.VITE_GITHUB_PROVER_ADDRESS as `0x${string}`,
    proverAbi: proverSpec.abi as Abi,
    chainId: chain?.id,
    functionName: "verifyGitHubCommit",
    gasLimit: Number(import.meta.env.VITE_GAS_LIMIT || "1000000"),
  };

  const {
    callProver,
    isPending: isCallProverPending,
    isIdle: isCallProverIdle,
    data: hash,
    error: callProverError,
  } = useCallProver(vlayerProverConfig);

  if (callProverError) {
    throw callProverError;
  }

  const {
    isPending: isWaitingForProvingResult,
    data: result,
    error: waitForProvingResultError,
  } = useWaitForProvingResult(hash);

  if (waitForProvingResultError) {
    throw waitForProvingResultError;
  }

  const [, setWebProof] = useLocalStorage("githubWebProof", "");
  const [, setProverResult] = useLocalStorage("githubProverResult", "");

  useEffect(() => {
    if (webProof) {
      console.log("GitHub webProof received:", webProof);
      setWebProof(
        JSON.stringify(webProof, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      // Set step to waiting for proof when webProof is available
      if (currentStep === ProofVerificationStep.SENDING_TO_PROVER) {
        console.log("Setting step to WAITING_FOR_PROOF");
        setCurrentStep(ProofVerificationStep.WAITING_FOR_PROOF);
      }
    }
  }, [webProof, setWebProof, currentStep]);

  useEffect(() => {
    if (result) {
      console.log("GitHub proverResult", result);
      setProverResult(
        JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    }
  }, [result, setProverResult]);

  const verifyProofOnChain = async () => {
    setCurrentStep(ProofVerificationStep.VERIFYING_ON_CHAIN);

    if (!result) {
      throw new Error("No proof available to verify on-chain");
    }

    const contractArgs: Parameters<typeof writeContract>[0] = {
      address: import.meta.env.VITE_GITHUB_VERIFIER_ADDRESS as `0x${string}`,
      abi: verifierSpec.abi,
      functionName: "verifyGitHubCommit",
      args: result as unknown as ContractFunctionArgs<
        typeof verifierSpec.abi,
        AbiStateMutability,
        "verifyGitHubCommit"
      >,
    };

    writeContract(contractArgs);
  };

  const startProving = async (
    username: string,
    owner: string,
    name: string,
    branchName: string
  ) => {
    console.log("GitHub startProving called with:", {
      username,
      owner,
      name,
      branchName,
      address,
    });

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setCurrentStep(ProofVerificationStep.SENDING_TO_PROVER);
    setError(undefined);

    try {
      // Store GitHub verification data for later use
      const githubVerificationData = {
        githubUsername: username,
        repoOwner: owner,
        repoName: name,
        branch: branchName,
        address,
        timestamp: Date.now(),
      };

      console.log("Storing GitHub verification data:", githubVerificationData);

      localStorage.setItem(
        "githubVerificationData",
        JSON.stringify(githubVerificationData)
      );

      // Request web proof from user - this will open the vlayer extension
      console.log("Requesting web proof...");
      await requestWebProof();
      console.log("Web proof request completed");

      // Don't set step here - let the webProof availability drive the state
    } catch (error) {
      console.error("Error in startProving:", error);
      setError(
        `Failed to start proof generation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  };

  // When web proof is ready, call the prover
  useEffect(() => {
    console.log("GitHub useEffect triggered:", {
      webProof: !!webProof,
      currentStep,
      address: !!address,
      isCallProverIdle,
      hasGithubData: !!localStorage.getItem("githubVerificationData"),
    });

    if (
      webProof &&
      currentStep === ProofVerificationStep.WAITING_FOR_PROOF &&
      isCallProverIdle
    ) {
      const githubData = JSON.parse(
        localStorage.getItem("githubVerificationData") || "{}"
      );

      console.log("GitHub data from localStorage:", githubData);

      console.log("Calling GitHub prover with args:", [
        "webProof",
        githubData.repoOwner,
        githubData.repoName,
        githubData.branch,
        githubData.githubUsername,
        address,
      ]);

      callProver([
        webProof,
        githubData.repoOwner,
        githubData.repoName,
        githubData.branch,
        githubData.githubUsername,
        address,
      ]);
    }
  }, [webProof, currentStep, callProver, address, isCallProverIdle]);

  useEffect(() => {
    if (result && currentStep === ProofVerificationStep.WAITING_FOR_PROOF) {
      verifyProofOnChain();
    }
  }, [result, currentStep]);

  useEffect(() => {
    if (onChainVerificationStatus === "success") {
      setCurrentStep(ProofVerificationStep.DONE);
      if (txHash) {
        openTxToast(txHash, "Transaction successful");
      }
    }
  }, [onChainVerificationStatus, txHash, openTxToast]);

  const isGeneratingProof =
    currentStep === ProofVerificationStep.SENDING_TO_PROVER ||
    currentStep === ProofVerificationStep.WAITING_FOR_PROOF ||
    isWebProofPending ||
    isCallProverPending;

  const isVerifying = currentStep === ProofVerificationStep.VERIFYING_ON_CHAIN;

  const verificationComplete = currentStep === ProofVerificationStep.DONE;

  return {
    requestWebProof,
    webProof,
    startProving,
    isGeneratingProof,
    isVerifying,
    verificationComplete,
    error,
    txHash,
    currentStep,
    isPending:
      isWebProofPending || isCallProverPending || isWaitingForProvingResult,
    isCallProverIdle,
    isWaitingForProvingResult,
    isWebProofPending,
    callProver,
    result,
  };
};
