import { STEP_KIND } from "../utils/steps";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: "active" | "passed" | "failed" | "pending";
  votes: number;
  quorum: string;
  timeAgo: string;
  author: string;
}

export interface Step {
  component: React.ComponentType;
  title?: string;
  description?: string;
  headerIcon?: string;
  kind?: STEP_KIND;
  index?: number;
}

export interface AppState {
  showHomepage: boolean;
  currentStep: Step;
  currentStepIndex: number;
}
