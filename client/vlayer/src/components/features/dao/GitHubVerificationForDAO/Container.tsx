import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { DAO } from "../../../../types/dao";
import { daoService } from "../../../../services/daoService";
import { GitHubVerificationForDAO } from "./Presentational";
import { useGitHubProofVerification } from "../../../../hooks/useGitHubProofVerification";

interface GitHubVerificationForDAOContainerProps {
  daoId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GitHubVerificationForDAOContainer: React.FC<
  GitHubVerificationForDAOContainerProps
> = ({ daoId, onSuccess, onError }) => {
  const { address } = useAccount();
  const [dao, setDAO] = useState<DAO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string>();
  const [githubStep, setGithubStep] = useState<"input" | "verify" | "submit">(
    "input"
  );

  // GitHub form state
  const [githubUsername, setGithubUsername] = useState("");
  const [repoOwner, setRepoOwner] = useState("covalenthq");
  const [repoName, setRepoName] = useState("ai-agent-sdk");
  const [branch, setBranch] = useState("main");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    startProving,
    isGeneratingProof,
    verificationComplete,
    error: proofError,
    txHash,
  } = useGitHubProofVerification(githubUsername, repoOwner, repoName, branch);

  useEffect(() => {
    const loadDAO = async () => {
      if (daoId) {
        try {
          const daoData = await daoService.getDAOById(daoId);
          setDAO(daoData);
        } catch (error) {
          console.error("Error loading DAO:", error);
          setError("Failed to load DAO information");
        }
      }
    };

    loadDAO();
  }, [daoId]);

  // Handle verification complete
  useEffect(() => {
    if (verificationComplete) {
      setGithubStep("submit");
    }
  }, [verificationComplete]);

  // Handle errors
  useEffect(() => {
    if (proofError) {
      setError(proofError);
    }
  }, [proofError]);

  const handleGitHubUsernameChange = (username: string) => {
    setGithubUsername(username);
  };

  const handleRepoDetailsChange = (
    owner: string,
    name: string,
    branchName: string
  ) => {
    setRepoOwner(owner);
    setRepoName(name);
    setBranch(branchName);
  };

  const handleVerifyContribution = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!githubUsername || !repoOwner || !repoName || !branch) {
      setError("Please fill in all GitHub details");
      return;
    }

    setIsVerifying(true);
    setError(undefined);

    try {
      // Simulate GitHub contribution verification
      // In a real implementation, this would call the GitHub API or use web scraping
      // to verify that the user has contributed to the repository

      // For demo purposes, we'll simulate a successful verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store verification data for proof generation
      localStorage.setItem(
        "githubVerificationData",
        JSON.stringify({
          githubUsername,
          repoOwner,
          repoName,
          branch,
          address,
          timestamp: Date.now(),
        })
      );

      setGithubStep("verify");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to verify GitHub contribution";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateProof = () => {
    if (!githubUsername || !repoOwner || !repoName || !branch) {
      setError("Missing GitHub verification data");
      return;
    }

    startProving(githubUsername);
  };

  const handleSubmitToDAO = async () => {
    if (!address || !dao || !verificationComplete) {
      setError("Please complete GitHub verification first");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      // Submit to DAO backend with blockchain verification proof
      const response = await fetch(
        `${import.meta.env.VITE_BE_API_URL}/api/v1/membership/github-verified`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: address,
            dao_id: daoId,
            tx_hash: txHash,
            github_username: githubUsername,
            repo_owner: repoOwner,
            repo_name: repoName,
            branch: branch,
            verification_type: "vlayer_proof",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setIsVerified(true);
        onSuccess?.();
        localStorage.removeItem("githubVerificationData");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit GitHub verification");
        onError?.(errorData.message || "Failed to submit GitHub verification");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Network error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationStatus = () => {
    if (githubStep === "input") {
      return {
        isGitHubVerified: false,
        isProofGenerated: false,
        isBlockchainVerified: false,
      };
    } else if (githubStep === "verify") {
      return {
        isGitHubVerified: true,
        isProofGenerated: verificationComplete,
        isBlockchainVerified: verificationComplete,
      };
    } else {
      return {
        isGitHubVerified: true,
        isProofGenerated: true,
        isBlockchainVerified: true,
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <GitHubVerificationForDAO
      dao={dao}
      githubStep={githubStep}
      githubUsername={githubUsername}
      repoOwner={repoOwner}
      repoName={repoName}
      branch={branch}
      isGitHubVerified={status.isGitHubVerified}
      isProofGenerated={status.isProofGenerated}
      isBlockchainVerified={status.isBlockchainVerified}
      isGeneratingProof={isGeneratingProof}
      isVerifying={isVerifying}
      isSubmitting={isSubmitting}
      isVerified={isVerified}
      error={error}
      txHash={txHash}
      onGitHubUsernameChange={handleGitHubUsernameChange}
      onRepoDetailsChange={handleRepoDetailsChange}
      onVerifyContribution={handleVerifyContribution}
      onGenerateProof={handleGenerateProof}
      onSubmitToDAO={handleSubmitToDAO}
    />
  );
};
