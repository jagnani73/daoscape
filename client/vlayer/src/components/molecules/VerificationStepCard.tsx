import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { STEP_KIND } from "../../utils/steps";

interface Step {
  component: React.ComponentType;
  title?: string;
  description?: string;
  headerIcon?: string;
  kind?: STEP_KIND;
  index?: number;
}

interface AppState {
  showHomepage: boolean;
  currentStep: Step;
  currentStepIndex: number;
}

interface VerificationStepCardProps {
  state: AppState;
  onStartProofVerification: () => void;
  onBackToStart: () => void;
}

export const VerificationStepCard: React.FC<VerificationStepCardProps> = ({
  state,
  onStartProofVerification,
  onBackToStart,
}) => {
  if (state.showHomepage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Twitter Verification</CardTitle>
          <CardDescription>
            Verify multiple Twitter actions dynamically. Prove you follow
            accounts, like posts, retweet content, and more using vlayer's Web
            Proof technology.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔗</div>
                <h3 className="font-medium">Connect Wallet</h3>
                <p className="text-sm text-gray-600">
                  Link your wallet to start verification
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <h3 className="font-medium">Select Actions</h3>
                <p className="text-sm text-gray-600">
                  Choose Twitter actions to verify
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔐</div>
                <h3 className="font-medium">Generate Proof</h3>
                <p className="text-sm text-gray-600">
                  Create cryptographic proof
                </p>
              </div>
            </div>
            <Button
              onClick={onStartProofVerification}
              className="w-full"
              size="lg"
            >
              Start Proof Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CurrentStepComponent = state.currentStep.component;
  const currentStep = state.currentStep;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {currentStep?.headerIcon && (
                <img
                  src={currentStep.headerIcon}
                  alt="Step icon"
                  className="w-8 h-8"
                />
              )}
              {currentStep?.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {currentStep?.description}
            </CardDescription>
          </div>
          {state.currentStepIndex > 0 && (
            <Button variant="outline" onClick={onBackToStart} size="sm">
              ← Back to Start
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        {!state.showHomepage &&
          currentStep?.kind !== STEP_KIND.WELCOME &&
          currentStep?.kind !== STEP_KIND.SUCCESS && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Step {currentStep?.index || 0} of 5</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStep?.index || 0) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
      </CardHeader>
      <CardContent>
        <CurrentStepComponent />
      </CardContent>
    </Card>
  );
};
