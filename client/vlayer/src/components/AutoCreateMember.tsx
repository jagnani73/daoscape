import React from "react";
import { useAccount } from "wagmi";
import { useAutoCreateMember } from "../hooks/useAutoCreateMember";

export const AutoCreateMember: React.FC = () => {
  const { address } = useAccount();
  const { isCreating, isCreated, error } = useAutoCreateMember(address);

  React.useEffect(() => {
    if (error) {
      console.error("Auto-create member error:", error);
    }
    if (isCreated && address) {
      console.log("Member auto-created for address:", address);
    }
  }, [error, isCreated, address]);

  return null;
};
