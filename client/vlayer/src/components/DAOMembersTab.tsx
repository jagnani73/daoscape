import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Member } from "../types/dao";
import { formatDate, getHouseBadgeProps } from "../utils/daoHelpers";

interface DAOMembersTabProps {
  members: Member[] | undefined;
  daoName: string;
}

export const DAOMembersTab: React.FC<DAOMembersTabProps> = ({
  members,
  daoName,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DAO Members</CardTitle>
        <CardDescription>
          All members of {daoName} and their voting houses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members && members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member, index) => {
              const houseBadge = getHouseBadgeProps(member.house);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {member.member_id.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {member.member_id}
                      </p>
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
