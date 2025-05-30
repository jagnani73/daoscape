import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AnalyticsCard } from "../molecules/AnalyticsCard";

const analyticsData = [
  {
    title: "Total Proposals",
    value: 24,
    subtitle: "+2 from last month",
  },
  {
    title: "Active Votes",
    value: 91,
    subtitle: "Across 4 proposals",
  },
  {
    title: "Verified Proofs",
    value: 156,
    subtitle: "+12 this week",
  },
  {
    title: "Participation Rate",
    value: "78%",
    subtitle: "Above average",
  },
];

export const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <p className="text-gray-600 mb-6">
          View governance participation metrics and proof verification
          statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.map((data, index) => (
          <AnalyticsCard
            key={index}
            title={data.title}
            value={data.value}
            subtitle={data.subtitle}
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
