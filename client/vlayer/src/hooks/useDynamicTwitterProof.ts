import { useEffect, useState } from "react";
import {
  useCallProver,
  useWaitForProvingResult,
  useWebProof,
  useChain,
} from "@vlayer/react";
import { useLocalStorage } from "usehooks-ts";
import { WebProofConfig, ProveArgs } from "@vlayer/sdk";
import { Abi, ContractFunctionName } from "viem";
import { startPage, expectUrl, notarize } from "@vlayer/sdk/web_proof";
import { UseChainError, WebProofError } from "../errors";
import dynamicTwitterProver from "../constants/DynamicTwitterProver.json";

// Action types enum matching the contract
export enum ActionType {
  PROFILE_VERIFICATION = 0,
  FOLLOW_USER = 1,
  LIKE_POST = 2,
  RETWEET_POST = 3,
  REPLY_TO_POST = 4,
  QUOTE_TWEET = 5,
}

// Action configuration interface
export interface ActionConfig {
  actionType: ActionType;
  baseUrl: string;
  jsonPath: string;
  expectedValue: string;
  isActive: boolean;
}

// Available actions with their configurations
export const AVAILABLE_ACTIONS: Record<ActionType, ActionConfig> = {
  [ActionType.PROFILE_VERIFICATION]: {
    actionType: ActionType.PROFILE_VERIFICATION,
    baseUrl: "https://api.x.com/1.1/account/settings.json",
    jsonPath: "screen_name",
    expectedValue: "",
    isActive: true,
  },
  [ActionType.FOLLOW_USER]: {
    actionType: ActionType.FOLLOW_USER,
    baseUrl:
      "https://x.com/i/api/graphql/xWw45l6nX7DP2FKRyePXSw/UserByScreenName",
    jsonPath: "data.user.result.relationship_perspectives.following",
    expectedValue: "true",
    isActive: true,
  },
  [ActionType.LIKE_POST]: {
    actionType: ActionType.LIKE_POST,
    baseUrl: "https://x.com/i/api/graphql/u5Tij6ERlSH2LZvCUqallw/TweetDetail",
    jsonPath:
      "data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited",
    expectedValue: "true",
    isActive: true,
  },
  [ActionType.RETWEET_POST]: {
    actionType: ActionType.RETWEET_POST,
    baseUrl: "https://x.com/i/api/graphql/u5Tij6ERlSH2LZvCUqallw/TweetDetail",
    jsonPath:
      "data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted",
    expectedValue: "true",
    isActive: true,
  },
  [ActionType.REPLY_TO_POST]: {
    actionType: ActionType.REPLY_TO_POST,
    baseUrl: "https://api.x.com/1.1/statuses/mentions_timeline.json",
    jsonPath: "in_reply_to_screen_name",
    expectedValue: "",
    isActive: false,
  },
  [ActionType.QUOTE_TWEET]: {
    actionType: ActionType.QUOTE_TWEET,
    baseUrl: "https://api.x.com/1.1/statuses/show.json",
    jsonPath: "quoted_status_id",
    expectedValue: "",
    isActive: false,
  },
};

const createWebProofConfig = (
  actionType: ActionType,
  targetValue?: string
): WebProofConfig<Abi, string> => {
  const action = AVAILABLE_ACTIONS[actionType];

  let notarizeUrl = action.baseUrl;
  let startPageUrl = "https://x.com/";
  let startPageInstruction = "Go to x.com login page";
  let expectUrlAfterLogin = "https://x.com/home";
  let expectUrlInstruction = "Log in";

  if (actionType === ActionType.FOLLOW_USER && targetValue) {
    const variables = encodeURIComponent(
      JSON.stringify({ screen_name: targetValue })
    );

    notarizeUrl = `${action.baseUrl}`;
    startPageUrl = `https://x.com/${targetValue}`;
    startPageInstruction = `Go to @${targetValue}'s profile page`;
    expectUrlAfterLogin = `https://x.com/${targetValue}`;
    expectUrlInstruction = `Navigate to @${targetValue}'s profile and log in if needed`;
  } else if (
    (actionType === ActionType.LIKE_POST ||
      actionType === ActionType.RETWEET_POST) &&
    targetValue
  ) {
    notarizeUrl = `${action.baseUrl}`;
    startPageUrl = `https://x.com/i/web/status/${targetValue}`;
    startPageInstruction = `Go to the specific tweet (ID: ${targetValue})`;
    expectUrlAfterLogin = `https://x.com/i/web/status/${targetValue}`;
    expectUrlInstruction = `Navigate to the tweet and log in if needed`;
  }

  return {
    proverCallCommitment: {
      address: import.meta.env.VITE_PROVER_ADDRESS as `0x${string}`,
      proverAbi: dynamicTwitterProver.abi as Abi,
      functionName: "verifyAction" as const,
      commitmentArgs: [],
      chainId: 84532,
    },
    logoUrl: "http://twitterswap.com/logo.png",
    steps: [
      startPage(startPageUrl, startPageInstruction),
      expectUrl(expectUrlAfterLogin, expectUrlInstruction),
      notarize(
        notarizeUrl,
        "GET",
        `Generate Proof of ${getActionName(actionType)}`,
        [
          {
            request: {
              headers_except: [],
            },
          },
          {
            response: {
              headers_except: ["Transfer-Encoding"],
            },
          },
        ]
      ),
    ],
  };
};

// Helper function to get action name
export const getActionName = (actionType: ActionType): string => {
  switch (actionType) {
    case ActionType.PROFILE_VERIFICATION:
      return "Profile Verification";
    case ActionType.FOLLOW_USER:
      return "Follow User";
    case ActionType.LIKE_POST:
      return "Like Post";
    case ActionType.RETWEET_POST:
      return "Retweet Post";
    case ActionType.REPLY_TO_POST:
      return "Reply to Post";
    case ActionType.QUOTE_TWEET:
      return "Quote Tweet";
    default:
      return "Unknown Action";
  }
};

export const useDynamicTwitterProof = (
  actionType: ActionType,
  targetValue?: string
) => {
  const [error, setError] = useState<Error | null>(null);

  // Add validation for actionType
  if (actionType === undefined || actionType === null) {
    throw new Error("ActionType is required and cannot be undefined");
  }

  console.log(
    "useDynamicTwitterProof called with actionType:",
    actionType,
    "targetValue:",
    targetValue
  );

  const webProofConfig = createWebProofConfig(actionType, targetValue);

  const {
    requestWebProof,
    webProof,
    isPending: isWebProofPending,
    error: webProofError,
  } = useWebProof(webProofConfig);

  if (webProofError) {
    throw new WebProofError(webProofError.message);
  }

  // Use base_sepolia instead of the environment variable
  const { chain, error: chainError } = useChain("baseSepolia");

  useEffect(() => {
    if (chainError) {
      setError(new UseChainError(chainError));
    }
  }, [chainError]);

  const vlayerProverConfig: Omit<
    ProveArgs<Abi, ContractFunctionName<Abi>>,
    "args"
  > = {
    address: import.meta.env.VITE_PROVER_ADDRESS as `0x${string}`,
    proverAbi: dynamicTwitterProver.abi as Abi,
    chainId: chain?.id,
    functionName: "verifyAction" as const,
    gasLimit: Number(import.meta.env.VITE_GAS_LIMIT),
  };

  const {
    callProver,
    isPending: isCallProverPending,
    isIdle: isCallProverIdle,
    data: hash,
    error: callProverError,
  } = useCallProver(vlayerProverConfig);

  if (callProverError) {
    throw callProverError;
  }

  const {
    isPending: isWaitingForProvingResult,
    data: result,
    error: waitForProvingResultError,
  } = useWaitForProvingResult(hash);

  if (waitForProvingResultError) {
    throw waitForProvingResultError;
  }

  const [, setWebProof] = useLocalStorage("webProof", "");
  const [, setProverResult] = useLocalStorage("proverResult", "");

  useEffect(() => {
    if (webProof) {
      console.log("webProof", webProof);
      setWebProof(
        JSON.stringify(webProof, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    }
  }, [webProof, setWebProof]);

  useEffect(() => {
    if (result) {
      console.log("proverResult", result);
      setProverResult(
        JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    }
  }, [result, setProverResult]);

  return {
    requestWebProof,
    webProof,
    isPending:
      isWebProofPending || isCallProverPending || isWaitingForProvingResult,
    isCallProverIdle,
    isWaitingForProvingResult,
    isWebProofPending,
    callProver,
    result,
    error,
    actionType,
    targetValue,
  };
};

// Hook for multiple actions verification
export const useMultipleDynamicTwitterProof = (
  actions: Array<{ actionType: ActionType; targetValue?: string }>
) => {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [completedProofs, setCompletedProofs] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);

  console.log("useMultipleDynamicTwitterProof called with actions:", actions);

  // Validate actions array
  if (!actions || actions.length === 0) {
    throw new Error("Actions array cannot be empty");
  }

  // Ensure currentActionIndex is within bounds
  const safeCurrentActionIndex = Math.min(
    currentActionIndex,
    actions.length - 1
  );
  const currentAction = actions[safeCurrentActionIndex];

  console.log(
    "Current action index:",
    safeCurrentActionIndex,
    "Current action:",
    currentAction
  );

  // Validate currentAction exists and has required properties
  if (
    !currentAction ||
    currentAction.actionType === undefined ||
    currentAction.actionType === null
  ) {
    throw new Error(
      `Invalid action at index ${safeCurrentActionIndex}: actionType is required`
    );
  }

  const singleProof = useDynamicTwitterProof(
    currentAction.actionType,
    currentAction.targetValue
  );

  useEffect(() => {
    if (singleProof.result && safeCurrentActionIndex < actions.length) {
      setCompletedProofs((prev: any) => [...prev, singleProof.webProof]);
      setAllResults((prev: any) => [...prev, singleProof.result]);

      if (safeCurrentActionIndex < actions.length - 1) {
        setCurrentActionIndex((prev: any) => prev + 1);
      }
    }
  }, [singleProof.result, safeCurrentActionIndex, actions.length]);

  const isComplete: boolean =
    safeCurrentActionIndex >= actions.length - 1 && !!singleProof.result;
  const progress: number =
    ((safeCurrentActionIndex + (singleProof.result ? 1 : 0)) / actions.length) *
    100;

  return {
    ...singleProof,
    currentAction: currentAction,
    currentActionIndex: safeCurrentActionIndex,
    totalActions: actions.length,
    completedProofs,
    allResults,
    isComplete,
    progress,
  };
};
