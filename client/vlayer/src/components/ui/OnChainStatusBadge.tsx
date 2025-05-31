import React from "react";
import { Badge } from "./badge";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

interface OnChainStatusBadgeProps {
  status: "pending" | "success" | "failed" | "api-only";
  message?: string;
  className?: string;
}

export const OnChainStatusBadge: React.FC<OnChainStatusBadgeProps> = ({
  status,
  message,
  className = "",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="w-3 h-3" />,
          text: "On-chain Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          title: "Transaction is being processed on-chain",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          text: "On-chain ✓",
          className: "bg-green-100 text-green-800 border-green-200",
          title: "Successfully recorded on-chain",
        };
      case "failed":
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: "On-chain Failed",
          className: "bg-red-100 text-red-800 border-red-200",
          title: message || "On-chain transaction failed",
        };
      case "api-only":
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: "API Only",
          className: "bg-blue-100 text-blue-800 border-blue-200",
          title: "Recorded in API only, not on-chain",
        };
      default:
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: "Unknown",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          title: "Unknown status",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      className={`${config.className} ${className} flex items-center gap-1 text-xs`}
      title={config.title}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
};
