import { SupabaseService } from "../../services";
import {
    FEEDBACK_PROPOSAL_WEIGHT,
    SUPABASE_0_ROWS_ERROR_CODE,
    type HOUSES,
} from "../../utils/constants";
import { createError, HttpStatusCode } from "../../utils/functions";
import { getDao } from "../dao/dao.service";
import { getMember } from "../member/member.service";
import {
    getMemberships,
    getTokensBalances,
} from "../membership/membership.service";
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
    const dao = await getDao(proposal_id);
    if (!dao) {
        throw createError("DAO not found", HttpStatusCode.NOT_FOUND);
    }

    const proposal = await getProposal(proposal_id);
    if (!proposal) {
        throw createError("Proposal not found", HttpStatusCode.NOT_FOUND);
    }

    const memberships = await getMemberships(wallet_address);
    let membership =
        memberships?.find(
            (membership) => membership.dao_id === proposal.dao_id
        ) ?? null;

    if (!membership) {
        throw createError(
            "User is not a member of this DAO",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const existingVote = await getVote(
        proposal_id,
        wallet_address,
        is_feedback
    );
    if (existingVote) {
        throw createError("User has already voted", HttpStatusCode.BAD_REQUEST);
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

    const tokenBalances = await getTokensBalances(
        wallet_address,
        dao.tokens as {
            token_address: string;
            chain_id: number;
        }[]
    );

    const totalBalance = tokenBalances.reduce(
        (acc, tokenBalance) => acc + tokenBalance.balance,
        0
    );

    const TOKEN_SUPPLY_PER_TOKEN = 1_000_000_000;
    const totalSupply =
        (dao.tokens as { token_address: string; chain_id: number }[]).length *
        TOKEN_SUPPLY_PER_TOKEN;
    const percentageHolding = (totalBalance / totalSupply) * 100;

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("votes")
        .insert({
            is_feedback,
            proposal_id,
            member_id: member.member_id,
            vote,
            house: membership.house,
            weight: is_feedback
                ? FEEDBACK_PROPOSAL_WEIGHT
                : Math.floor(
                      percentageHolding * 0.5 + membership.reputation * 0.5
                  ),
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
