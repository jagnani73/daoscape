import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DAO, MembershipStatus } from "../types/dao";
import { daoService } from "../services/daoService";
import { useAccount } from "wagmi";

interface DAODetailPageProps {
  daoId: string;
  onBack: () => void;
}

export const DAODetailPage: React.FC<DAODetailPageProps> = ({
  daoId,
  onBack,
}) => {
  const [dao, setDAO] = useState<DAO | null>(null);
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus>("not_member");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const loadDAODetails = async () => {
      try {
        setLoading(true);
        const daoData = await daoService.getDAOById(daoId);
        setDAO(daoData);

        if (daoData && address) {
          const status = await daoService.getMembershipStatus(daoId, address);
          setMembershipStatus(status);
        }
      } catch (error) {
        console.error("Error loading DAO details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDAODetails();
  }, [daoId, address]);

  const handleJoinDAO = async () => {
    if (!address || !dao) return;

    try {
      setJoining(true);
      const success = await daoService.requestToJoinDAO(
        daoId,
        address,
        joinMessage
      );

      if (success) {
        setMembershipStatus("pending");
        setTimeout(() => {
          setMembershipStatus("member");
        }, 3000);
      }
    } catch (error) {
      console.error("Error joining DAO:", error);
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMembershipStatusBadge = () => {
    switch (membershipStatus) {
      case "member":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✓ Member
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            ⏳ Pending
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            👑 Admin
          </Badge>
        );
      default:
        return null;
    }
  };

  const getJoinButtonText = () => {
    switch (membershipStatus) {
      case "member":
        return "Already a Member";
      case "pending":
        return "Request Pending";
      case "admin":
        return "Admin";
      default:
        return joining ? "Joining..." : "Join DAO";
    }
  };

  const canJoin = () => {
    return isConnected && membershipStatus === "not_member" && !joining;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DAO details...</p>
        </div>
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">DAO Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The DAO you're looking for doesn't exist.
        </p>
        <Button onClick={onBack}>← Back to DAOs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-4">
        ← Back to DAOs
      </Button>

      {/* DAO Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏛️</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{dao.name}</CardTitle>
                  {getMembershipStatusBadge()}
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary">{dao.tags[0]}</Badge>
                  <Badge variant="default">Active</Badge>
                </div>
                <CardDescription className="text-base">
                  {dao.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {dao.total_members.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {dao.total_proposals}
            </div>
            <div className="text-sm text-muted-foreground">Proposals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatDate(dao.created_at).split(",")[1]}
            </div>
            <div className="text-sm text-muted-foreground">Founded</div>
          </CardContent>
        </Card>
      </div>

      {/* Join DAO Section */}
      {isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Join This DAO</CardTitle>
            <CardDescription>
              {membershipStatus === "not_member"
                ? "Become a member to participate in governance and access exclusive benefits."
                : membershipStatus === "pending"
                ? "Your membership request is being processed. You'll be notified once approved."
                : "You are already a member of this DAO!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {membershipStatus === "not_member" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Tell the DAO why you want to join..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  rows={3}
                />
              </div>
            )}
            <Button
              onClick={handleJoinDAO}
              disabled={!canJoin()}
              className="w-full"
              size="lg"
            >
              {getJoinButtonText()}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              You need to connect your wallet to join this DAO.
            </p>
            <w3m-button />
          </CardContent>
        </Card>
      )}

      {/* Links and Social */}
      {(dao.socials[3] || dao.socials[2] || dao.socials[0]) && (
        <Card>
          <CardHeader>
            <CardTitle>Links & Social</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {dao.socials[3] && (
                <Button variant="outline" asChild>
                  <a
                    href={dao.socials[3]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🌐 Website
                  </a>
                </Button>
              )}
              {dao.socials[2] && (
                <Button variant="outline" asChild>
                  <a
                    href={dao.socials[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🐦 Twitter
                  </a>
                </Button>
              )}
              {dao.socials[0] && (
                <Button variant="outline" asChild>
                  <a
                    href={dao.socials[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Discord
                  </a>
                </Button>
              )}
              {dao.socials[1] && (
                <Button variant="outline" asChild>
                  <a
                    href={dao.socials[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Telegram
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>About This DAO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Mission</h4>
            <p className="text-muted-foreground">{dao.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Founded</h4>
            <p className="text-muted-foreground">
              {formatDate(dao.created_at)}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Category</h4>
            <Badge variant="secondary">{dao.tags[0]}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
