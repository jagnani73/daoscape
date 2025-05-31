import React, { useState, useEffect } from "react";
import { Header } from "../shared/Header";
import { Sidebar } from "../shared/navigation/Sidebar";
import { ProofVerificationTab } from "../features/proof/ProofVerificationTab";
import { AnalyticsTab } from "../features/governance/AnalyticsTab";
import { DAOTab } from "../features/dao/DAOTab";
import { QuestTab } from "../features/quest/QuestTab";
import { ProfilePage } from "../../pages/ProfilePage";
import { AutoCreateMember } from "../AutoCreateMember";
import { STEP_KIND } from "../../utils/steps";
import { useAppContext } from "../../contexts/AppContext";

export const MainLayout: React.FC = () => {
  const { state, goToStepByKind } = useAppContext();
  const [activeTab, setActiveTab] = useState("daos");
  const [selectedDAOId, setSelectedDAOId] = useState<string | null>(null);

  useEffect(() => {
    if (!state.showHomepage) {
      setActiveTab("proof-verification");
    }
  }, [state.showHomepage]);

  const handleStartProofVerification = () => {
    setActiveTab("proof-verification");
    goToStepByKind(STEP_KIND.WELCOME);
  };

  const handleDAOSelect = (daoId: string) => {
    setSelectedDAOId(daoId === "" ? null : daoId);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "daos" && tab !== "quests") {
      setSelectedDAOId(null);
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case "daos":
        return (
          <DAOTab selectedDAOId={selectedDAOId} onDAOSelect={handleDAOSelect} />
        );
      case "quests":
        return (
          <QuestTab
            selectedDAOId={selectedDAOId}
            onDAOSelect={handleDAOSelect}
          />
        );
      case "proof-verification":
        return (
          <ProofVerificationTab
            state={state}
            onStartProofVerification={handleStartProofVerification}
            goToStepByKind={goToStepByKind}
          />
        );
      case "analytics":
        return <AnalyticsTab />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <DAOTab selectedDAOId={selectedDAOId} onDAOSelect={handleDAOSelect} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AutoCreateMember />

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onDAOSelect={handleDAOSelect}
          />

          <div className="flex-1">
            <div className="mt-6">{renderActiveContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
