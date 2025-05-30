import React from "react";
import { useAppContext } from "../contexts/AppContext";
import { MainLayout } from "../components/layout/MainLayout";

export const HomePage: React.FC = () => {
  const { state, goToStepByKind } = useAppContext();

  return <MainLayout state={state} goToStepByKind={goToStepByKind} />;
};
