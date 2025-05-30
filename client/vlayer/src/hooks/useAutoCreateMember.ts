import { useEffect, useState } from "react";
import { daoService } from "../services/daoService";

interface UseAutoCreateMemberResult {
  isCreating: boolean;
  isCreated: boolean;
  error: string | null;
  createMember: () => Promise<void>;
}

export const useAutoCreateMember = (
  walletAddress?: string
): UseAutoCreateMemberResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMember = async () => {
    if (!walletAddress || isCreating || isCreated) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await daoService.createMember(walletAddress);

      if (result.success) {
        setIsCreated(true);
        console.log("Member created successfully:", result.message);
      } else {
        // If member already exists, consider it as "created"
        if (
          result.message?.toLowerCase().includes("already exists") ||
          result.message?.toLowerCase().includes("duplicate")
        ) {
          setIsCreated(true);
          console.log("Member already exists:", result.message);
        } else {
          setError(result.message || "Failed to create member");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create member";
      setError(errorMessage);
      console.error("Error creating member:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-create member when wallet address changes
  useEffect(() => {
    if (walletAddress && !isCreated && !isCreating) {
      createMember();
    }
  }, [walletAddress]);

  // Reset state when wallet address changes
  useEffect(() => {
    setIsCreated(false);
    setError(null);
  }, [walletAddress]);

  return {
    isCreating,
    isCreated,
    error,
    createMember,
  };
};
