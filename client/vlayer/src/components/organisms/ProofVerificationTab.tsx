import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { VerificationStepCard } from "../molecules/VerificationStepCard";
import { STEP_KIND } from "../../utils/steps";
import { AppState } from "../../types/common";

interface ProofVerificationTabProps {
  state: AppState;
  onStartProofVerification: () => void;
  goToStepByKind: (kind: STEP_KIND) => void;
}

export const ProofVerificationTab: React.FC<ProofVerificationTabProps> = ({
  state,
  onStartProofVerification,
  goToStepByKind,
}) => {
  const handleBackToStart = () => {
    goToStepByKind(STEP_KIND.WELCOME);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Proof Verification
        </h2>
        <p className="text-gray-600 mb-6">
          Verify Twitter actions and generate cryptographic proofs for
          governance participation.
        </p>
      </div>

      <VerificationStepCard
        state={state}
        onStartProofVerification={onStartProofVerification}
        onBackToStart={handleBackToStart}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>
            View your recent proof verification attempts and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No verifications yet</p>
            <p className="text-sm">
              Start your first verification to see results here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
