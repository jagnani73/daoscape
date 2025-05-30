import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { daoService } from "../../../../services/daoService";

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
      // First, ensure the member exists in the system
      console.log("Ensuring member exists for wallet:", walletAddress);
      const memberResult = await daoService.createMember(walletAddress);

      if (
        !memberResult.success &&
        !memberResult.message?.toLowerCase().includes("already exists") &&
        !memberResult.message?.toLowerCase().includes("duplicate")
      ) {
        console.warn("Failed to create/verify member:", memberResult.message);
      }

      // Then join the DAO
      console.log("Joining DAO:", daoId);
      const joinResult = await daoService.joinDAO(daoId, walletAddress);

      if (joinResult.success) {
        onJoinSuccess?.();
        console.log("Successfully joined DAO:", joinResult.message);
      } else {
        onJoinError?.(joinResult.message || "Failed to join DAO");
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
