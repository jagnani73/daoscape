import React from "react";
import { Badge } from "../../ui/badge";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const handleNavClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="w-64 mr-8">
      <nav className="space-y-2">
        <button
          onClick={() => handleNavClick("proposals")}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
            activeTab === "proposals"
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          🏠 Home
        </button>
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
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
        >
          🔍 Explore
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
        >
          🔔 Notifications
        </a>
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
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
        >
          ⚙️ Settings
        </a>
      </nav>

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
