import React from "react";
import { Button } from "../ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { formatAddress } from "../../utils/functions/helpers";

export const Header: React.FC = () => {
  const { open } = useAppKit();
  const { address } = useAccount();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              vlayer Governance
            </h1>
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
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
