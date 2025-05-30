import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Header } from "../shared/Header";
import { Sidebar } from "../shared/navigation/Sidebar";
import { ProposalsTab } from "../features/governance/ProposalsTab";
import { ProofVerificationTab } from "../features/proof/ProofVerificationTab";
import { AnalyticsTab } from "../features/governance/AnalyticsTab";
import { ProfilePage } from "../../pages/ProfilePage";
import { STEP_KIND } from "../../utils/steps";
import { useAppContext } from "../../contexts/AppContext";

export const MainLayout: React.FC = () => {
  const { state, goToStepByKind } = useAppContext();
  const [activeTab, setActiveTab] = useState("proposals");

  useEffect(() => {
    if (!state.showHomepage) {
      setActiveTab("proof-verification");
    }
  }, [state.showHomepage]);

  const handleStartProofVerification = () => {
    setActiveTab("proof-verification");
    goToStepByKind(STEP_KIND.WELCOME);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-muted">
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
                <TabsTrigger value="proof-verification">
                  Proof Verification
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="proposals" className="mt-6">
                <ProposalsTab />
              </TabsContent>

              <TabsContent value="proof-verification" className="mt-6">
                <ProofVerificationTab
                  state={state}
                  onStartProofVerification={handleStartProofVerification}
                  goToStepByKind={goToStepByKind}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AnalyticsTab />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <ProfilePage />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
