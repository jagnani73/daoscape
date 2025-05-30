import { MembershipStatus, ProposalWithVotes, Vote } from "../types/dao";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getMembershipStatusBadgeProps = (
  membershipStatus: MembershipStatus
) => {
  switch (membershipStatus) {
    case "member":
      return {
        className: "bg-green-100 text-green-800 border-green-200",
        text: "✓ Member",
      };
    case "pending":
      return {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "⏳ Pending",
      };
    case "admin":
      return {
        className: "bg-purple-100 text-purple-800 border-purple-200",
        text: "👑 Admin",
      };
    default:
      return null;
  }
};

export const getHouseBadgeProps = (house: string) => {
  const houseColors = {
    "1": "bg-red-100 text-red-800 border-red-200",
    "2": "bg-blue-100 text-blue-800 border-blue-200",
    "3": "bg-green-100 text-green-800 border-green-200",
  };
  return {
    className:
      houseColors[house as keyof typeof houseColors] ||
      "bg-gray-100 text-gray-800 border-gray-200",
    text: `House ${house}`,
  };
};

export const getProposalStatusBadgeProps = (conclusion: string) => {
  switch (conclusion.toLowerCase()) {
    case "yes":
      return {
        className: "bg-green-100 text-green-800 border-green-200",
        text: "Approved",
      };
    case "no":
      return {
        className: "bg-red-100 text-red-800 border-red-200",
        text: "Rejected",
      };
    default:
      return {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Pending",
      };
  }
};

export const canShowJoinButton = (
  isConnected: boolean,
  membershipStatus: MembershipStatus
): boolean => {
  return isConnected && membershipStatus === "not_member";
};

export const isDAOOwner = (
  userAddress: string | undefined,
  ownerAddress: string
): boolean => {
  return userAddress?.toLowerCase() === ownerAddress.toLowerCase();
};

export const isDAOMember = (membershipStatus: MembershipStatus): boolean => {
  return membershipStatus === "member" || membershipStatus === "admin";
};

// Proposal voting utilities
export const isVotingActive = (proposal: ProposalWithVotes): boolean => {
  const now = new Date();
  const votingStart = new Date(proposal.voting_start);
  const votingEnd = new Date(proposal.voting_end);
  return now >= votingStart && now <= votingEnd;
};

export const isFeedbackActive = (proposal: ProposalWithVotes): boolean => {
  const now = new Date();
  const votingEnd = new Date(proposal.voting_end);
  const feedbackEnd = new Date(proposal.feedback_end);
  return now > votingEnd && now <= feedbackEnd;
};

export const hasUserVoted = (
  proposal: ProposalWithVotes,
  userAddress: string,
  isFeedback: boolean
): boolean => {
  return proposal.votes.some(
    (vote) =>
      vote.member_id.toLowerCase() === userAddress.toLowerCase() &&
      vote.is_feedback === isFeedback
  );
};

export const canUserVote = (
  proposal: ProposalWithVotes,
  userAddress: string | undefined,
  userHouse: string | undefined,
  isOwner: boolean,
  isFeedback: boolean
): { canVote: boolean; reason?: string } => {
  if (!userAddress) {
    return { canVote: false, reason: "Please connect your wallet" };
  }

  if (isOwner) {
    return { canVote: false, reason: "Owners cannot vote on proposals" };
  }

  if (!userHouse) {
    return { canVote: false, reason: "You must be a DAO member to vote" };
  }

  if (!isFeedback && userHouse !== proposal.voting_house) {
    return {
      canVote: false,
      reason: `Only House ${proposal.voting_house} members can vote on this proposal. You are in House ${userHouse}.`,
    };
  }

  if (hasUserVoted(proposal, userAddress, isFeedback)) {
    return { canVote: false, reason: "You have already voted" };
  }

  if (!isFeedback && !isVotingActive(proposal)) {
    return { canVote: false, reason: "Voting period has ended" };
  }

  if (isFeedback && !isFeedbackActive(proposal)) {
    return { canVote: false, reason: "Feedback period has ended" };
  }

  return { canVote: true };
};

export const getVoteCounts = (
  proposal: ProposalWithVotes,
  isFeedback: boolean
) => {
  const relevantVotes = proposal.votes.filter(
    (vote) => vote.is_feedback === isFeedback
  );

  const yesVotes = relevantVotes.filter((vote) => vote.vote === "YES");
  const noVotes = relevantVotes.filter((vote) => vote.vote === "NO");
  const abstainVotes = relevantVotes.filter((vote) => vote.vote === "ABSTAIN");

  const totalWeight = relevantVotes.reduce((sum, vote) => sum + vote.weight, 0);
  const yesWeight = yesVotes.reduce((sum, vote) => sum + vote.weight, 0);
  const noWeight = noVotes.reduce((sum, vote) => sum + vote.weight, 0);
  const abstainWeight = abstainVotes.reduce(
    (sum, vote) => sum + vote.weight,
    0
  );

  return {
    yes: { count: yesVotes.length, weight: yesWeight },
    no: { count: noVotes.length, weight: noWeight },
    abstain: { count: abstainVotes.length, weight: abstainWeight },
    total: { count: relevantVotes.length, weight: totalWeight },
  };
};

export const getProposalPhase = (
  proposal: ProposalWithVotes
): "upcoming" | "voting" | "feedback" | "ended" => {
  const now = new Date();
  const votingStart = new Date(proposal.voting_start);
  const votingEnd = new Date(proposal.voting_end);
  const feedbackEnd = new Date(proposal.feedback_end);

  if (now < votingStart) return "upcoming";
  if (now <= votingEnd) return "voting";
  if (now <= feedbackEnd) return "feedback";
  return "ended";
};
