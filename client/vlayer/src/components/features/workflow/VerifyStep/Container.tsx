import { useEffect, useRef, useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
} from "wagmi";
import { useLocalStorage } from "usehooks-ts";
import { useNotification } from "@blockscout/app-sdk";
import dynamicTwitterVerifier from "../../../../../../out/DynamicTwitterVerifier.sol/DynamicTwitterVerifier.json";
import { VerifyStepPresentational } from "./Presentational";
import { ensureBalance } from "../../../../utils/ethFaucet";
import { useAppContext } from "../../../../contexts/AppContext";
import { STEP_KIND } from "../../../../utils/steps";

export const VerifyStep = () => {
  const { state, goToStepByKind, setVerificationResults } = useAppContext();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<Error | null>(
    null
  );
  const [proverResult] = useLocalStorage("proverResult", "");
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: txHash, error } = useWriteContract();
  const { openTxToast } = useNotification();
  const { status } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const selectedActions = state.selectedActions;

  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  const handleVerifySingleAction = async (actionIndex: number) => {
    setIsVerifying(true);

    if (!proverResult) {
      setVerificationError(new Error("No proof data available"));
      return;
    }

    const action = selectedActions[actionIndex];
    if (!action) {
      setVerificationError(new Error("Invalid action index"));
      return;
    }

    try {
      const proofData = JSON.parse(proverResult) as any[];

      const proof = proofData[0];
      const actionVerified = proofData[1];
      const actualValue = proofData[2];
      const account = proofData[3];
      const actionId = proofData[4];
      const username = proofData[5];
      const targetValue = proofData[6];

      const writeContractArgs = {
        address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
        abi: dynamicTwitterVerifier.abi,
        functionName: "verifySingleAction",
        args: [
          proof,
          actionVerified,
          actualValue,
          account,
          actionId,
          username,
          targetValue,
        ],
      };

      await ensureBalance(address as `0x${string}`, balance?.value ?? 0n);
      writeContract(writeContractArgs);
    } catch (error) {
      setVerificationError(error as Error);
    }
  };

  const handleVerifyMultipleActions = async () => {
    setIsVerifying(true);

    if (!proverResult) {
      setVerificationError(new Error("No proof data available"));
      return;
    }

    try {
      const proofData = JSON.parse(proverResult) as any[];

      const proof = proofData[0];
      const results = proofData[1];
      const actualValues = proofData[2];
      const account = proofData[3];
      const actionIds = proofData[4];
      const username = proofData[5];
      const targetValues = proofData[6];

      const writeContractArgs = {
        address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
        abi: dynamicTwitterVerifier.abi,
        functionName: "verifyMultipleActions",
        args: [
          proof,
          results,
          actualValues,
          account,
          actionIds,
          username,
          targetValues,
        ],
      };

      await ensureBalance(address as `0x${string}`, balance?.value ?? 0n);
      writeContract(writeContractArgs);
    } catch (error) {
      setVerificationError(error as Error);
    }
  };

  useEffect(() => {
    if (status === "success") {
      setIsVerifying(false);
      setVerificationResults({
        txHash,
        actionsCount: selectedActions.length,
        timestamp: Date.now(),
      });
      goToStepByKind(STEP_KIND.SUCCESS);
    }
  }, [
    status,
    txHash,
    selectedActions.length,
    goToStepByKind,
    setVerificationResults,
  ]);

  useEffect(() => {
    if (txHash) {
      openTxToast("84532", txHash);
    }
  }, [txHash, openTxToast]);

  useEffect(() => {
    if (error) {
      setIsVerifying(false);
      setVerificationError(new Error(error.message));
    }
  }, [error]);

  useEffect(() => {
    if (verificationError) {
      setIsVerifying(false);
      throw verificationError;
    }
  }, [verificationError]);

  return (
    <VerifyStepPresentational
      selectedActions={selectedActions}
      onVerifySingle={handleVerifySingleAction}
      onVerifyMultiple={handleVerifyMultipleActions}
      isVerifying={isVerifying}
      hasProofData={!!proverResult}
    />
  );
};
