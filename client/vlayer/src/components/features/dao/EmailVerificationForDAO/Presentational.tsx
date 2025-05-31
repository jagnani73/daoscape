import React from "react";
import { DAO } from "../../../../types/dao";

interface EmailVerificationForDAOProps {
  dao: DAO | null;
  emailStep: "send" | "verify" | "submit";
  subject: string;
  uniqueEmail: string;
  isEmailVerified: boolean;
  isProofGenerated: boolean;
  isBlockchainVerified: boolean;
  emailSentConfirmed: boolean;
  isPolling: boolean;
  isEmailLoading: boolean;
  isGeneratingProof: boolean;
  isVerifying: boolean;
  isSubmitting: boolean;
  isVerified: boolean;
  error?: string;
  txHash?: string;
  emailDomain?: string;
  onEmailSentConfirmation: () => void;
  onGenerateProof: () => void;
  onSubmitToDAO: () => void;
}

export const EmailVerificationForDAO: React.FC<
  EmailVerificationForDAOProps
> = ({
  dao,
  emailStep,
  subject,
  uniqueEmail,
  isEmailVerified,
  isProofGenerated,
  isBlockchainVerified,
  emailSentConfirmed,
  isPolling,
  isEmailLoading,
  isGeneratingProof,
  isVerifying,
  isSubmitting,
  isVerified,
  error,
  txHash,
  emailDomain,
  onEmailSentConfirmation,
  onGenerateProof,
  onSubmitToDAO,
}) => {
  if (!dao) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">
          Loading DAO information...
        </span>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openEmailClient = () => {
    const mailtoLink = `mailto:${uniqueEmail}?subject=${encodeURIComponent(
      subject
    )}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Email Verification for {dao.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Verify your email to earn reputation points in this DAO
          </p>
        </div>

        {isVerified ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Email Verification Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your email verification has been successfully submitted to{" "}
              <strong className="text-foreground">{dao.name}</strong>. You've
              earned reputation points for completing this verification!
            </p>

            {emailDomain && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                <p className="text-blue-400 text-sm mb-1">Verified Domain:</p>
                <p className="text-foreground font-semibold">{emailDomain}</p>
              </div>
            )}

            {txHash && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
                <p className="text-green-400 text-sm mb-2">
                  ✅ Blockchain verification complete
                </p>
                <p className="text-muted-foreground text-xs font-mono break-all">
                  {txHash}
                </p>
              </div>
            )}

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Reputation points have been added to your DAO profile
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center space-x-2 ${
                    isEmailVerified
                      ? "text-green-400"
                      : emailStep === "send"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isEmailVerified
                        ? "bg-green-600 text-white"
                        : emailStep === "send"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isEmailVerified ? "✓" : "1"}
                  </div>
                  <span className="font-medium">Send Email</span>
                </div>

                <div
                  className={`w-16 h-1 ${
                    isEmailVerified ? "bg-green-600" : "bg-muted"
                  }`}
                ></div>

                <div
                  className={`flex items-center space-x-2 ${
                    isProofGenerated
                      ? "text-green-400"
                      : emailStep === "verify"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isProofGenerated
                        ? "bg-green-600 text-white"
                        : emailStep === "verify"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isProofGenerated ? "✓" : "2"}
                  </div>
                  <span className="font-medium">Generate Proof</span>
                </div>

                <div
                  className={`w-16 h-1 ${
                    isProofGenerated ? "bg-green-600" : "bg-muted"
                  }`}
                ></div>

                <div
                  className={`flex items-center space-x-2 ${
                    emailStep === "submit"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      emailStep === "submit"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    3
                  </div>
                  <span className="font-medium">Submit to DAO</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {emailStep === "send" && (
              <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  Step 1: Send Verification Email
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Send an email from your domain to prove ownership and earn
                  reputation points in {dao.name}.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Send To:
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg border font-mono text-sm text-foreground">
                        {uniqueEmail}
                      </div>
                      <button
                        onClick={() => copyToClipboard(uniqueEmail)}
                        className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject:
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg border font-mono text-sm text-foreground">
                        {subject}
                      </div>
                      <button
                        onClick={() => copyToClipboard(subject)}
                        className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={openEmailClient}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    📧 Open Email Client
                  </button>

                  {!emailSentConfirmed ? (
                    <button
                      onClick={onEmailSentConfirmation}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      ✅ I've Sent the Email
                    </button>
                  ) : (
                    <div className="w-full px-6 py-4 bg-muted text-muted-foreground rounded-xl font-semibold text-lg cursor-not-allowed flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-muted-foreground"></div>
                      <span>Waiting for Email...</span>
                    </div>
                  )}
                </div>

                {emailSentConfirmed && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-600 text-sm">
                      📧 Checking for your email... This may take a few moments.
                    </p>
                  </div>
                )}
              </div>
            )}

            {emailStep === "verify" && (
              <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">
                  Step 2: Generate Cryptographic Proof
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Generate a zero-knowledge proof that verifies your email
                  domain ownership without revealing the email content.
                </p>

                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Email received
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      DKIM validation
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Zero-knowledge proof
                    </span>
                  </div>
                </div>

                <button
                  onClick={onGenerateProof}
                  disabled={isGeneratingProof || isVerifying}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isGeneratingProof || isVerifying
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isGeneratingProof ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Proof...</span>
                    </div>
                  ) : isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying On-Chain...</span>
                    </div>
                  ) : (
                    "🔐 Generate & Verify Proof"
                  )}
                </button>
              </div>
            )}

            {emailStep === "submit" && (
              <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-4">
                  Step 3: Submit to DAO for Reputation Points
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Your email verification is complete! Submit this verification
                  to <strong className="text-foreground">{dao.name}</strong> to
                  earn reputation points.
                </p>

                {emailDomain && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                    <p className="text-blue-400 text-sm">
                      Verified Domain:{" "}
                      <span className="text-foreground font-semibold">
                        {emailDomain}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Email verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Proof generated
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Blockchain verified
                    </span>
                  </div>
                </div>

                <button
                  onClick={onSubmitToDAO}
                  disabled={isSubmitting}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting to DAO...</span>
                    </div>
                  ) : (
                    "🏆 Submit for Reputation Points"
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Information Section */}
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">
                📋 How Email Verification Works:
              </h4>
              <ol className="text-muted-foreground text-sm space-y-1">
                <li>1. Send an email from your domain to prove ownership</li>
                <li>2. System verifies DKIM signatures cryptographically</li>
                <li>3. Generate zero-knowledge proof of email authenticity</li>
                <li>4. Submit verification to DAO for reputation points</li>
                <li>5. Earn increased voting power and governance influence</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
