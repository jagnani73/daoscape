import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Vote } from "../../../types/dao";
import { daoService } from "../../../services/daoService";

interface VotesListProps {
  proposalId: string;
  isFeedback: boolean;
  house?: string;
  voteType: "YES" | "NO" | "ABSTAIN";
  count: number;
  weight: number;
  className?: string;
}

export const VotesList: React.FC<VotesListProps> = ({
  proposalId,
  isFeedback,
  house,
  voteType,
  count,
  weight,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = async () => {
    if (count === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await daoService.getVotesForProposal(
        proposalId,
        isFeedback,
        house
      );

      if (response.success && response.data) {
        // Filter votes by the specific vote type
        const filteredVotes = response.data.filter(
          (vote) => vote.vote === voteType
        );
        setVotes(filteredVotes);
      } else {
        setError(response.message || "Failed to fetch votes");
      }
    } catch (err) {
      setError("Failed to fetch votes");
      console.error("Error fetching votes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && votes.length === 0) {
      fetchVotes();
    }
    setIsExpanded(!isExpanded);
  };

  const getVoteColor = (voteType: string) => {
    switch (voteType) {
      case "YES":
        return "bg-green-100 text-green-800 border-green-200";
      case "NO":
        return "bg-red-100 text-red-800 border-red-200";
      case "ABSTAIN":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVoteIcon = (voteType: string) => {
    switch (voteType) {
      case "YES":
        return "✅";
      case "NO":
        return "❌";
      case "ABSTAIN":
        return "⚪";
      default:
        return "⚪";
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (count === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="w-full justify-between p-2 h-auto"
        disabled={loading}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getVoteIcon(voteType)}</span>
          <span className="text-sm font-medium">{voteType}</span>
          <Badge variant="outline" className={getVoteColor(voteType)}>
            {count} vote{count !== 1 ? "s" : ""}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({weight} weight)
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </Button>

      {isExpanded && (
        <Card className="mt-2 border-l-4 border-l-primary/20">
          <CardContent className="p-3">
            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : votes.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {votes.map((vote, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getVoteIcon(vote.vote)}</span>
                      <span className="text-sm font-mono">
                        {formatAddress(vote.member_id)}
                      </span>
                      {vote.house && (
                        <Badge variant="secondary" className="text-xs">
                          House {vote.house}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Weight: {vote.weight}</span>
                      <span>•</span>
                      <span>{formatTimestamp(vote.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2">
                No votes found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
