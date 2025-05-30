import { useExtension } from "../../../hooks/useExtension";
import { InstallExtensionPresentational } from "./Presentationa";
import { useEffect } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { STEP_KIND } from "../../../utils/steps";

export const InstallExtension = () => {
  const { hasExtensionInstalled } = useExtension();
  const { goToStepByKind } = useAppContext();

  useEffect(() => {
    if (hasExtensionInstalled) {
      goToStepByKind(STEP_KIND.START_PROVING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExtensionInstalled]);

  return <InstallExtensionPresentational />;
};
