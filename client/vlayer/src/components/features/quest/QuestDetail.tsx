import React, { useState, useEffect } from "react";
import { QuestWithStatus, QuestParticipant } from "../../../types/quest";
import { DAO } from "../../../types/dao";
import { questService } from "../../../services/questService";
import {
  useDynamicTwitterProof,
  ActionType,
} from "../../../hooks/useDynamicTwitterProof";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import dynamicTwitterVerifier from "../../../../../out/DynamicTwitterVerifier.sol/DynamicTwitterVerifier.json";
import { ensureBalance } from "../../../utils/ethFaucet";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { useTransactionWithAPI } from "../../../hooks/useTransactionWithAPI";
import { executeAPIAfterTransaction } from "../../../utils/transactionWithAPI";

interface QuestDetailProps {
  quest: QuestWithStatus;
  dao: DAO | null;
  userAddress?: string;
  onQuestUpdated: () => void;
}

export const QuestDetail: React.FC<QuestDetailProps> = ({
  quest,
  dao,
  userAddress,
  onQuestUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userParticipation, setUserParticipation] =
    useState<QuestParticipant | null>(quest.userParticipation || null);
  const [currentVerifyingAction, setCurrentVerifyingAction] = useState<
    string | null
  >(null);

  // Verification state and hooks
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<Error | null>(
    null
  );
  const [pendingVerificationAction, setPendingVerificationAction] = useState<
    string | null
  >(null);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const {
    writeContract,
    data: txHash,
    error: contractError,
  } = useWriteContract();
  const { openTxToast } = useNotification();
  const { status: txStatus } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Extract target values from quest URLs
  const getTwitterUsername = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(/twitter\.com\/([^\/\?]+)/);
    const xmatch = url.match(/x\.com\/([^\/\?]+)/);
    return match ? match[1] : xmatch ? xmatch[1] : undefined;
  };

  const getTweetId = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : undefined;
  };

  const twitterUsername = getTwitterUsername(quest.twitter_account_url);
  const tweetId = getTweetId(quest.twitter_post_url);

  // vlayer proof hooks for different actions
  const followProof = useDynamicTwitterProof(
    ActionType.FOLLOW_USER,
    twitterUsername
  );
  const likeProof = useDynamicTwitterProof(ActionType.LIKE_POST, tweetId);
  const retweetProof = useDynamicTwitterProof(ActionType.RETWEET_POST, tweetId);

  const isQuestActive = quest.status === "active";
  const isQuestCompleted =
    userParticipation &&
    questService.isQuestCompleted(userParticipation, quest);
  const canJoin = userAddress && !userParticipation && isQuestActive;
  const canVerify =
    userAddress && userParticipation && !isQuestCompleted && isQuestActive;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
      },
      upcoming: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Upcoming",
      },
      expired: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Expired",
      },
      completed: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Completed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleJoinQuest = async () => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await questService.joinQuest({
        member_id: userAddress,
        quest_id: quest.quest_id,
      });

      const participation = await questService.getParticipantStatus(
        quest.quest_id,
        userAddress
      );
      setUserParticipation(participation);
      setSuccess("Successfully joined the quest!");
      onQuestUpdated();
    } catch (err) {
      console.error("Error joining quest:", err);
      setError(err instanceof Error ? err.message : "Failed to join quest");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (
    actionType: "follow" | "like" | "retweet"
  ) => {
    if (!userAddress || !userParticipation) return;

    setCurrentVerifyingAction(actionType);
    setError(null);
    setSuccess(null);

    switch (actionType) {
      case "follow":
        if (!twitterUsername) {
          setError("Twitter username not found in quest URL");
          setCurrentVerifyingAction(null);
          return;
        }
        // Only request web proof, the hook will handle the rest automatically
        followProof.requestWebProof();
        break;
      case "like":
        if (!tweetId) {
          setError("Tweet ID not found in quest URL");
          setCurrentVerifyingAction(null);
          return;
        }
        likeProof.requestWebProof();
        break;
      case "retweet":
        if (!tweetId) {
          setError("Tweet ID not found in quest URL");
          setCurrentVerifyingAction(null);
          return;
        }
        retweetProof.requestWebProof();
        break;
      default:
        setError("Invalid action type");
        setCurrentVerifyingAction(null);
        return;
    }
  };

  useEffect(() => {
    const handleProverCall = async (proof: any, actionType: string) => {
      if (proof.webProof && proof.isCallProverIdle && userAddress) {
        await proof.callProver([
          proof.webProof,
          proof.actionType,
          "",
          proof.targetValue || "",
          userAddress,
        ]);
      }
    };

    if (currentVerifyingAction === "follow") {
      handleProverCall(followProof, "follow");
    } else if (currentVerifyingAction === "like") {
      handleProverCall(likeProof, "like");
    } else if (currentVerifyingAction === "retweet") {
      handleProverCall(retweetProof, "retweet");
    }
  }, [
    followProof.webProof,
    followProof.isCallProverIdle,
    likeProof.webProof,
    likeProof.isCallProverIdle,
    retweetProof.webProof,
    retweetProof.isCallProverIdle,
    currentVerifyingAction,
    userAddress,
  ]);

  // Effect to handle completion when result is available
  useEffect(() => {
    const handleCompletion = async (proof: any, actionType: string) => {
      if (proof.result && currentVerifyingAction === actionType) {
        // Set pending verification instead of auto-completing
        setPendingVerificationAction(actionType);
        setCurrentVerifyingAction(null);
      }
    };

    if (followProof.result) {
      handleCompletion(followProof, "follow");
    } else if (likeProof.result) {
      handleCompletion(likeProof, "like");
    } else if (retweetProof.result) {
      handleCompletion(retweetProof, "retweet");
    }
  }, [
    followProof.result,
    likeProof.result,
    retweetProof.result,
    currentVerifyingAction,
    quest.quest_id,
    userAddress,
    onQuestUpdated,
  ]);

  // Verification function
  const handleVerifyOnChain = async (
    actionType: "follow" | "like" | "retweet"
  ) => {
    if (!userAddress || !userParticipation) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      let proofResult;
      switch (actionType) {
        case "follow":
          proofResult = followProof.result;
          break;
        case "like":
          proofResult = likeProof.result;
          break;
        case "retweet":
          proofResult = retweetProof.result;
          break;
        default:
          throw new Error("Invalid action type");
      }

      if (!proofResult) {
        throw new Error("No proof data available");
      }

      const proofData = proofResult as any[];
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

      await ensureBalance(userAddress as `0x${string}`, balance?.value ?? 0n);
      writeContract(writeContractArgs);
    } catch (error) {
      setVerificationError(error as Error);
      setIsVerifying(false);
    }
  };

  // Handle successful verification
  useEffect(() => {
    if (txStatus === "success" && pendingVerificationAction) {
      const actionType = pendingVerificationAction;

      // Update the completion status in the backend AFTER transaction settlement
      const updateCompletion = async () => {
        try {
          if (!txHash) {
            throw new Error("No transaction hash available");
          }

          console.log(`🎯 Quest verification transaction confirmed: ${txHash}`);

          // Wait for transaction settlement, then update API
          await executeAPIAfterTransaction(
            txHash,
            async () => {
              const updateData = {
                [`twitter_${actionType}_completed`]: true,
              };

              await questService.updateParticipantCompletion(
                quest.quest_id,
                userAddress!,
                updateData
              );

              // Refresh participation status
              const updatedParticipation =
                await questService.getParticipantStatus(
                  quest.quest_id,
                  userAddress!
                );
              setUserParticipation(updatedParticipation);

              return updatedParticipation;
            },
            {
              onTransactionConfirmed: (receipt) => {
                console.log(
                  `✅ Quest verification confirmed in block ${receipt.blockNumber}`
                );
              },
              onAPIComplete: (result) => {
                console.log(`✅ Quest completion updated in API`);
                setSuccess(
                  `${
                    actionType.charAt(0).toUpperCase() + actionType.slice(1)
                  } action verified successfully on-chain and recorded!`
                );
                onQuestUpdated();
              },
            }
          );
        } catch (err) {
          console.error(`Error updating completion for ${actionType}:`, err);
          setError(
            err instanceof Error
              ? err.message
              : `Failed to update ${actionType} completion`
          );
        } finally {
          setIsVerifying(false);
          setPendingVerificationAction(null);
        }
      };

      updateCompletion();
    }
  }, [
    txStatus,
    txHash,
    pendingVerificationAction,
    quest.quest_id,
    userAddress,
    onQuestUpdated,
  ]);

  // Handle transaction hash
  useEffect(() => {
    if (txHash) {
      openTxToast("84532", txHash);
    }
  }, [txHash, openTxToast]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      setIsVerifying(false);
      setVerificationError(new Error(contractError.message));
    }
  }, [contractError]);

  // Throw verification errors
  useEffect(() => {
    if (verificationError) {
      setIsVerifying(false);
      throw verificationError;
    }
  }, [verificationError]);

  // Effect to handle errors from proof hooks (matching workflow pattern)
  useEffect(() => {
    if (followProof.error) {
      throw followProof.error;
    }
  }, [followProof.error]);

  useEffect(() => {
    if (likeProof.error) {
      throw likeProof.error;
    }
  }, [likeProof.error]);

  useEffect(() => {
    if (retweetProof.error) {
      throw retweetProof.error;
    }
  }, [retweetProof.error]);

  const getTaskStatus = (actionType: "follow" | "like" | "retweet") => {
    if (!userParticipation) return "not_started";

    const completedField =
      `twitter_${actionType}_completed` as keyof QuestParticipant;

    if (userParticipation[completedField]) return "completed";
    if (pendingVerificationAction === actionType) return "pending_verification";
    if (isVerifying && pendingVerificationAction === actionType)
      return "verifying";

    // Check if proof is ready for verification
    const hasProofResult =
      (actionType === "follow" && followProof.result) ||
      (actionType === "like" && likeProof.result) ||
      (actionType === "retweet" && retweetProof.result);

    if (hasProofResult) return "ready_to_verify";

    return "pending";
  };

  const getProofStatus = (actionType: "follow" | "like" | "retweet") => {
    if (currentVerifyingAction === actionType) {
      switch (actionType) {
        case "follow":
          if (followProof.isWebProofPending) return "Generating web proof...";
          if (followProof.isPending) return "Generating vlayer proof...";
          break;
        case "like":
          if (likeProof.isWebProofPending) return "Generating web proof...";
          if (likeProof.isPending) return "Generating vlayer proof...";
          break;
        case "retweet":
          if (retweetProof.isWebProofPending) return "Generating web proof...";
          if (retweetProof.isPending) return "Generating vlayer proof...";
          break;
      }
    }
    return null;
  };

  const renderTaskCard = (
    actionType: "follow" | "like" | "retweet",
    enabled: boolean,
    title: string,
    description: string,
    url?: string
  ) => {
    if (!enabled) return null;

    const status = getTaskStatus(actionType);
    const isCompleted = status === "completed";
    const isReadyToVerify = status === "ready_to_verify";
    const isPendingVerification = status === "pending_verification";
    const isCurrentlyVerifying = currentVerifyingAction === actionType;
    const isOnChainVerifying =
      isVerifying && pendingVerificationAction === actionType;
    const proofStatus = getProofStatus(actionType);

    const getStatusBadge = () => {
      if (isCompleted) {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        );
      }
      if (isPendingVerification) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Ready to Verify
          </Badge>
        );
      }
      if (isOnChainVerifying) {
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Verifying...
          </Badge>
        );
      }
      return null;
    };

    return (
      <Card key={actionType} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{title}</span>
              {isCompleted && <span className="text-green-600">✅</span>}
            </CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {url && (
              <div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  🔗 Open {actionType === "follow" ? "Profile" : "Tweet"}
                </a>
              </div>
            )}

            {/* Generate Proof Button */}
            {canVerify &&
              !isCompleted &&
              !isReadyToVerify &&
              !isPendingVerification && (
                <div className="space-y-2">
                  <Button
                    onClick={() => handleVerifyAction(actionType)}
                    disabled={isCurrentlyVerifying || loading}
                    size="sm"
                    className="w-full"
                  >
                    {isCurrentlyVerifying
                      ? proofStatus || "Generating Proof..."
                      : `Generate Proof for ${title}`}
                  </Button>

                  {isCurrentlyVerifying && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                        <span>
                          Follow the vlayer proof generation steps in the popup
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Verify On-Chain Button */}
            {isReadyToVerify && (
              <div className="space-y-2">
                <Button
                  onClick={() => handleVerifyOnChain(actionType)}
                  disabled={isOnChainVerifying}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isOnChainVerifying
                    ? "Verifying On-Chain..."
                    : `Verify ${title} On-Chain`}
                </Button>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      Proof generated successfully! Click to verify on-chain.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Verification State */}
            {isPendingVerification && !isOnChainVerifying && (
              <div className="space-y-2">
                <Button
                  onClick={() => handleVerifyOnChain(actionType)}
                  disabled={false}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Verify {title} On-Chain
                </Button>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Proof ready for on-chain verification</span>
                  </div>
                </div>
              </div>
            )}

            {/* On-Chain Verification in Progress */}
            {isOnChainVerifying && (
              <div className="space-y-2">
                <Button disabled={true} size="sm" className="w-full">
                  Verifying On-Chain...
                </Button>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                    <span>Submitting verification to blockchain...</span>
                  </div>
                </div>
              </div>
            )}

            {!userParticipation && (
              <p className="text-sm text-muted-foreground">
                Join the quest to start this task
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quest Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-2xl">{quest.title}</CardTitle>
                {getStatusBadge(quest.status)}
                {isQuestCompleted && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    🏆 Completed
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {quest.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-sm text-muted-foreground">Reward</span>
              <div className="font-semibold">{quest.reward_merits} merits</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Participants
              </span>
              <div className="font-semibold">{quest.participantCount || 0}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Start Time</span>
              <div className="font-semibold text-sm">
                {formatDate(quest.start_time)}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">End Time</span>
              <div className="font-semibold text-sm">
                {formatDate(quest.end_time)}
              </div>
            </div>
          </div>

          {/* Token Rewards */}
          {quest.reward_token_address && quest.reward_token_amount && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">
                🪙 Token Reward
              </h4>
              <p className="text-yellow-700 text-sm">
                {quest.reward_token_amount} tokens on chain{" "}
                {quest.reward_token_chain}
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                Address: {quest.reward_token_address}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {canJoin && (
              <Button onClick={handleJoinQuest} disabled={loading}>
                {loading ? "Joining..." : "Join Quest"}
              </Button>
            )}

            {!userAddress && (
              <div className="text-sm text-muted-foreground">
                Connect your wallet to participate
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      {userParticipation && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quest Tasks</h3>

          <div className="grid gap-4">
            {renderTaskCard(
              "follow",
              quest.twitter_follow_enabled,
              "Follow Account",
              "Follow the specified Twitter account",
              quest.twitter_account_url
            )}

            {renderTaskCard(
              "like",
              quest.twitter_like_enabled,
              "Like Tweet",
              "Like the specified tweet",
              quest.twitter_post_url
            )}

            {renderTaskCard(
              "retweet",
              quest.twitter_retweet_enabled,
              "Retweet",
              "Retweet the specified tweet",
              quest.twitter_post_url
            )}
          </div>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasks Completed:</span>
                  <span>
                    {
                      [
                        quest.twitter_follow_enabled &&
                          userParticipation.twitter_follow_completed,
                        quest.twitter_like_enabled &&
                          userParticipation.twitter_like_completed,
                        quest.twitter_retweet_enabled &&
                          userParticipation.twitter_retweet_completed,
                      ].filter(Boolean).length
                    }{" "}
                    /{" "}
                    {
                      [
                        quest.twitter_follow_enabled,
                        quest.twitter_like_enabled,
                        quest.twitter_retweet_enabled,
                      ].filter(Boolean).length
                    }
                  </span>
                </div>

                {isQuestCompleted && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      🎉 Congratulations! You've completed all quest tasks and
                      earned {quest.reward_merits} merit points!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* vlayer Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔐 Proof Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            This quest uses vlayer's Web Proof technology to cryptographically
            verify your Twitter actions without requiring API access or
            revealing sensitive information.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Zero-knowledge proofs protect your privacy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Cryptographic verification ensures authenticity</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>No need to share passwords or API keys</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
