import React, { useState } from "react";
import { Button } from "./ui/button";
import { daoService } from "../services/daoService";

interface JoinDAOButtonProps {
  daoId: string;
  walletAddress?: string;
  onJoinSuccess?: () => void;
  onJoinError?: (error: string) => void;
}

export const JoinDAOButton: React.FC<JoinDAOButtonProps> = ({
  daoId,
  walletAddress,
  onJoinSuccess,
  onJoinError,
}) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinDAO = async () => {
    if (!walletAddress) {
      onJoinError?.("Please connect your wallet first");
      return;
    }

    setIsJoining(true);

    try {
      const result = await daoService.joinDAO(daoId, walletAddress);

      if (result.success) {
        onJoinSuccess?.();
        // You might want to show a success message here
        console.log("Successfully joined DAO:", result.message);
      } else {
        onJoinError?.(result.message || "Failed to join DAO");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join DAO";
      onJoinError?.(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Button
      onClick={handleJoinDAO}
      disabled={isJoining || !walletAddress}
      className="w-full"
    >
      {isJoining ? "Joining..." : "Join DAO"}
    </Button>
  );
};
