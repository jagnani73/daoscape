import React, { useState } from "react";
import { DAOListPage } from "../../../pages/DAOListPage";
import { DAODetailPage } from "../../../pages/DAODetailPage";

export const DAOTab: React.FC = () => {
  const [selectedDAOId, setSelectedDAOId] = useState<string | null>(null);

  const handleDAOSelect = (daoId: string) => {
    setSelectedDAOId(daoId);
  };

  const handleBack = () => {
    setSelectedDAOId(null);
  };

  if (selectedDAOId) {
    return <DAODetailPage daoId={selectedDAOId} onBack={handleBack} />;
  }

  return <DAOListPage onDAOSelect={handleDAOSelect} />;
};
