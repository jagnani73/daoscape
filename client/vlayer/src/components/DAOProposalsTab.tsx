import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CreateProposal } from "./CreateProposal";
import { Proposal } from "../types/dao";
import {
  formatDateTime,
  getProposalStatusBadgeProps,
} from "../utils/daoHelpers";

interface DAOProposalsTabProps {
  proposals: Proposal[] | undefined;
  daoId: string;
  daoName: string;
  isOwner: boolean;
  onProposalCreated: () => void;
  onProposalClick?: (proposalId: string) => void;
}

export const DAOProposalsTab: React.FC<DAOProposalsTabProps> = ({
  proposals,
  daoId,
  daoName,
  isOwner,
  onProposalCreated,
  onProposalClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Create Proposal Section - Only for owners */}
      {isOwner && (
        <CreateProposal
          daoId={daoId}
          daoName={daoName}
          onProposalCreated={onProposalCreated}
        />
      )}

      {/* Proposals List */}
      <Card>
        <CardHeader>
          <CardTitle>DAO Proposals</CardTitle>
          <CardDescription>
            All proposals submitted to {daoName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposals && proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal, index) => {
                const statusBadge = getProposalStatusBadgeProps(
                  proposal.conclusion || "pending"
                );
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {proposal.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {proposal.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                          <Badge variant="outline">
                            House {proposal.voting_house}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Voting Start
                          </p>
                          <p>{formatDateTime(proposal.voting_start)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Voting End
                          </p>
                          <p>{formatDateTime(proposal.voting_end)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Feedback End
                          </p>
                          <p>{formatDateTime(proposal.feedback_end)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Created
                          </p>
                          <p>{formatDateTime(proposal.created_at)}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Voting Result:{" "}
                              <span className="text-primary">
                                {proposal.conclusion}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Feedback Result: {proposal.feedback_conclusion}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {proposal.proposal_id.slice(0, 8)}...
                            </p>
                            {onProposalClick && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  onProposalClick(proposal.proposal_id)
                                }
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No proposals found</p>
              {isOwner && (
                <p className="text-sm text-muted-foreground mt-2">
                  Create the first proposal for this DAO above!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
