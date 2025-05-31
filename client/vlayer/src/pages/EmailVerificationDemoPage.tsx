import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { EmailVerificationForDAOContainer } from "../components/features/dao/EmailVerificationForDAO/Container";
import { daoService } from "../services/daoService";
import { DAO } from "../types/dao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export const EmailVerificationDemoPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [daos, setDAOs] = useState<DAO[]>([]);
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDAOs = async () => {
      try {
        const allDAOs = await daoService.getAllDAOs();
        setDAOs(allDAOs);

        if (allDAOs.length > 0) {
          setSelectedDAO(allDAOs[0]);
        }
      } catch (error) {
        console.error("Error loading DAOs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDAOs();
  }, []);

  const handleDAOSelect = (dao: DAO) => {
    setSelectedDAO(dao);
  };

  const handleBackToSelection = () => {
    setSelectedDAO(null);
  };

  const handleVerificationSuccess = () => {
    console.log("Email verification completed successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DAOs...</p>
        </div>
      </div>
    );
  }

  if (selectedDAO) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            className="mb-6"
          >
            ← Back to DAO Selection
          </Button>

          <EmailVerificationForDAOContainer
            daoId={selectedDAO.dao_id}
            onSuccess={handleVerificationSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🏛️ DAO Email Verification Demo
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Prove your email domain ownership to earn reputation points in DAOs
          </p>

          {!isConnected && (
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-4">
                You need to connect your wallet to participate in email
                verification.
              </p>
              <w3m-button />
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔐</span>
                <span>Cryptographic Proof</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Uses DKIM signatures and zero-knowledge proofs to verify email
                domain ownership without exposing sensitive information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Earn Reputation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Successfully verified emails earn reputation points in DAOs,
                increasing your voting power and governance influence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⛓️</span>
                <span>On-chain Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Verification results are stored on-chain, creating a permanent
                and tamper-proof record of your domain ownership.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* DAO Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select a DAO to Verify For</CardTitle>
            <CardDescription>
              Choose a DAO where you want to earn reputation points through
              email verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {daos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No DAOs available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {daos.map((dao) => (
                  <div
                    key={dao.dao_id}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card"
                    onClick={() => handleDAOSelect(dao)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">🏛️</div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {dao.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {dao.tags && dao.tags.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {dao.tags[0]}
                            </Badge>
                          )}
                          <Badge variant="default" className="text-xs">
                            {dao.members?.length || 0} members
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {dao.description}
                    </p>

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDAOSelect(dao);
                      }}
                    >
                      Verify Email for This DAO
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Email Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  Step-by-Step Process:
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>
                      Send an email from your domain to a unique verification
                      address
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>
                      System verifies DKIM signatures cryptographically
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>
                      Generate zero-knowledge proof of email authenticity
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>
                      Submit verification to DAO for reputation points
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-semibold text-primary">5.</span>
                    <span>
                      Earn increased voting power and governance influence
                    </span>
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  Technical Details:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Uses vlayer SDK for cryptographic verification</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>
                      DKIM signature validation ensures email authenticity
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Zero-knowledge proofs protect your privacy</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Smart contracts store verification on-chain</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Automatic reputation point distribution</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
