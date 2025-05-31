import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { TokenDetailsCard } from "../../../TokenDetailsCard";
import { JoinDAOButton } from "../details/JoinDAOButton";
import { DAO, MembershipStatus } from "../../../../types/dao";
import {
  canShowJoinButton,
  isDAOMember,
  formatDate,
} from "../../../../utils/daoHelpers";

interface DAODetailsTabProps {
  dao: DAO;
  membershipStatus: MembershipStatus;
  isConnected: boolean;
  address: string | undefined;
  joinMessage: string;
  setJoinMessage: (message: string) => void;
  handleJoinSuccess: () => void;
  handleJoinError: (error: string) => void;
  onRefetchUserDAOs?: () => void;
}

export const DAODetailsTab: React.FC<DAODetailsTabProps> = ({
  dao,
  membershipStatus,
  isConnected,
  address,
  joinMessage,
  setJoinMessage,
  handleJoinSuccess,
  handleJoinError,
  onRefetchUserDAOs,
}) => {
  return (
    <div className="space-y-6">
      {/* Token Requirements */}
      <TokenDetailsCard tokens={dao.tokens} daoName={dao.name} />

      {/* Join DAO Section - Only show if user is not a member */}
      {!isDAOMember(membershipStatus) && (
        <>
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
                {canShowJoinButton(isConnected, membershipStatus) ? (
                  <>
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
                    <JoinDAOButton
                      daoId={dao.dao_id}
                      walletAddress={address}
                      onJoinSuccess={handleJoinSuccess}
                      onJoinError={handleJoinError}
                      onRefetchUserDAOs={onRefetchUserDAOs}
                    />
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {membershipStatus === "pending" &&
                        "Your membership request is pending approval."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground mb-4">
                  You need to connect your wallet to join this DAO.
                </p>
                <w3m-button />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* DAO Information */}
      <Card>
        <CardHeader>
          <CardTitle>About {dao.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{dao.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Created</h4>
              <p className="text-muted-foreground">
                {formatDate(dao.created_at)}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Owner</h4>
              <p className="text-muted-foreground font-mono text-sm">
                {dao.owner_address.slice(0, 6)}...{dao.owner_address.slice(-4)}
              </p>
            </div>
          </div>

          {dao.tags && dao.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {dao.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {dao.socials && dao.socials.some((social) => social) && (
            <div>
              <h4 className="font-medium mb-2">Social Links</h4>
              <div className="flex flex-wrap gap-2">
                {dao.socials[0] && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={dao.socials[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Discord
                    </a>
                  </Button>
                )}
                {dao.socials[1] && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={dao.socials[1]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  </Button>
                )}
                {dao.socials[2] && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={dao.socials[2]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </a>
                  </Button>
                )}
                {dao.socials[3] && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={dao.socials[3]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
