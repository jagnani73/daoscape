import { useState } from "react";
import { SendEmailContainer } from "../SendEmail/Container";
import { VerifyEmailContainer } from "../VerifyEmail/Container";

export enum EmailStep {
  SEND_EMAIL = "send",
  VERIFY_EMAIL = "verify",
}

export const EmailWorkflowContainer = () => {
  const [currentStep, setCurrentStep] = useState<EmailStep>(
    EmailStep.SEND_EMAIL
  );

  // Check if email has been sent by looking at localStorage
  const emailData = localStorage.getItem("emailVerificationData");
  const hasEmailData = !!emailData;

  // Auto-advance to verify step if email data exists
  if (hasEmailData && currentStep === EmailStep.SEND_EMAIL) {
    setCurrentStep(EmailStep.VERIFY_EMAIL);
  }

  const handleStepChange = (step: EmailStep) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Step Navigation */}
      <div className="pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === EmailStep.SEND_EMAIL
                    ? "bg-blue-600 text-white"
                    : hasEmailData
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {hasEmailData ? "✓" : "1"}
              </div>
              <span
                className={`font-medium ${
                  currentStep === EmailStep.SEND_EMAIL
                    ? "text-blue-600"
                    : hasEmailData
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                Send Email
              </span>
            </div>

            <div
              className={`w-20 h-1 ${
                hasEmailData ? "bg-green-600" : "bg-gray-300"
              }`}
            ></div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === EmailStep.VERIFY_EMAIL && hasEmailData
                    ? "bg-blue-600 text-white"
                    : hasEmailData
                    ? "bg-gray-400 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`font-medium ${
                  currentStep === EmailStep.VERIFY_EMAIL && hasEmailData
                    ? "text-blue-600"
                    : hasEmailData
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
                Verify Email
              </span>
            </div>
          </div>

          {/* Step Navigation Buttons */}
          {hasEmailData && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => handleStepChange(EmailStep.SEND_EMAIL)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === EmailStep.SEND_EMAIL
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Send Email
              </button>
              <button
                onClick={() => handleStepChange(EmailStep.VERIFY_EMAIL)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === EmailStep.VERIFY_EMAIL
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Verify Email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="pb-8">
        {currentStep === EmailStep.SEND_EMAIL && <SendEmailContainer />}
        {currentStep === EmailStep.VERIFY_EMAIL && hasEmailData && (
          <VerifyEmailContainer />
        )}
        {currentStep === EmailStep.VERIFY_EMAIL && !hasEmailData && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Send Email First
              </h2>
              <p className="text-gray-600 mb-6">
                You need to send an email before you can verify it.
              </p>
              <button
                onClick={() => handleStepChange(EmailStep.SEND_EMAIL)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Send Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
