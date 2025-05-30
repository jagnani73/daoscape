import {
  ConnectWalletStep,
  VerifyStep,
  ProveStep,
  SuccessStep,
  WelcomeScreen,
  InstallExtension,
  ActionSelectionStep,
} from "../components";

export type Step = {
  kind: STEP_KIND;
  path: string;
  backUrl?: string;
  component: React.ComponentType;
  title: string;
  description: string;
  headerIcon?: string;
  index: number;
};

export enum STEP_KIND {
  WELCOME,
  CONNECT_WALLET,
  ACTION_SELECTION,
  START_PROVING,
  VERIFY,
  INSTALL_EXTENSION,
  SUCCESS,
}

export const steps: Step[] = [
  {
    path: "",
    kind: STEP_KIND.WELCOME,
    component: WelcomeScreen,
    title: "Dynamic Twitter Verification",
    description:
      "Verify multiple Twitter actions dynamically. Prove you follow accounts, like posts, retweet content, and more. This example demonstrates advanced use of Web Proofs.",
    headerIcon: "/nft-illustration.svg",
    index: 0,
  },
  {
    path: "connect-wallet",
    kind: STEP_KIND.CONNECT_WALLET,
    backUrl: "",
    component: ConnectWalletStep,
    title: "Connect Wallet",
    description:
      "To proceed to the next step, please connect your wallet now by clicking the button below.",
    index: 1,
  },
  {
    path: "action-selection",
    kind: STEP_KIND.ACTION_SELECTION,
    backUrl: "/connect-wallet",
    component: ActionSelectionStep,
    title: "Select Actions",
    description:
      "Choose which Twitter actions you want to verify. You can select multiple actions to prove in a single session.",
    index: 2,
  },
  {
    path: "start-proving",
    kind: STEP_KIND.START_PROVING,
    backUrl: "/action-selection",
    component: ProveStep,
    title: "Generate Proofs",
    description:
      "Open vlayer browser extension and follow instructions to generate proofs for your selected Twitter actions.",
    index: 3,
  },
  {
    path: "install-extension",
    kind: STEP_KIND.INSTALL_EXTENSION,
    component: InstallExtension,
    backUrl: "/connect-wallet",
    title: "Install Extension",
    description: `Install vlayer browser extension to proceed to the next step.`,
    index: 2,
  },
  {
    path: "verify",
    kind: STEP_KIND.VERIFY,
    backUrl: "/start-proving",
    component: VerifyStep,
    title: "Verify Actions",
    description: `Submit your proofs to the blockchain and verify your Twitter actions on-chain.`,
    index: 4,
  },
  {
    path: "success",
    kind: STEP_KIND.SUCCESS,
    component: SuccessStep,
    title: "Success",
    description: "",
    headerIcon: "/success-illustration.svg",
    index: 5,
  },
];
