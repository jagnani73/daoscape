import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AnalyticsCard } from "../molecules/AnalyticsCard";

const mockAnalytics = [
  {
    title: "Total Proposals",
    value: "24",
    subtitle: "+2 this month",
  },
  {
    title: "Active Voters",
    value: "1,234",
    subtitle: "+12% from last month",
  },
  {
    title: "Participation Rate",
    value: "68%",
    subtitle: "+5% from last month",
  },
  {
    title: "Treasury Balance",
    value: "$2.4M",
    subtitle: "Across all assets",
  },
];

export const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Analytics
        </h2>
        <p className="text-muted-foreground mb-6">
          Track governance metrics and participation across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAnalytics.map((item, index) => (
          <AnalyticsCard
            key={index}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Governance Activity</CardTitle>
          <CardDescription>
            Recent governance and verification activity overview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Analytics dashboard coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
