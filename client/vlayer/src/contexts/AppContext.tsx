import React, { createContext, useContext, useState, ReactNode } from "react";
import { STEP_KIND, Step, steps } from "../utils/steps";

export interface SelectedAction {
  actionType: any;
  targetValue: string;
  enabled: boolean;
}

interface AppState {
  currentStepIndex: number;
  currentStep: Step;
  selectedActions: SelectedAction[];
  proofData: any;
  verificationResults: any;
  showHomepage: boolean;
}

interface AppContextType {
  state: AppState;
  goToStep: (stepIndex: number) => void;
  goToStepByKind: (stepKind: STEP_KIND) => void;
  nextStep: () => void;
  previousStep: () => void;
  setSelectedActions: (actions: SelectedAction[]) => void;
  setProofData: (data: any) => void;
  setVerificationResults: (results: any) => void;
  showHomepage: () => void;
  hideHomepage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentStepIndex: 0,
    currentStep: steps[0],
    selectedActions: [],
    proofData: null,
    verificationResults: null,
    showHomepage: true,
  });

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setState((prev) => ({
        ...prev,
        currentStepIndex: stepIndex,
        currentStep: steps[stepIndex],
        showHomepage: false,
      }));
    }
  };

  const goToStepByKind = (stepKind: STEP_KIND) => {
    const stepIndex = steps.findIndex((step) => step.kind === stepKind);
    if (stepIndex !== -1) {
      goToStep(stepIndex);
    }
  };

  const nextStep = () => {
    goToStep(state.currentStepIndex + 1);
  };

  const previousStep = () => {
    goToStep(state.currentStepIndex - 1);
  };

  const setSelectedActions = (actions: SelectedAction[]) => {
    setState((prev) => ({
      ...prev,
      selectedActions: actions,
    }));
  };

  const setProofData = (data: any) => {
    setState((prev) => ({
      ...prev,
      proofData: data,
    }));
  };

  const setVerificationResults = (results: any) => {
    setState((prev) => ({
      ...prev,
      verificationResults: results,
    }));
  };

  const showHomepage = () => {
    setState((prev) => ({
      ...prev,
      showHomepage: true,
    }));
  };

  const hideHomepage = () => {
    setState((prev) => ({
      ...prev,
      showHomepage: false,
    }));
  };

  const contextValue: AppContextType = {
    state,
    goToStep,
    goToStepByKind,
    nextStep,
    previousStep,
    setSelectedActions,
    setProofData,
    setVerificationResults,
    showHomepage,
    hideHomepage,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
