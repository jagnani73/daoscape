import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { QuestList } from "./QuestList";
import { CreateQuestForm } from "./CreateQuestForm";
import { QuestDetail } from "./QuestDetail";
import { questService } from "../../../services/questService";
import { daoService } from "../../../services/daoService";
import { useUserDAOs } from "../../../hooks/useUserDAOs";
import { isDAOOwner } from "../../../utils/daoHelpers";
import { QuestWithStatus } from "../../../types/quest";
import { DAO } from "../../../types/dao";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";

interface QuestTabProps {
  selectedDAOId: string | null;
  onDAOSelect?: (daoId: string) => void;
}

export const QuestTab: React.FC<QuestTabProps> = ({
  selectedDAOId,
  onDAOSelect,
}) => {
  const { address, isConnected } = useAccount();
  const { userDAOs, loading: userDAOsLoading } = useUserDAOs();
  const [quests, setQuests] = useState<QuestWithStatus[]>([]);
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get DAOs where user can create quests (only owners)
  const ownedDAOs = userDAOs.filter((dao) => {
    return address && isDAOOwner(address, dao.owner_address);
  });

  // Get DAOs where user can view quests (all member DAOs)
  const memberDAOs = userDAOs;

  useEffect(() => {
    if (selectedDAOId) {
      loadDAOAndQuests();
    } else {
      setSelectedDAO(null);
      setQuests([]);
      setSelectedQuest(null);
      setShowCreateForm(false);
    }
  }, [selectedDAOId, address]);

  const loadDAOAndQuests = async () => {
    if (!selectedDAOId) return;

    setLoading(true);
    setError(null);

    try {
      // Load DAO details
      const dao = await daoService.getDAOByIdDetailed(selectedDAOId);
      setSelectedDAO(dao);

      // Load quests for this DAO
      const questsWithStatus = await questService.getQuestsWithStatus(
        selectedDAOId,
        address
      );
      setQuests(questsWithStatus);
    } catch (err) {
      console.error("Error loading DAO and quests:", err);
      setError("Failed to load quests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuest = () => {
    setShowCreateForm(true);
    setSelectedQuest(null);
  };

  const handleQuestCreated = () => {
    setShowCreateForm(false);
    if (selectedDAOId) {
      loadDAOAndQuests(); // Refresh the quest list if we have a selected DAO
    }
    // If no DAO was selected, the quest was created for a different DAO
    // The user can navigate to that DAO to see the quest
  };

  const handleQuestSelect = (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
    setShowCreateForm(false);
  };

  const handleBackToList = () => {
    setSelectedQuest(null);
    setShowCreateForm(false);
  };

  const handleQuestUpdated = () => {
    loadDAOAndQuests(); // Refresh the quest list
  };

  const handleDAOSelectForViewing = (daoId: string) => {
    if (onDAOSelect) {
      onDAOSelect(daoId);
    }
  };

  // Check if user is a member of the selected DAO
  const isDAOMember = selectedDAO?.members?.some(
    (member) => member.member_id.toLowerCase() === address?.toLowerCase()
  );

  // Check if user is the DAO owner
  const isSelectedDAOOwner =
    selectedDAO?.owner_address.toLowerCase() === address?.toLowerCase();

  if (userDAOsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your DAOs...</p>
        </div>
      </div>
    );
  }

  if (!selectedDAOId && !showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Quest Management</h2>
          <p className="text-muted-foreground">
            Select a DAO to view its quests or create new quests for DAOs you
            own
          </p>
        </div>

        {/* DAO Selection for Viewing Quests */}
        {memberDAOs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select DAO to View Quests</CardTitle>
              <CardDescription>
                Choose from DAOs you're a member of to view their quests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {memberDAOs.map((dao) => {
                  const isOwner =
                    address && isDAOOwner(address, dao.owner_address);
                  return (
                    <div
                      key={dao.dao_id}
                      className="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50"
                      onClick={() => handleDAOSelectForViewing(dao.dao_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🏛️</div>
                          <div>
                            <h4 className="font-semibold">{dao.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {dao.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isOwner ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              👑 Owner
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              👥 Member
                            </Badge>
                          )}
                          <Badge variant="outline">House {dao.house}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Quest Section - Only show if user owns DAOs */}
        {ownedDAOs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Quest</CardTitle>
              <CardDescription>
                Create Twitter engagement quests for DAOs you own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateQuest} className="w-full">
                + Create New Quest
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No DAOs Message */}
        {memberDAOs.length === 0 && (
          <Card>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <CardTitle>No DAOs Found</CardTitle>
              <CardDescription>
                You're not a member of any DAOs yet. Join a DAO to participate
                in quests!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDAOAndQuests} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Quest</h2>
            <p className="text-muted-foreground">
              {selectedDAO?.name
                ? `Create a Twitter engagement quest for ${selectedDAO.name}`
                : "Create a Twitter engagement quest for any DAO you own"}
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Quests
          </Button>
        </div>

        <CreateQuestForm
          daoId={selectedDAOId || undefined}
          onQuestCreated={handleQuestCreated}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  if (selectedQuest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedQuest.title}</h2>
            <p className="text-muted-foreground">
              Quest in {selectedDAO?.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Quests
          </Button>
        </div>

        <QuestDetail
          quest={selectedQuest}
          dao={selectedDAO}
          userAddress={address}
          onQuestUpdated={handleQuestUpdated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quests</h2>
          <p className="text-muted-foreground">
            {selectedDAO?.name} • Twitter engagement quests
          </p>
        </div>

        {isConnected && (isSelectedDAOOwner || isDAOMember) && (
          <Button onClick={handleCreateQuest}>+ Create Quest</Button>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔗</span>
              <span>Connect Your Wallet</span>
            </CardTitle>
            <CardDescription>
              Connect your wallet to participate in quests and earn rewards
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Membership Status */}
      {isConnected && !isDAOMember && !isSelectedDAOOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏛️</span>
              <span>Join DAO to Participate</span>
            </CardTitle>
            <CardDescription>
              You need to be a member of {selectedDAO?.name} to participate in
              quests
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Quest Statistics */}
      {quests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {quests.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Quests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {quests.filter((q) => q.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Quests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {quests.filter((q) => q.userParticipation).length}
              </div>
              <div className="text-sm text-muted-foreground">Joined</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {
                  quests.filter(
                    (q) =>
                      q.userParticipation &&
                      questService.isQuestCompleted(q.userParticipation, q)
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quest List */}
      <QuestList
        quests={quests}
        onQuestSelect={handleQuestSelect}
        userAddress={address}
        canParticipate={isConnected && (isDAOMember || isSelectedDAOOwner)}
      />
    </div>
  );
};
