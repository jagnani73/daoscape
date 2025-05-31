import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { VerifyEmail } from "./Presentational";
import { preverifyEmail, createVlayerClient } from "@vlayer/sdk";
import emailDomainVerifier from "../../../../../../out/EmailProofVerifier.sol/EmailDomainVerifier.json";

const EMAIL_SERVICE_URL =
  "https://email-example-inbox.s3.us-east-2.amazonaws.com";

export const VerifyEmailContainer = () => {
  const { address } = useAccount();
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string>();
  const [emailDomain, setEmailDomain] = useState<string>();
  const [proofData, setProofData] = useState<any>();

  const { writeContract, data: txHash, error: writeError } = useWriteContract();
  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txStatus === "success") {
      setVerificationComplete(true);
      setIsVerifying(false);
    } else if (txStatus === "error") {
      setError("Transaction failed. Please try again.");
      setIsVerifying(false);
    }
  }, [txStatus]);

  useEffect(() => {
    if (writeError) {
      setError(`Transaction error: ${writeError.message}`);
      setIsVerifying(false);
    }
  }, [writeError]);

  const fetchEmailContent = async (emailId: string): Promise<string> => {
    const response = await fetch(`${EMAIL_SERVICE_URL}/${emailId}.eml`);
    if (!response.ok) {
      throw new Error("Failed to fetch email content");
    }
    return await response.text();
  };

  const extractDomainFromEmail = (emailContent: string): string | null => {
    // Extract domain from DKIM-Signature header
    const dkimMatch = emailContent.match(/DKIM-Signature:.*?d=([^;]+)/i);
    if (dkimMatch) {
      return dkimMatch[1].trim();
    }

    // Fallback: extract from From header
    const fromMatch = emailContent.match(/From:.*?@([^\s>]+)/i);
    if (fromMatch) {
      return fromMatch[1].trim();
    }

    return null;
  };

  const fetchDnsRecords = async (
    domain: string,
    selector: string
  ): Promise<string[]> => {
    try {
      // Use a public DNS over HTTPS service to fetch DKIM records
      const dkimDomain = `${selector}._domainkey.${domain}`;
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${dkimDomain}&type=TXT`,
        {
          headers: {
            Accept: "application/dns-json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch DNS records");
      }

      const data = await response.json();
      const txtRecords =
        data.Answer?.filter((record: any) => record.type === 16) || [];

      return txtRecords.map((record: any) => record.data.replace(/"/g, ""));
    } catch (error) {
      console.error("Error fetching DNS records:", error);
      // Return empty array as fallback - vlayer will handle DNS verification
      return [];
    }
  };

  const extractDkimSelector = (emailContent: string): string | null => {
    const selectorMatch = emailContent.match(/DKIM-Signature:.*?s=([^;]+)/i);
    return selectorMatch ? selectorMatch[1].trim() : null;
  };

  const handleGenerateProof = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsGeneratingProof(true);
    setError(undefined);

    try {
      // Get stored email data
      const emailDataStr = localStorage.getItem("emailVerificationData");
      if (!emailDataStr) {
        setError("No email data found. Please send an email first.");
        return;
      }

      const emailData = JSON.parse(emailDataStr);

      // Fetch the .eml file from the email service
      const emlContent = await fetchEmailContent(emailData.emailId);

      // Extract domain and selector for DNS lookup
      const domain = extractDomainFromEmail(emlContent);
      const selector = extractDkimSelector(emlContent);

      if (!domain || !selector) {
        setError("Could not extract domain or DKIM selector from email");
        return;
      }

      // Fetch DNS records
      const dnsRecords = await fetchDnsRecords(domain, selector);

      // Preverify the email using vlayer SDK
      const unverifiedEmail = await preverifyEmail(emlContent, dnsRecords);

      // Create vlayer client and call prover
      const vlayer = createVlayerClient({
        url: import.meta.env.VITE_PROVER_URL,
      });

      const proof = await vlayer.prove({
        address: import.meta.env.VITE_EMAIL_PROVER_ADDRESS as `0x${string}`,
        functionName: "main",
        args: [unverifiedEmail],
      });

      setProofData(proof);
      setProofGenerated(true);
      setEmailDomain(domain);
    } catch (err) {
      console.error("Error generating proof:", err);
      setError(
        `Failed to generate proof: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofData || !address) {
      setError("No proof data available or wallet not connected");
      return;
    }

    setIsVerifying(true);
    setError(undefined);

    try {
      const [proof, emailHash, targetWallet, domain] = proofData;

      writeContract({
        address: import.meta.env.VITE_EMAIL_VERIFIER_ADDRESS as `0x${string}`,
        abi: emailDomainVerifier.abi,
        functionName: "verify",
        args: [proof, emailHash, targetWallet, domain],
      });
    } catch (err) {
      console.error("Error verifying proof:", err);
      setError("Failed to verify proof. Please try again.");
      setIsVerifying(false);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to proceed with email verification
          </p>
        </div>
      </div>
    );
  }

  return (
    <VerifyEmail
      onGenerateProof={handleGenerateProof}
      onVerifyProof={handleVerifyProof}
      isGeneratingProof={isGeneratingProof}
      isVerifying={isVerifying}
      proofGenerated={proofGenerated}
      verificationComplete={verificationComplete}
      error={error}
      txHash={txHash}
      emailDomain={emailDomain}
    />
  );
};
