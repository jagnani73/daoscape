import { useAccount } from "wagmi";
import { SuccessStepPresentational } from "./Presentational";
import { useAppContext } from "../../../contexts/AppContext";

export const SuccessStep = () => {
  const { chain } = useAccount();
  const { state } = useAppContext();
  const verificationResults = state.verificationResults;

  const tx = verificationResults?.txHash || "";
  const handle = ""; // This could be extracted from verification results if needed

  return (
    <SuccessStepPresentational
      tx={tx}
      handle={handle}
      blockExplorer={chain?.blockExplorers?.default?.url}
    />
  );
};
