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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { DAODetailsTab } from "../components/features/dao/tabs/DAODetailsTab";
import { DAOMembersTab } from "../components/features/dao/tabs/DAOMembersTab";
import { DAOProposalsTab } from "../components/features/dao/tabs/DAOProposalsTab";
import { DAOReputationTab } from "../components/features/dao/tabs/DAOReputationTab";
import { ProposalPage } from "./ProposalPage";
import { DAO, MembershipStatus } from "../types/dao";
import { daoService } from "../services/daoService";
import { useAccount } from "wagmi";
import { useUserDAOs } from "../hooks/useUserDAOs";
import {
  formatDate,
  getMembershipStatusBadgeProps,
  isDAOOwner,
  isDAOMember,
  getProposalPhase,
} from "../utils/daoHelpers";

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
  const [joinMessage, setJoinMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [viewMode, setViewMode] = useState<"member" | "owner">("member");
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null
  );
  const { address, isConnected } = useAccount();
  const { refetch: refetchUserDAOs } = useUserDAOs();

  const isOwner =
    dao && address ? isDAOOwner(address, dao.owner_address) : false;
  const isMember = isDAOMember(membershipStatus);

  // Filter proposals by status
  const activeProposals =
    dao?.proposals?.filter((proposal) => {
      const phase = getProposalPhase(proposal);
      return phase === "upcoming" || phase === "voting" || phase === "feedback";
    }) || [];

  const endedProposals =
    dao?.proposals?.filter((proposal) => {
      const phase = getProposalPhase(proposal);
      return phase === "ended";
    }) || [];

  const loadDAODetails = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading DAO details for:", daoId);
      const daoData = await daoService.getDAOByIdDetailed(daoId);
      setDAO(daoData);

      if (daoData && address) {
        const isMember = daoData.members?.some(
          (member) => member.member_id === address
        );
        setMembershipStatus(isMember ? "member" : "not_member");
        console.log(
          "👤 User membership status:",
          isMember ? "member" : "not_member"
        );

        const userIsOwner = isDAOOwner(address, daoData.owner_address);
        setViewMode(userIsOwner ? "owner" : "member");
      }

      console.log(
        "✅ Successfully loaded DAO details. Members count:",
        daoData?.members?.length || 0
      );
    } catch (error) {
      console.error("Error loading DAO details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDAODetails();
  }, [daoId, address]);

  const handleJoinSuccess = async () => {
    setMembershipStatus("member");
    console.log("🎉 Successfully joined DAO! Refetching data...");

    // Refetch DAO details to get updated member list
    await loadDAODetails();

    // Refetch user DAOs to update the global state
    await refetchUserDAOs();

    console.log("✅ Completed refetching after DAO join");
  };

  const handleJoinError = (error: string) => {
    console.error("Failed to join DAO:", error);
  };

  const handleProposalCreated = async () => {
    try {
      const daoData = await daoService.getDAOByIdDetailed(daoId);
      setDAO(daoData);
    } catch (error) {
      console.error("Error refreshing DAO details:", error);
    }
  };

  const handleProposalClick = (proposalId: string) => {
    setSelectedProposalId(proposalId);
  };

  const getMembershipStatusBadge = () => {
    const badgeProps = getMembershipStatusBadgeProps(membershipStatus);
    if (!badgeProps) return null;

    return <Badge className={badgeProps.className}>{badgeProps.text}</Badge>;
  };

  // If a proposal is selected, show the proposal page
  if (selectedProposalId) {
    return (
      <ProposalPage
        proposalId={selectedProposalId}
        onBack={() => setSelectedProposalId(null)}
      />
    );
  }

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

      {/* DAO Header - Always visible */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏛️</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{dao.name}</CardTitle>
                  {getMembershipStatusBadge()}
                  {isOwner && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      👑 Owner
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  {dao.tags && dao.tags.length > 0 && (
                    <Badge variant="secondary">{dao.tags[0]}</Badge>
                  )}
                  <Badge variant="default">Active</Badge>
                </div>
                <CardDescription className="text-base">
                  {dao.description}
                </CardDescription>
              </div>
            </div>
            {/* Owner/Member View Toggle */}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "member" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("member")}
                >
                  Member View
                </Button>
                <Button
                  variant={viewMode === "owner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("owner")}
                >
                  Owner View
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {dao.members?.length || dao.total_members || 0}
            </div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {dao.proposals?.length || dao.total_proposals || 0}
            </div>
            <div className="text-sm text-muted-foreground">Proposals</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatDate(dao.created_at).split(",")[1]?.trim() ||
                new Date(dao.created_at).getFullYear()}
            </div>
            <div className="text-sm text-muted-foreground">Founded</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {dao.tokens?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Token Requirements
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">DAO Details</TabsTrigger>
          <TabsTrigger value="members">
            Members ({dao.members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="proposals">
            Active Proposals ({activeProposals.length})
          </TabsTrigger>
          <TabsTrigger value="ended-proposals">
            Ended Proposals ({endedProposals.length})
          </TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
        </TabsList>

        {/* DAO Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <DAODetailsTab
            dao={dao}
            membershipStatus={membershipStatus}
            isConnected={isConnected}
            address={address}
            joinMessage={joinMessage}
            setJoinMessage={setJoinMessage}
            handleJoinSuccess={handleJoinSuccess}
            handleJoinError={handleJoinError}
            onRefetchUserDAOs={refetchUserDAOs}
          />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <DAOMembersTab members={dao.members} daoName={dao.name} />
        </TabsContent>

        {/* Active Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <DAOProposalsTab
            proposals={activeProposals}
            daoId={dao.dao_id}
            daoName={dao.name}
            isOwner={isOwner && viewMode === "owner"}
            onProposalCreated={handleProposalCreated}
            onProposalClick={handleProposalClick}
            showOnlyActive={true}
          />
        </TabsContent>

        {/* Ended Proposals Tab */}
        <TabsContent value="ended-proposals" className="space-y-6">
          <DAOProposalsTab
            proposals={endedProposals}
            daoId={dao.dao_id}
            daoName={dao.name}
            isOwner={false} // Don't show create proposal for ended proposals
            onProposalCreated={handleProposalCreated}
            onProposalClick={handleProposalClick}
            showOnlyActive={false}
          />
        </TabsContent>

        {/* Reputation Tab */}
        <TabsContent value="reputation" className="space-y-6">
          <DAOReputationTab
            dao={dao}
            membershipStatus={membershipStatus}
            isConnected={isConnected}
            onReputationEarned={handleJoinSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
