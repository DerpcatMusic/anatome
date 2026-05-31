export function useWizardNav(
  getters: {
    getStepIndex: () => number;
    getCanProceed: () => boolean;
    getIsFirst: () => boolean;
    getIsLast: () => boolean;
    getCurrentStepId: () => string;
    getNameComplete: () => boolean;
  },
  setters: {
    setStepIndex: (v: number) => void;
    setStepValidationAttempted: (v: boolean) => void;
    setError: (v: string) => void;
    setNameWarning: (v: boolean) => void;
  },
) {
  const { setStepIndex, setStepValidationAttempted, setError, setNameWarning } = setters;

  function goToStep(index: number) {
    if (index < 0) return;
    setStepIndex(index);
    setStepValidationAttempted(false);
    setError("");
    setNameWarning(false);
  }

  const handleGoToStep = (index: number) => () => goToStep(index);

  function next() {
    setStepValidationAttempted(true);
    if (getters.getCurrentStepId() === "name" && !getters.getNameComplete()) {
      setNameWarning(true);
      return;
    }
    if (!getters.getCanProceed()) return;
    setError("");
    setNameWarning(false);
    setStepValidationAttempted(false);
    if (!getters.getIsLast()) {
      setStepIndex(getters.getStepIndex() + 1);
    }
  }

  function back() {
    setError("");
    setStepValidationAttempted(false);
    if (!getters.getIsFirst()) {
      setStepIndex(getters.getStepIndex() - 1);
    }
  }

  return { goToStep, handleGoToStep, next, back };
}
