import React from "react";
import { Button } from "../ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { formatAddress } from "../../utils/functions/helpers";

export const Header: React.FC = () => {
  const { open } = useAppKit();
  const { address } = useAccount();

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="DAOScape Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-foreground">DAOScape</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                open();
              }}
            >
              {address ? formatAddress(address) : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
