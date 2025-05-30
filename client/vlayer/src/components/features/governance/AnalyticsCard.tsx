import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { AnalyticsMetric } from "../../../types/components";

interface AnalyticsCardProps {
  metric: AnalyticsMetric;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  metric,
  className = "",
}) => {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "neutral":
        return "➡️";
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {metric.icon && <span>{metric.icon}</span>}
          {metric.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            {metric.value}
          </div>
          {metric.trend && (
            <span className={`text-lg ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
            </span>
          )}
        </div>
        <p className={`text-xs mt-1 ${getTrendColor(metric.trend)}`}>
          {metric.subtitle}
        </p>
      </CardContent>
    </Card>
  );
};
