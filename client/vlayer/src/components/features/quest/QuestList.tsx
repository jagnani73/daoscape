import React from "react";
import { QuestWithStatus } from "../../../types/quest";
import { questService } from "../../../services/questService";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";

interface QuestListProps {
  quests: QuestWithStatus[];
  onQuestSelect: (quest: QuestWithStatus) => void;
  userAddress?: string;
  canParticipate: boolean;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  onQuestSelect,
  userAddress,
  canParticipate,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
      },
      upcoming: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Upcoming",
      },
      expired: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Expired",
      },
      completed: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Completed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getParticipationStatus = (quest: QuestWithStatus) => {
    if (!quest.userParticipation) {
      return null;
    }

    const isCompleted = questService.isQuestCompleted(
      quest.userParticipation,
      quest
    );

    if (isCompleted) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          ✅ Completed
        </Badge>
      );
    }

    // Show progress
    const totalTasks = [
      quest.twitter_follow_enabled,
      quest.twitter_like_enabled,
      quest.twitter_retweet_enabled,
    ].filter(Boolean).length;

    const completedTasks = [
      quest.twitter_follow_enabled &&
        quest.userParticipation.twitter_follow_completed,
      quest.twitter_like_enabled &&
        quest.userParticipation.twitter_like_completed,
      quest.twitter_retweet_enabled &&
        quest.userParticipation.twitter_retweet_completed,
    ].filter(Boolean).length;

    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        📝 {completedTasks}/{totalTasks} tasks
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getQuestActions = (quest: QuestWithStatus) => {
    const actions = [];

    if (quest.twitter_follow_enabled) {
      actions.push("Follow");
    }
    if (quest.twitter_like_enabled) {
      actions.push("Like");
    }
    if (quest.twitter_retweet_enabled) {
      actions.push("Retweet");
    }

    return actions.join(" • ");
  };

  if (quests.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <CardTitle>No Quests Available</CardTitle>
          <CardDescription>
            There are no quests for this DAO yet. Check back later or create the
            first quest!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quests.map((quest) => (
        <Card
          key={quest.quest_id}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CardTitle className="text-lg">{quest.title}</CardTitle>
                  {getStatusBadge(quest.status)}
                  {quest.userParticipation && getParticipationStatus(quest)}
                </div>
                <CardDescription className="line-clamp-2">
                  {quest.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Quest Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="font-medium">{getQuestActions(quest)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Reward:</span>
                  <div className="font-medium">
                    {quest.reward_merits} merits
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Participants:</span>
                  <div className="font-medium">
                    {quest.participantCount || 0}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  📅 {formatDate(quest.start_time)} -{" "}
                  {formatDate(quest.end_time)}
                </span>
              </div>

              {/* Twitter Links */}
              {(quest.twitter_account_url || quest.twitter_post_url) && (
                <div className="flex flex-wrap gap-2">
                  {quest.twitter_account_url && (
                    <a
                      href={quest.twitter_account_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🐦 Account
                    </a>
                  )}
                  {quest.twitter_post_url && (
                    <a
                      href={quest.twitter_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📝 Post
                    </a>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => onQuestSelect(quest)}
                  variant={quest.userParticipation ? "outline" : "default"}
                  size="sm"
                >
                  {quest.userParticipation ? "View Progress" : "View Details"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
