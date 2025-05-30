import React from "react";
import { Button } from "../ui/button";
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

  if (state.showHomepage) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Proof Verification
          </h2>
          <p className="text-muted-foreground mb-6">
            Verify your Twitter account ownership using vlayer Web Proofs to
            participate in governance.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started with Proof Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect your Twitter account and generate a cryptographic proof of
              ownership to unlock governance features.
            </p>
            <Button onClick={onStartProofVerification}>
              Start Verification Process
            </Button>
          </CardContent>
        </Card>

        <div className="text-center py-8 text-muted-foreground">
          No verification in progress
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Proof Verification
        </h2>
        <p className="text-muted-foreground mb-6">
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
          <div className="text-center py-8 text-muted-foreground">
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
