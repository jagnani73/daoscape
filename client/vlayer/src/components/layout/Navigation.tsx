import * as React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../../contexts/AppContext";

export const Navigation: React.FC = () => {
  const { state, previousStep } = useAppContext();
  const currentStep = state.currentStep;
  const canGoBack = state.currentStepIndex > 0;

  return (
    <nav
      className="flex gap-10 justify-between max-w-[480px] w-full"
      style={{ opacity: canGoBack ? 1 : 0 }}
    >
      <BackButton
        back={() => {
          if (canGoBack) {
            previousStep();
          }
        }}
      />
    </nav>
  );
};

export const BackButton: React.FC<{ back: () => void }> = ({ back }) => {
  return (
    <button
      onClick={back}
      className="flex gap-1.5 justify-center items-center px-2 py-0 my-auto h-8 text-xs leading-3 text-center text-gray-800 whitespace-nowrap rounded-lg shadow-sm min-h-[32px]"
    >
      <ChevronLeftIcon className="w-3.5 h-3.5" />
      <span className="self-stretch my-auto">Back</span>
    </button>
  );
};
