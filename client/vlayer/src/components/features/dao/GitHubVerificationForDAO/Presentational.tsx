import React from "react";
import { DAO } from "../../../../types/dao";

interface GitHubVerificationForDAOProps {
  dao: DAO | null;
  githubStep: "input" | "verify" | "submit";
  githubUsername: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  isGitHubVerified: boolean;
  isProofGenerated: boolean;
  isBlockchainVerified: boolean;
  isGeneratingProof: boolean;
  isVerifying: boolean;
  isSubmitting: boolean;
  isVerified: boolean;
  error?: string;
  txHash?: string;
  onGitHubUsernameChange: (username: string) => void;
  onRepoDetailsChange: (owner: string, name: string, branch: string) => void;
  onVerifyContribution: () => void;
  onGenerateProof: () => void;
  onSubmitToDAO: () => void;
}

export const GitHubVerificationForDAO: React.FC<
  GitHubVerificationForDAOProps
> = ({
  dao,
  githubStep,
  githubUsername,
  repoOwner,
  repoName,
  branch,
  isGitHubVerified,
  isProofGenerated,
  isBlockchainVerified,
  isGeneratingProof,
  isVerifying,
  isSubmitting,
  isVerified,
  error,
  txHash,
  onGitHubUsernameChange,
  onRepoDetailsChange,
  onVerifyContribution,
  onGenerateProof,
  onSubmitToDAO,
}) => {
  if (!dao) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-card rounded-2xl shadow-xl border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DAO information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐙</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            GitHub Verification for {dao.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Prove your GitHub contributions to earn reputation points in this
            DAO
          </p>
        </div>

        {isVerified ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              GitHub Verification Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your GitHub contribution verification has been successfully
              submitted to{" "}
              <strong className="text-foreground">{dao.name}</strong>. You've
              earned reputation points for completing this verification!
            </p>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
              <p className="text-blue-400 text-sm mb-1">
                Verified Contribution:
              </p>
              <p className="text-foreground font-semibold">
                {githubUsername} → {repoOwner}/{repoName}:{branch}
              </p>
            </div>

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
                    isGitHubVerified
                      ? "text-green-400"
                      : githubStep === "input"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isGitHubVerified
                        ? "bg-green-600 text-white"
                        : githubStep === "input"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isGitHubVerified ? "✓" : "1"}
                  </div>
                  <span className="font-medium">Enter Details</span>
                </div>

                <div
                  className={`w-16 h-1 ${
                    isGitHubVerified ? "bg-green-600" : "bg-muted"
                  }`}
                ></div>

                <div
                  className={`flex items-center space-x-2 ${
                    isProofGenerated
                      ? "text-green-400"
                      : githubStep === "verify"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isProofGenerated
                        ? "bg-green-600 text-white"
                        : githubStep === "verify"
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
                    githubStep === "submit"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      githubStep === "submit"
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
            {githubStep === "input" && (
              <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  Step 1: Enter GitHub Details
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter your GitHub username and repository details to verify
                  your contributions.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => onGitHubUsernameChange(e.target.value)}
                      placeholder="e.g., karanpargal"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Repository Owner
                      </label>
                      <input
                        type="text"
                        value={repoOwner}
                        onChange={(e) =>
                          onRepoDetailsChange(e.target.value, repoName, branch)
                        }
                        placeholder="e.g., covalenthq"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Repository Name
                      </label>
                      <input
                        type="text"
                        value={repoName}
                        onChange={(e) =>
                          onRepoDetailsChange(repoOwner, e.target.value, branch)
                        }
                        placeholder="e.g., ai-agent-sdk"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) =>
                        onRepoDetailsChange(repoOwner, repoName, e.target.value)
                      }
                      placeholder="e.g., main"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-sm mb-2">
                      📋 Example Repository:
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Owner: covalenthq, Name: ai-agent-sdk, Branch:
                      deferred_commit_contributors
                    </p>
                  </div>
                </div>

                <button
                  onClick={onVerifyContribution}
                  disabled={
                    !githubUsername ||
                    !repoOwner ||
                    !repoName ||
                    !branch ||
                    isVerifying
                  }
                  className={`w-full mt-6 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    !githubUsername ||
                    !repoOwner ||
                    !repoName ||
                    !branch ||
                    isVerifying
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying Contribution...</span>
                    </div>
                  ) : (
                    "🔍 Verify GitHub Contribution"
                  )}
                </button>
              </div>
            )}

            {githubStep === "verify" && (
              <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">
                  Step 2: Generate Cryptographic Proof
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Generate a zero-knowledge proof that verifies your GitHub
                  contribution without revealing sensitive repository
                  information.
                </p>

                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Contribution verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Repository validation
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Zero-knowledge proof
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                  <p className="text-blue-400 text-sm mb-1">Verifying:</p>
                  <p className="text-foreground font-semibold">
                    {githubUsername} → {repoOwner}/{repoName}:{branch}
                  </p>
                </div>

                <button
                  onClick={onGenerateProof}
                  disabled={isGeneratingProof}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isGeneratingProof
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isGeneratingProof ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Proof...</span>
                    </div>
                  ) : (
                    "🔐 Generate Cryptographic Proof"
                  )}
                </button>
              </div>
            )}

            {githubStep === "submit" && (
              <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-4">
                  Step 3: Submit to DAO for Reputation Points
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Your GitHub contribution verification is complete! Submit this
                  verification to{" "}
                  <strong className="text-foreground">{dao.name}</strong> to
                  earn reputation points.
                </p>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                  <p className="text-blue-400 text-sm">
                    Verified Contribution:{" "}
                    <span className="text-foreground font-semibold">
                      {githubUsername} → {repoOwner}/{repoName}:{branch}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">
                      Contribution verified
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
                📋 How GitHub Verification Works:
              </h4>
              <ol className="text-muted-foreground text-sm space-y-1">
                <li>1. Enter your GitHub username and repository details</li>
                <li>2. System verifies your contributions to the repository</li>
                <li>
                  3. Generate zero-knowledge proof of contribution authenticity
                </li>
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
