import { isMobile } from "../../../utils";
import { useAppContext } from "../../../contexts/AppContext";

export const WelcomeScreen = () => {
  const { nextStep } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Follow Verification
          </h3>
          <p className="text-gray-600 text-sm">
            Prove you follow specific Twitter accounts
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-3xl mb-3">❤️</div>
          <h3 className="font-semibold text-gray-800 mb-2">Engagement Proof</h3>
          <p className="text-gray-600 text-sm">
            Verify likes, retweets, and interactions
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg text-center">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Profile Ownership
          </h3>
          <p className="text-gray-600 text-sm">
            Confirm ownership of your Twitter account
          </p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">
          How it works:
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-medium text-purple-600 mb-1">1. Select</div>
            <p>Choose which Twitter actions to verify</p>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600 mb-1">2. Prove</div>
            <p>Generate cryptographic proofs using vlayer</p>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600 mb-1">3. Verify</div>
            <p>Submit proofs to smart contract</p>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600 mb-1">4. Track</div>
            <p>Your verified actions are stored on-chain</p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium text-center">
            📱 Mobile Not Supported
          </p>
          <p className="text-red-500 text-sm mt-1 text-center">
            Please use a desktop browser to access this application.
          </p>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <button
            onClick={nextStep}
            id="nextButton"
            data-testid="start-page-button"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Start Verification Process
          </button>

          <p className="text-gray-500 text-sm">
            Connect your wallet and select which Twitter actions you want to
            verify
          </p>
        </div>
      )}
    </div>
  );
};
