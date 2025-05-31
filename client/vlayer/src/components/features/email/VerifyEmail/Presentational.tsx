import React from "react";

interface VerifyEmailProps {
  onGenerateProof: () => void;
  onVerifyProof: () => void;
  isGeneratingProof: boolean;
  isVerifying: boolean;
  proofGenerated: boolean;
  verificationComplete: boolean;
  error?: string;
  txHash?: string;
  emailDomain?: string;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  onGenerateProof,
  onVerifyProof,
  isGeneratingProof,
  isVerifying,
  proofGenerated,
  verificationComplete,
  error,
  txHash,
  emailDomain,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔐 Email Verification
          </h1>
          <p className="text-lg text-gray-600">
            Generate and verify your email proof on-chain
          </p>
        </div>

        {verificationComplete ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email domain <strong>{emailDomain}</strong> has been verified
              on-chain.
            </p>

            {txHash && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <p className="text-green-700 text-sm mb-2">
                  ✅ Transaction Hash:
                </p>
                <code className="text-xs text-green-800 break-all">
                  {txHash}
                </code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Verification
            </button>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center space-x-2 ${
                    proofGenerated ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      proofGenerated
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {proofGenerated ? "✓" : "1"}
                  </div>
                  <span className="font-medium">Generate Proof</span>
                </div>

                <div
                  className={`w-16 h-1 ${
                    proofGenerated ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>

                <div
                  className={`flex items-center space-x-2 ${
                    proofGenerated ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      proofGenerated
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className="font-medium">Verify On-Chain</span>
                </div>
              </div>
            </div>

            {/* Step 1: Generate Proof */}
            {!proofGenerated && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Step 1: Generate Email Proof
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Generate a cryptographic proof of your email to verify domain
                  ownership.
                </p>

                <button
                  onClick={onGenerateProof}
                  disabled={isGeneratingProof}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isGeneratingProof
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isGeneratingProof ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Proof...</span>
                    </div>
                  ) : (
                    "🔐 Generate Email Proof"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Verify Proof */}
            {proofGenerated && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Step 2: Verify Proof On-Chain
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Submit your proof to the blockchain to complete verification.
                </p>

                <button
                  onClick={onVerifyProof}
                  disabled={isVerifying}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isVerifying
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying On-Chain...</span>
                    </div>
                  ) : (
                    "⛓️ Verify On-Chain"
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                📋 What happens during verification:
              </h4>
              <ol className="text-gray-600 text-sm space-y-1">
                <li>
                  1. Your email is cryptographically verified using DKIM
                  signatures
                </li>
                <li>
                  2. A zero-knowledge proof is generated to protect your privacy
                </li>
                <li>3. The proof is submitted to the smart contract</li>
                <li>4. Your domain ownership is recorded on-chain</li>
                <li>5. You receive confirmation of successful verification</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
