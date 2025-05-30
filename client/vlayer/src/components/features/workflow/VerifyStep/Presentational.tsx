import {
  ActionType,
  getActionName,
} from "../../../../hooks/useDynamicTwitterProof";

interface SelectedAction {
  actionType: ActionType;
  targetValue: string;
  enabled: boolean;
}

interface VerifyStepPresentationalProps {
  selectedActions: SelectedAction[];
  onVerifySingle: (actionIndex: number) => void;
  onVerifyMultiple: () => void;
  isVerifying: boolean;
  hasProofData: boolean;
}

export const VerifyStepPresentational: React.FC<
  VerifyStepPresentationalProps
> = ({
  selectedActions,
  onVerifySingle,
  onVerifyMultiple,
  isVerifying,
  hasProofData,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Verify Your Actions
          </h1>
          <p className="text-lg text-gray-600">
            Submit your proofs to the blockchain to verify your Twitter actions
            on-chain.
          </p>
        </div>

        {!hasProofData ? (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              No Proof Data Found
            </h2>
            <p className="text-gray-600 mb-6">
              Please go back and generate proofs for your selected actions
              first.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Selected Actions Display */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Actions to Verify:
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedActions.map((action, index) => (
                  <div
                    key={action.actionType}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {getActionName(action.actionType)}
                        </h4>
                        {action.targetValue && (
                          <p className="text-sm text-gray-600">
                            Target: {action.targetValue}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onVerifySingle(index)}
                        disabled={isVerifying}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isVerifying
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isVerifying ? "Verifying..." : "Verify Single"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Options */}
            <div className="text-center space-y-4">
              <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Batch Verification (Recommended)
                </h3>
                <p className="text-purple-600 text-sm mb-4">
                  Verify all selected actions in a single transaction to save on
                  gas fees.
                </p>
                <button
                  onClick={onVerifyMultiple}
                  disabled={isVerifying || selectedActions.length === 0}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isVerifying || selectedActions.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isVerifying
                    ? "Verifying..."
                    : `Verify All ${selectedActions.length} Actions`}
                </button>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  💡 Tip: Batch verification is more gas-efficient and processes
                  all your actions at once.
                </p>
              </div>
            </div>

            {/* Status Information */}
            {isVerifying && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">
                    Submitting verification to blockchain...
                  </span>
                </div>
                <p className="text-blue-600 text-sm text-center mt-2">
                  Please confirm the transaction in your wallet and wait for
                  confirmation.
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                What happens next:
              </h4>
              <ol className="text-gray-600 text-sm space-y-1">
                <li>1. Your proofs will be submitted to the smart contract</li>
                <li>2. The contract will verify your Twitter actions</li>
                <li>3. Your verification data will be stored on-chain</li>
                <li>
                  4. You'll receive a confirmation of successful verification
                </li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
