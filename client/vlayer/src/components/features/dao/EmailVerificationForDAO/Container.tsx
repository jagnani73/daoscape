import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { v4 as uuidv4 } from "uuid";
import { EmailVerificationForDAO } from "./Presentational";
import { useEmailInbox } from "../../../../hooks/useEmailInbox";
import { useEmailProofVerification } from "../../../../hooks/useEmailProofVerification";
import { daoService } from "../../../../services/daoService";
import { DAO } from "../../../../types/dao";

interface EmailVerificationForDAOContainerProps {
  daoId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EmailVerificationForDAOContainer: React.FC<
  EmailVerificationForDAOContainerProps
> = ({ daoId, onSuccess, onError }) => {
  const { address } = useAccount();
  const [dao, setDAO] = useState<DAO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string>();
  const [emailId] = useState(() => uuidv4());
  const [isPolling, setIsPolling] = useState(false);
  const [emailStep, setEmailStep] = useState<"send" | "verify" | "submit">(
    "send"
  );
  const [emailSentConfirmed, setEmailSentConfirmed] = useState(false);

  const subject = `Verify my email at address: ${address}`;
  const uniqueEmail = `${emailId}@proving.vlayer.xyz`;

  const {
    emlFetched,
    isLoading: emailLoading,
    error: emailError,
  } = useEmailInbox(emailSentConfirmed && isPolling ? emailId : undefined);

  const {
    startProving,
    isGeneratingProof,
    isVerifying,
    verificationComplete,
    error: proofError,
    txHash,
    emailDomain,
  } = useEmailProofVerification();

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

  // Handle email received
  useEffect(() => {
    if (emlFetched) {
      setIsPolling(false);
      localStorage.setItem(
        "emailVerificationData",
        JSON.stringify({
          emailId,
          address,
          subject,
          uniqueEmail,
          timestamp: Date.now(),
        })
      );
      setEmailStep("verify");
    }
  }, [emlFetched, emailId, address, subject, uniqueEmail]);

  // Handle verification complete
  useEffect(() => {
    if (verificationComplete) {
      setEmailStep("submit");
    }
  }, [verificationComplete]);

  // Handle errors
  useEffect(() => {
    if (emailError) {
      setError(emailError);
      setIsPolling(false);
    }
  }, [emailError]);

  useEffect(() => {
    if (proofError) {
      setError(proofError);
    }
  }, [proofError]);

  const handleEmailSentConfirmation = () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    setError(undefined);
    setEmailSentConfirmed(true);
    setIsPolling(true);
  };

  const handleGenerateProof = () => {
    startProving();
  };

  const handleSubmitToDAO = async () => {
    if (!address || !dao || !verificationComplete) {
      setError("Please complete email verification first");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      // Submit to DAO backend with blockchain verification proof
      const response = await fetch(
        `${import.meta.env.VITE_BE_API_URL}/api/v1/membership/email-verified`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: address,
            dao_id: daoId,
            tx_hash: txHash,
            email_domain: emailDomain,
            verification_type: "vlayer_proof",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setIsVerified(true);
        onSuccess?.();
        localStorage.removeItem("emailVerificationData");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit email verification");
        onError?.(errorData.message || "Failed to submit email verification");
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
    if (emailStep === "send") {
      return {
        isEmailVerified: false,
        isProofGenerated: false,
        isBlockchainVerified: false,
      };
    } else if (emailStep === "verify") {
      return {
        isEmailVerified: true,
        isProofGenerated: verificationComplete,
        isBlockchainVerified: verificationComplete,
      };
    } else {
      return {
        isEmailVerified: true,
        isProofGenerated: true,
        isBlockchainVerified: true,
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <EmailVerificationForDAO
      dao={dao}
      emailStep={emailStep}
      subject={subject}
      uniqueEmail={uniqueEmail}
      isEmailVerified={status.isEmailVerified}
      isProofGenerated={status.isProofGenerated}
      isBlockchainVerified={status.isBlockchainVerified}
      emailSentConfirmed={emailSentConfirmed}
      isPolling={isPolling}
      isEmailLoading={emailLoading}
      isGeneratingProof={isGeneratingProof}
      isVerifying={isVerifying}
      isSubmitting={isSubmitting}
      isVerified={isVerified}
      error={error}
      txHash={txHash}
      emailDomain={emailDomain}
      onEmailSentConfirmation={handleEmailSentConfirmation}
      onGenerateProof={handleGenerateProof}
      onSubmitToDAO={handleSubmitToDAO}
    />
  );
};
