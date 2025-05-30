import React from "react";
import { ActionType } from "../../../hooks/useDynamicTwitterProof";
import { SelectedAction } from "./Container";

interface ActionSelectionPresentationalProps {
  selectedActions: SelectedAction[];
  onActionToggle: (actionType: ActionType) => void;
  onTargetValueChange: (actionType: ActionType, value: string) => void;
  onProceed: () => void;
  getActionName: (actionType: ActionType) => string;
  getActionDescription: (actionType: ActionType) => string;
  getPlaceholderText: (actionType: ActionType) => string;
  isActionValid: (action: SelectedAction) => boolean;
  canProceed: boolean;
}

export const ActionSelectionPresentational: React.FC<
  ActionSelectionPresentationalProps
> = ({
  selectedActions,
  onActionToggle,
  onTargetValueChange,
  onProceed,
  getActionName,
  getActionDescription,
  getPlaceholderText,
  isActionValid,
  canProceed,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Select Twitter Actions to Verify
          </h1>
          <p className="text-lg text-gray-600">
            Choose which Twitter actions you want to prove and provide the
            necessary details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {selectedActions.map((action) => (
            <div
              key={action.actionType}
              className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                action.enabled
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {getActionName(action.actionType)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {getActionDescription(action.actionType)}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={action.enabled}
                    onChange={() => onActionToggle(action.actionType)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {action.enabled && getPlaceholderText(action.actionType) && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder={getPlaceholderText(action.actionType)}
                    value={action.targetValue}
                    onChange={(e) =>
                      onTargetValueChange(action.actionType, e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isActionValid(action)
                        ? "border-gray-300"
                        : "border-red-500 bg-red-50"
                    }`}
                  />
                  {!isActionValid(action) && (
                    <p className="text-red-500 text-sm mt-2">
                      This field is required when the action is enabled.
                    </p>
                  )}
                </div>
              )}

              {action.enabled &&
                action.actionType === ActionType.PROFILE_VERIFICATION && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      ℹ️ Profile verification will automatically detect your
                      Twitter username.
                    </p>
                  </div>
                )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onProceed}
            disabled={!canProceed}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              canProceed
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Start Verification Process
          </button>

          {!canProceed && (
            <p className="text-red-500 text-sm mt-3">
              Please select at least one action and fill in all required fields.
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            You can verify multiple actions in a single session. Each action
            will be processed sequentially.
          </p>
        </div>
      </div>
    </div>
  );
};
