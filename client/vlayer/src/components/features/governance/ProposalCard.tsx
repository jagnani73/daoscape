import React from "react";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Proposal } from "../../../types/common";
import { cn, truncateText } from "../../../utils/components";

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
  onClick?: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  className,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "passed":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getQuorumStatus = (quorum: string) => {
    const percentage = parseFloat(quorum.replace("%", ""));
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 cursor-pointer border-border",
        "hover:border-primary/20 group",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className={cn(
                "w-3 h-3 rounded-full mt-1",
                getStatusColor(proposal.status)
              )}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-foreground">
                  Covalent
                </span>
                <Badge variant="secondary" className="text-xs">
                  admin
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {truncateText(proposal.title, 80)}
              </CardTitle>
              {proposal.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {truncateText(proposal.description, 120)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-3 border-t border-border">
          <div className="flex items-center space-x-4">
            <span className="font-medium">
              {proposal.id} by {proposal.author}
            </span>
            <span>•</span>
            <span>{proposal.timeAgo}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>🗳️</span>
              <span>{proposal.votes} votes</span>
            </span>
            <span
              className={cn("font-medium", getQuorumStatus(proposal.quorum))}
            >
              {proposal.quorum} quorum
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
