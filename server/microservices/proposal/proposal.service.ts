import { BlockscoutService, SupabaseService } from "../../services";
import {
    CORRECT_VOTE_REPUTATION_CHANGE,
    INCORRECT_VOTE_REPUTATION_CHANGE,
    MERITS_PER_PROPOSAL,
    SUPABASE_0_ROWS_ERROR_CODE,
    VOTE_TYPES,
    type HOUSES,
} from "../../utils/constants";
import {
    createError,
    HttpStatusCode,
    randomVotingHouse,
} from "../../utils/functions";
import { changeReputation } from "../membership/membership.service";
import { getVotesForProposal } from "../vote/vote.service";
import type { CreateProposalBody, MeritDistribution } from "./proposal.schema";

export const createProposal = async ({
    title,
    description,
    dao_id,
    voting_end,
    voting_start,
    feedback_end,
}: CreateProposalBody) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("proposals")
        .insert({
            title,
            description,
            dao_id,
            voting_start,
            voting_end,
            feedback_end,
            voting_house: randomVotingHouse(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getProposal = async (proposal_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("proposals")
        .select()
        .eq("proposal_id", proposal_id)
        .single();

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};

export const getProposalWithVotes = async (proposal_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("proposals")
        .select(
            `
            *,
            votes(*)
        `
        )
        .eq("proposal_id", proposal_id)
        .single();

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};

export const concludeProposal = async (
    proposal_id: string,
    is_feedback: boolean
) => {
    const proposal = await getProposal(proposal_id);
    if (!proposal) {
        throw createError("Proposal not found", HttpStatusCode.NOT_FOUND);
    }

    const now = new Date();

    if (!is_feedback) {
        if (proposal.conclusion) {
            throw createError(
                "Proposal has already been concluded",
                HttpStatusCode.BAD_REQUEST
            );
        }

        const votingEnd = new Date(proposal.voting_end);
        if (now < votingEnd) {
            throw createError(
                "Voting has not ended yet",
                HttpStatusCode.BAD_REQUEST
            );
        }
    } else {
        if (proposal.feedback_conclusion) {
            throw createError(
                "Proposal's feedback has already been concluded",
                HttpStatusCode.BAD_REQUEST
            );
        }

        const feedbackEnd = new Date(proposal.feedback_end);
        if (now < feedbackEnd) {
            throw createError(
                "Feedback has not ended yet",
                HttpStatusCode.BAD_REQUEST
            );
        }
    }

    const votes = await getVotesForProposal(
        proposal_id,
        is_feedback,
        proposal.voting_house as HOUSES
    );

    let weightedYes: number = 0;
    let weightedNo: number = 0;

    for (const { vote, weight } of votes) {
        if (vote === VOTE_TYPES.YES) {
            weightedYes += weight;
        } else if (vote === VOTE_TYPES.NO) {
            weightedNo += weight;
        }
    }

    const result: VOTE_TYPES =
        weightedYes > weightedNo ? VOTE_TYPES.YES : VOTE_TYPES.NO;

    if (!is_feedback) {
        const { data, error } = await SupabaseService.getSupabase("admin")
            .from("proposals")
            .update({
                conclusion: result,
            })
            .eq("proposal_id", proposal_id)
            .select()
            .single();
        if (error) {
            throw error;
        }

        return data;
    } else {
        const { data, error } = await SupabaseService.getSupabase("admin")
            .from("proposals")
            .update({
                feedback_conclusion: result,
            })
            .eq("proposal_id", proposal_id)
            .select()
            .single();
        if (error) {
            throw error;
        }

        const yesVotes = votes.filter((vote) => vote.vote === VOTE_TYPES.YES);
        const noVotes = votes.filter((vote) => vote.vote === VOTE_TYPES.NO);

        let merits: MeritDistribution[] | null = null;

        if (data.feedback_conclusion === VOTE_TYPES.YES) {
            const yesDistributions: MeritDistribution[] = yesVotes.map(
                (vote) => ({
                    address: vote.member_id,
                    amount: MERITS_PER_PROPOSAL.toString(),
                })
            );
            merits = await distributeMerits(
                `${proposal.dao_id}::${proposal_id}::${Date.now()}`,
                "Feedback distribution",
                yesDistributions
            );

            await changeReputation([
                ...yesVotes.map(({ member_id }) => ({
                    member_id,
                    dao_id: proposal.dao_id,
                    change: CORRECT_VOTE_REPUTATION_CHANGE,
                })),
                ...noVotes.map(({ member_id }) => ({
                    member_id,
                    dao_id: proposal.dao_id,
                    change: INCORRECT_VOTE_REPUTATION_CHANGE,
                })),
            ]);
        } else if (data.feedback_conclusion === VOTE_TYPES.NO) {
            const noDistributions: MeritDistribution[] = noVotes.map(
                (vote) => ({
                    address: vote.member_id,
                    amount: MERITS_PER_PROPOSAL.toString(),
                })
            );
            merits = await distributeMerits(
                `${proposal.dao_id}::${proposal_id}::${Date.now()}`,
                "Feedback distribution",
                noDistributions
            );

            await changeReputation([
                ...yesVotes.map(({ member_id }) => ({
                    member_id,
                    dao_id: proposal.dao_id,
                    change: INCORRECT_VOTE_REPUTATION_CHANGE,
                })),
                ...noVotes.map(({ member_id }) => ({
                    member_id,
                    dao_id: proposal.dao_id,
                    change: CORRECT_VOTE_REPUTATION_CHANGE,
                })),
            ]);
        }

        return {
            merits,
            proposal: data,
        };
    }
};

export const distributeMerits = async (
    id: string,
    description: string,
    distributions: MeritDistribution[]
) => {
    const axiosInstance = BlockscoutService.getInstance();
    const { data } = await axiosInstance.post("/partner/api/v1/distribute", {
        id,
        description,
        distributions,
        create_missing_accounts: true,
        expected_total: distributions
            .reduce(
                (acc, distribution) => acc + parseInt(distribution.amount),
                0
            )
            .toString(),
    });

    return data;
};
