import React, { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ExternalLink, FileText, Copy, Check } from "lucide-react";

interface IPFSMetadataProps {
  akaveUrl?: string;
  className?: string;
  compact?: boolean;
}

export const IPFSMetadata: React.FC<IPFSMetadataProps> = ({
  akaveUrl,
  className = "",
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!akaveUrl) {
    return null;
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(akaveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const handleOpenIPFS = () => {
    window.open(akaveUrl, "_blank", "noopener,noreferrer");
  };

  // Extract IPFS hash from URL for display
  const getIPFSHash = (url: string) => {
    try {
      // Handle different IPFS URL formats
      if (url.includes("/ipfs/")) {
        return url.split("/ipfs/")[1]?.split("/")[0] || url;
      }
      // Handle direct hash
      if (url.startsWith("Qm") || url.startsWith("bafy")) {
        return url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const ipfsHash = getIPFSHash(akaveUrl);
  const displayHash =
    ipfsHash.length > 20
      ? `${ipfsHash.slice(0, 8)}...${ipfsHash.slice(-8)}`
      : ipfsHash;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <Badge
          variant="outline"
          onClick={handleOpenIPFS}
          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
        >
          <FileText className="w-3 h-3 mr-1" />
          IPFS Metadata
        </Badge>
      </div>
    );
  }

  return <></>;
};
