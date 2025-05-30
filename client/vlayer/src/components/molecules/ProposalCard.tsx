import React from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Proposal } from "../../types/common";

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Covalent</span>
            <CardTitle className="text-base font-semibold text-gray-900">
              {proposal.title}
            </CardTitle>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
          <span>
            {proposal.id} by {proposal.author}
          </span>
          <Badge variant="secondary">admin</Badge>
          <span>
            • {proposal.votes} votes • {proposal.quorum} quorum •{" "}
            {proposal.timeAgo}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};
