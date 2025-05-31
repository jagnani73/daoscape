import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { EmailVerificationForDAOContainer } from "../EmailVerificationForDAO/Container";
import { GitHubVerificationForDAOContainer } from "../GitHubVerificationForDAO/Container";
import { DAO, MembershipStatus } from "../../../../types/dao";
import { isDAOMember } from "../../../../utils/daoHelpers";

interface DAOReputationTabProps {
  dao: DAO;
  membershipStatus: MembershipStatus;
  isConnected: boolean;
  onReputationEarned?: () => void;
}

export const DAOReputationTab: React.FC<DAOReputationTabProps> = ({
  dao,
  membershipStatus,
  isConnected,
  onReputationEarned,
}) => {
  const { address } = useAccount();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showGitHubVerification, setShowGitHubVerification] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const isMember = isDAOMember(membershipStatus);

  const handleEmailVerificationSuccess = () => {
    setSuccessMessage(
      "Email verification completed! You've earned reputation points."
    );
    setShowEmailVerification(false);
    onReputationEarned?.();

    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(undefined), 5000);
  };

  const handleEmailVerificationError = (error: string) => {
    setErrorMessage(error);

    // Clear error message after 5 seconds
    setTimeout(() => setErrorMessage(undefined), 5000);
  };

  const handleGitHubVerificationSuccess = () => {
    setSuccessMessage(
      "GitHub verification completed! You've earned reputation points."
    );
    setShowGitHubVerification(false);
    onReputationEarned?.();

    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(undefined), 5000);
  };

  const handleGitHubVerificationError = (error: string) => {
    setErrorMessage(error);

    // Clear error message after 5 seconds
    setTimeout(() => setErrorMessage(undefined), 5000);
  };

  if (showEmailVerification) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowEmailVerification(false)}
          className="mb-4"
        >
          ← Back to Reputation Activities
        </Button>
        <EmailVerificationForDAOContainer
          daoId={dao.dao_id}
          onSuccess={handleEmailVerificationSuccess}
          onError={handleEmailVerificationError}
        />
      </div>
    );
  }

  if (showGitHubVerification) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowGitHubVerification(false)}
          className="mb-4"
        >
          ← Back to Reputation Activities
        </Button>
        <GitHubVerificationForDAOContainer
          daoId={dao.dao_id}
          onSuccess={handleGitHubVerificationSuccess}
          onError={handleGitHubVerificationError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Reputation Activities</CardTitle>
          <CardDescription>
            Complete activities to earn reputation points and increase your
            influence in {dao.name}
          </CardDescription>
        </CardHeader>
      </Card>

      {!isConnected ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              You need to connect your wallet to participate in reputation
              activities.
            </p>
            <w3m-button />
          </CardContent>
        </Card>
      ) : !isMember ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Join the DAO First</h3>
            <p className="text-muted-foreground mb-4">
              You need to be a member of {dao.name} to earn reputation points.
            </p>
            <p className="text-sm text-gray-500">
              Go to the "DAO Details" tab to join this DAO.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Email Verification Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>📧</span>
                    <span>Email Domain Verification</span>
                  </CardTitle>
                  <CardDescription>
                    Prove ownership of your email domain using cryptographic
                    verification
                  </CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  🏆 High Reputation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Cryptographic proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>On-chain verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Domain ownership</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                Verify your email domain ownership through DKIM signatures and
                zero-knowledge proofs. This demonstrates your commitment to the
                DAO and earns significant reputation points.
              </p>

              <Button
                onClick={() => setShowEmailVerification(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Start Email Verification
              </Button>
            </CardContent>
          </Card>

          {/* GitHub Verification Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🐙</span>
                    <span>GitHub Contribution Verification</span>
                  </CardTitle>
                  <CardDescription>
                    Prove your contributions to GitHub repositories using
                    cryptographic verification
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  🏆 High Reputation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Contribution proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>On-chain verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Repository validation</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                Verify your GitHub contributions to specific repositories
                through zero-knowledge proofs. This demonstrates your technical
                skills and commitment to open source development.
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-xs">
                  <strong>Example:</strong> Verify contributions to
                  covalenthq/ai-agent-sdk repository
                </p>
              </div>

              <Button
                onClick={() => setShowGitHubVerification(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start GitHub Verification
              </Button>
            </CardContent>
          </Card>

          {/* Future Reputation Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🚀</span>
                <span>More Activities Coming Soon</span>
              </CardTitle>
              <CardDescription>
                Additional ways to earn reputation will be available soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>🐦</span>
                    <span className="font-medium">
                      Social Media Verification
                    </span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify your Twitter, LinkedIn, and other social accounts
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>🎓</span>
                    <span className="font-medium">Skill Verification</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Prove your technical skills and expertise
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>💼</span>
                    <span className="font-medium">
                      Professional Verification
                    </span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify your professional background and experience
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>🏅</span>
                    <span className="font-medium">
                      Achievement Verification
                    </span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify your achievements and contributions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reputation Info */}
          <Card>
            <CardHeader>
              <CardTitle>About Reputation Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>What are reputation points?</strong> Reputation points
                  measure your credibility and commitment to the DAO. Higher
                  reputation gives you more influence in governance decisions.
                </p>
                <p>
                  <strong>How do they work?</strong> Each verification activity
                  awards different amounts of reputation based on the difficulty
                  and importance of the proof.
                </p>
                <p>
                  <strong>Benefits:</strong> Higher reputation increases your
                  voting power, unlocks exclusive features, and demonstrates
                  your trustworthiness to other members.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
