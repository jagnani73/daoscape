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
  useChain,
} from "@vlayer/react";
import { useNotification } from "@blockscout/app-sdk";
import { preverifyEmail } from "@vlayer/sdk";
import proverSpec from "../constants/EmailDomainProver.json";
import verifierSpec from "../constants/EmailDomainVerifier.json";
import { AbiStateMutability, ContractFunctionArgs } from "viem";
import debug from "debug";

const log = debug("vlayer:email-proof-verification");

enum ProofVerificationStep {
  IDLE = "idle",
  SENDING_TO_PROVER = "Sending to prover...",
  WAITING_FOR_PROOF = "Waiting for proof...",
  VERIFYING_ON_CHAIN = "Verifying on-chain...",
  DONE = "Done!",
}

interface EmailVerificationData {
  emailId: string;
  address: string;
  subject: string;
  uniqueEmail: string;
  timestamp: number;
}

export const useEmailProofVerification = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { openTxToast } = useNotification();
  const [currentStep, setCurrentStep] = useState<ProofVerificationStep>(
    ProofVerificationStep.IDLE
  );
  const [emailDomain, setEmailDomain] = useState<string>();
  const [error, setError] = useState<string>();

  const {
    writeContract,
    data: txHash,
    error: verificationError,
    status,
  } = useWriteContract();

  const { status: onChainVerificationStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { chain, error: chainError } = useChain(
    import.meta.env.VITE_CHAIN_NAME
  );

  const {
    callProver,
    data: proofHash,
    error: callProverError,
  } = useCallProver({
    address: import.meta.env.VITE_EMAIL_PROVER_ADDRESS,
    // @ts-expect-error - Prover Spec is not typed
    proverAbi: proverSpec.abi,
    functionName: "main",
    gasLimit: Number(import.meta.env.VITE_GAS_LIMIT || "1000000"),
    chainId: chain?.id,
  });

  const { data: proof, error: provingError } =
    useWaitForProvingResult(proofHash);

  const fetchEmailContent = async (emailId: string): Promise<string> => {
    const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL;
    const response = await fetch(`${emailServiceUrl}/${emailId}.eml`);
    if (!response.ok) {
      throw new Error("Failed to fetch email content");
    }
    return await response.text();
  };

  const extractDomainFromEmail = (emailContent: string): string | null => {
    const dkimMatch = emailContent.match(/DKIM-Signature:.*?d=([^;]+)/i);
    if (dkimMatch) {
      return dkimMatch[1].trim();
    }

    const fromMatch = emailContent.match(/From:.*?@([^\s>]+)/i);
    if (fromMatch) {
      return fromMatch[1].trim();
    }

    return null;
  };

  const verifyProofOnChain = async () => {
    setCurrentStep(ProofVerificationStep.VERIFYING_ON_CHAIN);

    if (!proof) {
      throw new Error("No proof available to verify on-chain");
    }

    const contractArgs: Parameters<typeof writeContract>[0] = {
      address: import.meta.env.VITE_EMAIL_VERIFIER_ADDRESS,
      abi: verifierSpec.abi,
      functionName: "verify",
      args: proof as unknown as ContractFunctionArgs<
        typeof verifierSpec.abi,
        AbiStateMutability,
        "verify"
      >,
    };

    writeContract(contractArgs);
  };

  const startProving = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setCurrentStep(ProofVerificationStep.SENDING_TO_PROVER);
    setError(undefined);

    try {
      const emailDataStr = localStorage.getItem("emailVerificationData");
      if (!emailDataStr) {
        setError("No email data found. Please send an email first.");
        return;
      }

      const emailData: EmailVerificationData = JSON.parse(emailDataStr);

      const emlContent = await fetchEmailContent(emailData.emailId);

      const domain = extractDomainFromEmail(emlContent);
      if (domain) {
        setEmailDomain(domain);
      }

      const email = await preverifyEmail({
        mimeEmail: emlContent,
        dnsResolverUrl: import.meta.env.VITE_DNS_SERVICE_URL,
        token: import.meta.env.VITE_VLAYER_API_TOKEN,
      });

      setCurrentStep(ProofVerificationStep.WAITING_FOR_PROOF);
      await callProver([email]);
    } catch (error) {
      console.error("Error in startProving:", error);
      setError(
        `Failed to generate proof: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  };

  // Effects
  useEffect(() => {
    if (chainError) {
      setError(`Chain error: ${chainError}`);
    }
  }, [chainError]);

  useEffect(() => {
    if (callProverError) {
      setError(`Prover error: ${callProverError.message}`);
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  }, [callProverError]);

  useEffect(() => {
    if (provingError) {
      setError(`Proving error: ${provingError.message}`);
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  }, [provingError]);

  useEffect(() => {
    if (proof) {
      log("proof", proof);
      void verifyProofOnChain();
    }
  }, [proof]);

  useEffect(() => {
    if (status === "success" && proof) {
      setCurrentStep(ProofVerificationStep.DONE);
    }
  }, [status, proof]);

  // Show transaction toast when txHash is available
  useEffect(() => {
    if (txHash && chain?.id) {
      openTxToast(chain.id.toString(), txHash);
    }
  }, [txHash, chain?.id, openTxToast]);

  useEffect(() => {
    if (verificationError) {
      if (verificationError.message.includes("already been minted")) {
        setError("This email has already been verified");
      } else {
        setError(`Transaction error: ${verificationError.message}`);
      }
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  }, [verificationError]);

  useEffect(() => {
    if (onChainVerificationStatus === "error") {
      setError("Transaction failed. Please try again.");
      setCurrentStep(ProofVerificationStep.IDLE);
    }
  }, [onChainVerificationStatus]);

  return {
    currentStep,
    txHash,
    onChainVerificationStatus,
    verificationError,
    provingError,
    startProving,
    emailDomain,
    error,
    isGeneratingProof:
      currentStep === ProofVerificationStep.SENDING_TO_PROVER ||
      currentStep === ProofVerificationStep.WAITING_FOR_PROOF,
    isVerifying: currentStep === ProofVerificationStep.VERIFYING_ON_CHAIN,
    proofGenerated: !!proof,
    verificationComplete: currentStep === ProofVerificationStep.DONE,
  };
};
