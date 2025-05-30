import { useEffect, useRef, useState } from "react";
import {
  useMultipleDynamicTwitterProof,
  ActionType,
} from "../../../../hooks/useDynamicTwitterProof";
import { ProveStepPresentational } from "./Presentational";
import { useAccount } from "wagmi";
import { useAppContext, SelectedAction } from "../../../../contexts/AppContext";
import { STEP_KIND } from "../../../../utils/steps";

export const ProveStep = () => {
  const { state, goToStepByKind } = useAppContext();
  const { address } = useAccount();
  const [disabled, setDisabled] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const selectedActions = state.selectedActions || [];

  // Check if we have valid actions, if not redirect back
  useEffect(() => {
    if (selectedActions.length === 0) {
      goToStepByKind(STEP_KIND.ACTION_SELECTION);
      return;
    }
  }, [selectedActions.length, goToStepByKind]);

  // Convert selected actions to the format expected by the hook
  const actionsForProof = selectedActions
    .filter((action) => action.enabled && action.actionType !== undefined)
    .map((action) => ({
      actionType: action.actionType,
      targetValue: action.targetValue,
    }));

  // Provide a default empty action to avoid conditional hook calls
  const safeActionsForProof =
    actionsForProof.length > 0
      ? actionsForProof
      : [{ actionType: ActionType.PROFILE_VERIFICATION, targetValue: "" }];

  // Always call the hook to avoid conditional hook issues
  const hookResult = useMultipleDynamicTwitterProof(safeActionsForProof);

  // Only use the hook result if we have valid actions
  const shouldUseResult = actionsForProof.length > 0;

  const {
    requestWebProof,
    webProof,
    callProver,
    isPending,
    isCallProverIdle,
    result,
    error,
    currentAction,
    currentActionIndex,
    totalActions,
    progress,
    isComplete,
  } = hookResult;

  useEffect(() => {
    if (
      shouldUseResult &&
      webProof &&
      isCallProverIdle &&
      currentAction &&
      address
    ) {
      console.log("Calling prover with actionType:", currentAction.actionType);
      console.log("Current action:", currentAction);
      void callProver([
        webProof,
        currentAction.actionType,
        "", // username will be extracted from proof
        currentAction.targetValue || "",
        address,
      ]);
    }
  }, [
    shouldUseResult,
    webProof,
    address,
    callProver,
    isCallProverIdle,
    currentAction?.actionType,
    currentAction?.targetValue,
  ]);

  useEffect(() => {
    if (shouldUseResult && isComplete) {
      goToStepByKind(STEP_KIND.VERIFY);
    }
  }, [shouldUseResult, isComplete, goToStepByKind]);

  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (shouldUseResult && error) {
      throw error;
    }
  }, [shouldUseResult, error]);

  const handleStartProving = () => {
    if (selectedActions.length > 0) {
      requestWebProof();
    }
  };

  // If no valid actions, this should not happen due to redirect
  if (actionsForProof.length === 0) {
    return <div>No valid actions found. Redirecting...</div>;
  }

  return (
    <ProveStepPresentational
      requestWebProof={handleStartProving}
      isPending={shouldUseResult ? isPending : false}
      disabled={disabled}
      setDisabled={setDisabled}
      selectedActions={selectedActions}
      currentAction={shouldUseResult ? currentAction : undefined}
      currentActionIndex={shouldUseResult ? currentActionIndex : 0}
      totalActions={shouldUseResult ? totalActions : 0}
      progress={shouldUseResult ? progress : 0}
      isComplete={shouldUseResult ? isComplete : false}
    />
  );
};
