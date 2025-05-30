import {
  ActionType,
  getActionName,
} from "../../../../hooks/useDynamicTwitterProof";

interface SelectedAction {
  actionType: ActionType;
  targetValue: string;
  enabled: boolean;
}

interface CurrentAction {
  actionType: ActionType;
  targetValue?: string;
}

export const ProveStepPresentational = ({
  requestWebProof,
  isPending,
  disabled,
  setDisabled,
  selectedActions = [],
  currentAction,
  currentActionIndex = 0,
  totalActions = 1,
  progress = 0,
  isComplete = false,
}: {
  requestWebProof: () => void;
  isPending: boolean;
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
  selectedActions?: SelectedAction[];
  currentAction?: CurrentAction;
  currentActionIndex?: number;
  totalActions?: number;
  progress?: number;
  isComplete?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Generate Proofs
          </h1>
          <p className="text-lg text-gray-600">
            {isComplete
              ? "All proofs generated successfully!"
              : isPending
              ? "Generating proofs for your selected actions..."
              : "Ready to start generating proofs for your Twitter actions."}
          </p>
        </div>

        {/* Progress Bar */}
        {totalActions > 1 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {currentActionIndex + 1} of {totalActions} actions
            </div>
          </div>
        )}

        {/* Current Action Display */}
        {currentAction && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">
              Current Action: {getActionName(currentAction.actionType)}
            </h3>
            {currentAction.targetValue && (
              <p className="text-purple-600 text-sm">
                Target: {currentAction.targetValue}
              </p>
            )}
          </div>
        )}

        {/* Selected Actions List */}
        {selectedActions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Selected Actions:
            </h3>
            <div className="space-y-3">
              {selectedActions.map((action, index) => (
                <div
                  key={action.actionType}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index < currentActionIndex
                      ? "bg-green-50 border-green-200"
                      : index === currentActionIndex
                      ? "bg-purple-50 border-purple-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div>
                    <span className="font-medium">
                      {getActionName(action.actionType)}
                    </span>
                    {action.targetValue && (
                      <span className="text-gray-600 text-sm ml-2">
                        ({action.targetValue})
                      </span>
                    )}
                  </div>
                  <div>
                    {index < currentActionIndex ? (
                      <span className="text-green-600 text-sm">✓ Complete</span>
                    ) : index === currentActionIndex ? (
                      <span className="text-purple-600 text-sm">
                        {isPending ? "In Progress..." : "Current"}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          {!isComplete ? (
            <button
              disabled={disabled || isPending}
              id="nextButton"
              onClick={() => {
                requestWebProof();
                setDisabled(true);
              }}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                disabled || isPending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              {isPending ? "Proving in progress..." : "Open Extension"}
            </button>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                All Proofs Generated!
              </h2>
              <p className="text-gray-600 mb-6">
                You can now proceed to verify your actions on-chain.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!isComplete && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
            <ol className="text-blue-700 text-sm space-y-1">
              <li>1. Click "Open Extension" to start the proof generation</li>
              <li>
                2. Follow the instructions in the vlayer browser extension
              </li>
              <li>3. Complete the required Twitter actions if prompted</li>
              <li>4. Wait for all proofs to be generated</li>
              <li>5. Proceed to the verification step</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
