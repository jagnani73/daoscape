import { useState } from "react";
import { useAccount } from "wagmi";
import { SendEmail } from "./Presentational";
import { v4 as uuidv4 } from "uuid";

const EMAIL_SERVICE_URL =
  "https://email-example-inbox.s3.us-east-2.amazonaws.com";

export const SendEmailContainer = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string>();

  const emailId = uuidv4();
  const subject = `Verify my email at address: ${address}`;
  const uniqueEmail = `${emailId}@proving.vlayer.xyz`;

  const checkEmailReceived = async (emailId: string): Promise<boolean> => {
    try {
      // Check if the email file exists in the S3 bucket
      const response = await fetch(`${EMAIL_SERVICE_URL}/${emailId}.eml`, {
        method: "HEAD",
      });
      return response.ok;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleSendEmail = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Poll for the email with exponential backoff
      const maxAttempts = 10;
      let attempts = 0;
      let delay = 1000; // Start with 1 second

      while (attempts < maxAttempts) {
        const emailReceived = await checkEmailReceived(emailId);

        if (emailReceived) {
          setEmailSent(true);
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
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 10000); // Cap at 10 seconds
        }
      }

      setError(
        "Email not received yet. Please make sure you've sent the email and try again."
      );
    } catch (err) {
      console.error("Error checking email:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
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
    <SendEmail
      subject={subject}
      uniqueEmail={uniqueEmail}
      onSendEmail={handleSendEmail}
      isLoading={isLoading}
      emailSent={emailSent}
      error={error}
    />
  );
};
