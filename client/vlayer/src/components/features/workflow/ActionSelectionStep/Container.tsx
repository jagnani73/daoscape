import { useState, useEffect } from "react";
import { ActionSelectionPresentational } from "./Presentational";
import {
  ActionType,
  getActionName,
  AVAILABLE_ACTIONS,
} from "../../../../hooks/useDynamicTwitterProof";
import { useAppContext, SelectedAction } from "../../../../contexts/AppContext";
import { STEP_KIND } from "../../../../utils/steps";

export const ActionSelectionStep = () => {
  const { setSelectedActions: setAppSelectedActions, goToStepByKind } =
    useAppContext();
  const [selectedActions, setSelectedActions] = useState<SelectedAction[]>([
    {
      actionType: ActionType.PROFILE_VERIFICATION,
      targetValue: "",
      enabled: true,
    },
    {
      actionType: ActionType.FOLLOW_USER,
      targetValue: "",
      enabled: false,
    },
    {
      actionType: ActionType.LIKE_POST,
      targetValue: "",
      enabled: false,
    },
    {
      actionType: ActionType.RETWEET_POST,
      targetValue: "",
      enabled: false,
    },
  ]);

  const handleActionToggle = (actionType: ActionType) => {
    setSelectedActions((prev) =>
      prev.map((action) =>
        action.actionType === actionType
          ? { ...action, enabled: !action.enabled }
          : action
      )
    );
  };

  const handleTargetValueChange = (actionType: ActionType, value: string) => {
    setSelectedActions((prev) =>
      prev.map((action) =>
        action.actionType === actionType
          ? { ...action, targetValue: value }
          : action
      )
    );
  };

  const handleProceed = () => {
    const enabledActions = selectedActions.filter((action) => action.enabled);
    if (enabledActions.length === 0) {
      alert("Please select at least one action to verify.");
      return;
    }

    // Store selected actions in app context
    setAppSelectedActions(enabledActions);
    goToStepByKind(STEP_KIND.START_PROVING);
  };

  const getActionDescription = (actionType: ActionType): string => {
    switch (actionType) {
      case ActionType.PROFILE_VERIFICATION:
        return "Verify your Twitter profile ownership";
      case ActionType.FOLLOW_USER:
        return "Prove you follow a specific Twitter account";
      case ActionType.LIKE_POST:
        return "Prove you liked a specific tweet";
      case ActionType.RETWEET_POST:
        return "Prove you retweeted a specific tweet";
      default:
        return "Unknown action";
    }
  };

  const getPlaceholderText = (actionType: ActionType): string => {
    switch (actionType) {
      case ActionType.FOLLOW_USER:
        return "Enter username (e.g., vitalikbuterin)";
      case ActionType.LIKE_POST:
      case ActionType.RETWEET_POST:
        return "Enter tweet ID (e.g., 1234567890)";
      default:
        return "";
    }
  };

  const isActionValid = (action: SelectedAction): boolean => {
    if (!action.enabled) return true;

    if (action.actionType === ActionType.PROFILE_VERIFICATION) {
      return true; // No target value needed
    }

    return action.targetValue.trim().length > 0;
  };

  const canProceed =
    selectedActions.some((action) => action.enabled) &&
    selectedActions.every((action) => isActionValid(action));

  return (
    <ActionSelectionPresentational
      selectedActions={selectedActions}
      onActionToggle={handleActionToggle}
      onTargetValueChange={handleTargetValueChange}
      onProceed={handleProceed}
      getActionName={getActionName}
      getActionDescription={getActionDescription}
      getPlaceholderText={getPlaceholderText}
      isActionValid={isActionValid}
      canProceed={canProceed}
    />
  );
};
