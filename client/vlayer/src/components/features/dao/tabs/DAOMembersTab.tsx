import React from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Member } from "../../../../types/dao";
import { formatDate, getHouseBadgeProps } from "../../../../utils/daoHelpers";

interface DAOMembersTabProps {
  members: Member[] | undefined;
  daoName: string;
}

export const DAOMembersTab: React.FC<DAOMembersTabProps> = ({
  members,
  daoName,
}) => {
  const { address } = useAccount();

  // Sort members to put current user first if they are a member
  const sortedMembers = React.useMemo(() => {
    if (!members || !address) return members || [];

    const currentUserMember = members.find(
      (member) => member.member_id.toLowerCase() === address.toLowerCase()
    );

    if (!currentUserMember) return members;

    // Put current user first, then the rest
    const otherMembers = members.filter(
      (member) => member.member_id.toLowerCase() !== address.toLowerCase()
    );

    return [currentUserMember, ...otherMembers];
  }, [members, address]);

  const isCurrentUser = (memberAddress: string) => {
    return address && memberAddress.toLowerCase() === address.toLowerCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DAO Members</CardTitle>
        <CardDescription>
          All members of {daoName} and their voting houses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedMembers && sortedMembers.length > 0 ? (
          <div className="space-y-4">
            {sortedMembers.map((member, index) => {
              const houseBadge = getHouseBadgeProps(member.house);
              const isCurrentUserMember = isCurrentUser(member.member_id);

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    isCurrentUserMember
                      ? "ring-2 ring-primary/50 bg-primary/5 border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCurrentUserMember
                          ? "bg-primary/20 ring-2 ring-primary/30"
                          : "bg-primary/10"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {member.member_id.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono text-sm">
                          {member.member_id}
                        </p>
                        {isCurrentUserMember && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Joined {formatDate(member.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Reputation: {member.reputation}
                      </p>
                    </div>
                    <Badge className={houseBadge.className}>
                      {houseBadge.text}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No members found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
