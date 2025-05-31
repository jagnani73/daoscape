import React from "react";
import { Badge } from "../../ui/badge";
import { useUserDAOs } from "../../../hooks/useUserDAOs";
import { useAccount } from "wagmi";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onDAOSelect?: (daoId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onDAOSelect,
}) => {
  const { address, isConnected } = useAccount();
  const { userDAOs, loading } = useUserDAOs();

  const handleNavClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleDAOClick = (daoId: string) => {
    // First switch to DAOs tab, then select the specific DAO
    if (onTabChange) {
      onTabChange("daos");
    }
    if (onDAOSelect) {
      onDAOSelect(daoId);
    }
  };

  const getHouseBadge = (house: string) => {
    const houseColors = {
      "1": "bg-red-100 text-red-800 border-red-200",
      "2": "bg-blue-100 text-blue-800 border-blue-200",
      "3": "bg-green-100 text-green-800 border-green-200",
      "4": "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      houseColors[house as keyof typeof houseColors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  return (
    <div className="w-64 mr-8">
      <nav className="space-y-2">
        <button
          onClick={() => handleNavClick("daos")}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
            activeTab === "daos"
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          🏛️ DAOs
        </button>
        <button
          onClick={() => handleNavClick("proof-verification")}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
            activeTab === "proof-verification"
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          🔐 Proof Verification
        </button>
        <button
          onClick={() => handleNavClick("analytics")}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
            activeTab === "analytics"
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          📊 Analytics
        </button>
        <button
          onClick={() => handleNavClick("profile")}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
            activeTab === "profile"
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          👤 Profile
        </button>
      </nav>

      {/* My DAOs Section */}
      {isConnected && address && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-foreground mb-4">MY DAOs</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">⏳</span>
                Loading your DAOs...
              </div>
            ) : userDAOs.length > 0 ? (
              userDAOs.map((dao) => (
                <button
                  key={dao.dao_id}
                  onClick={() => handleDAOClick(dao.dao_id)}
                  className="flex items-center justify-between px-3 py-2 text-sm rounded-md w-full text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="mr-2">🏛️</span>
                    <span className="truncate group-hover:text-foreground">
                      {dao.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getHouseBadge(dao.house)}`}
                    >
                      H{dao.house}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {dao.reputation}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">📋</span>
                No DAOs joined yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboarding Section */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-foreground mb-4">ONBOARDING</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">📋</span>
            Setup your profile
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">📋</span>
            Follow at least 3 spaces
            <Badge variant="secondary" className="ml-2 text-xs">
              1/3
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-foreground mb-4">Status</h3>
        <select className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-transparent">
          <option>Any</option>
          <option>Active</option>
          <option>Passed</option>
          <option>Failed</option>
        </select>
      </div>
    </div>
  );
};
