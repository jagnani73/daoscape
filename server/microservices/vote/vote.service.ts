import { SupabaseService } from "../../services";
import { SUPABASE_0_ROWS_ERROR_CODE, type HOUSES } from "../../utils/constants";
import { createError, HttpStatusCode } from "../../utils/functions";
import { getMember } from "../member/member.service";
import { getMemberships } from "../membership/membership.service";
import { getProposal } from "../proposal/proposal.service";
import type { CastVoteBody } from "./vote.schema";

export const getVote = async (
    proposal_id: string,
    member_id: string,
    is_feedback: boolean
) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("votes")
        .select()
        .eq("proposal_id", proposal_id)
        .eq("member_id", member_id)
        .eq("is_feedback", is_feedback)
        .single();

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};

export const castVote = async ({
    proposal_id,
    wallet_address,
    vote,
    is_feedback,
}: CastVoteBody) => {
    const proposal = await getProposal(proposal_id);
    if (!proposal) {
        throw createError("Proposal not found", HttpStatusCode.NOT_FOUND);
    }

    const existingVote = await getVote(
        proposal_id,
        wallet_address,
        is_feedback
    );
    if (existingVote) {
        throw createError("User has already voted", HttpStatusCode.BAD_REQUEST);
    }

    const memberships = await getMemberships(wallet_address);

    if (
        !memberships?.some(
            (membership) => membership.dao_id === proposal.dao_id
        )
    ) {
        throw createError(
            "User is not a member of this DAO",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const now = new Date();
    const votingStart = new Date(proposal.voting_start);
    const votingEnd = new Date(proposal.voting_end);
    const feedbackEnd = new Date(proposal.feedback_end);

    if (!is_feedback) {
        if (now < votingStart) {
            throw createError(
                "Voting has not started yet",
                HttpStatusCode.BAD_REQUEST
            );
        }
        if (now > votingEnd) {
            throw createError("Voting has ended", HttpStatusCode.BAD_REQUEST);
        }
    } else {
        if (now > feedbackEnd) {
            throw createError(
                "Feedback voting has ended",
                HttpStatusCode.BAD_REQUEST
            );
        }
    }

    const member = await getMember(wallet_address);
    if (!member) {
        throw createError("Member not found", HttpStatusCode.NOT_FOUND);
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("votes")
        .insert({
            is_feedback,
            proposal_id,
            member_id: member.member_id,
            vote,
            dao_id: proposal.dao_id,
            weight: is_feedback ? 1 : 100,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getVotesForProposal = async (
    proposal_id: string,
    is_feedback: boolean,
    house?: HOUSES | null
) => {
    let query = SupabaseService.getSupabase("admin")
        .from("votes")
        .select()
        .eq("proposal_id", proposal_id)
        .eq("is_feedback", is_feedback);

    if (!is_feedback && house) {
        query = query.eq("house", house);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data;
};
