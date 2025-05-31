import React, { useState, useEffect } from "react";
import { DAOListPage } from "../../../pages/DAOListPage";
import { DAODetailPage } from "../../../pages/DAODetailPage";

interface DAOTabProps {
  selectedDAOId?: string | null;
  onDAOSelect?: (daoId: string) => void;
}

export const DAOTab: React.FC<DAOTabProps> = ({
  selectedDAOId: externalSelectedDAOId,
  onDAOSelect: externalOnDAOSelect,
}) => {
  const [internalSelectedDAOId, setInternalSelectedDAOId] = useState<
    string | null
  >(null);

  const selectedDAOId =
    externalSelectedDAOId !== undefined
      ? externalSelectedDAOId
      : internalSelectedDAOId;

  const handleDAOSelect = (daoId: string) => {
    if (externalOnDAOSelect) {
      externalOnDAOSelect(daoId);
    } else {
      setInternalSelectedDAOId(daoId);
    }
  };

  const handleBack = () => {
    if (externalOnDAOSelect) {
      externalOnDAOSelect("");
    } else {
      setInternalSelectedDAOId(null);
    }
  };

  useEffect(() => {
    if (
      externalSelectedDAOId !== undefined &&
      externalOnDAOSelect === undefined
    ) {
      setInternalSelectedDAOId(externalSelectedDAOId);
    }
  }, [externalSelectedDAOId, externalOnDAOSelect]);

  if (selectedDAOId) {
    return <DAODetailPage daoId={selectedDAOId} onBack={handleBack} />;
  }

  return <DAOListPage onDAOSelect={handleDAOSelect} />;
};
