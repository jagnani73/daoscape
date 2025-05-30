import { OneinchService, SupabaseService } from "../../services";
import {
    STARTER_REPUTATION,
    SUPABASE_0_ROWS_ERROR_CODE,
} from "../../utils/constants";
import {
    createError,
    HttpStatusCode,
    randomVotingHouse,
} from "../../utils/functions";
import { getDao } from "../dao/dao.service";
import { getMember } from "../member/member.service";
import type { JoinDaoBody } from "./membership.schema";

const getMembership = async (member_id: string, dao_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("memberships")
        .select()
        .eq("member_id", member_id)
        .eq("dao_id", dao_id)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getMemberships = async (member_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("memberships")
        .select()
        .eq("member_id", member_id);

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};

export const checkTokenBalances = async (
    wallet_address: string,
    dao_tokens: {
        token_address: string;
        chain_id: number;
    }[]
) => {
    const balanceChecks = await Promise.all(
        dao_tokens.map(async (token) => {
            try {
                const { data } = await OneinchService.getInstance().get(
                    `/balance/v1.2/${token.chain_id}/balances/${wallet_address}`
                );

                const tokenBalance = data[token.token_address.toLowerCase()];
                return tokenBalance && parseFloat(tokenBalance) > 0;
            } catch (error) {
                console.error(
                    `Failed to check balance for token ${token.token_address} on chain ${token.chain_id}:`,
                    error
                );
                return false;
            }
        })
    );

    return balanceChecks.some((hasBalance) => hasBalance);
};

export const joinDao = async ({ dao_id, wallet_address }: JoinDaoBody) => {
    const dao = await getDao(dao_id);
    if (!dao) {
        throw createError("DAO not found", HttpStatusCode.NOT_FOUND);
    }

    const member = await getMember(wallet_address);
    if (!member) {
        throw createError("Member not found", HttpStatusCode.NOT_FOUND);
    }

    const existingMemberships = await getMemberships(member.member_id);

    if (
        existingMemberships?.some((membership) => membership.dao_id === dao_id)
    ) {
        throw createError(
            "Already a member of the DAO",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const hasRequiredTokens = await checkTokenBalances(
        wallet_address,
        dao.tokens as {
            token_address: string;
            chain_id: number;
        }[]
    );

    if (!hasRequiredTokens) {
        throw createError(
            "Insufficient token balance for DAO membership",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("memberships")
        .insert({
            dao_id,
            member_id: member.member_id,
            house: randomVotingHouse(),
            reputation: STARTER_REPUTATION,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const changeReputation = async (
    changes: {
        member_id: string;
        dao_id: string;
        change: number;
    }[]
) => {
    await Promise.all(
        changes.map(async ({ member_id, dao_id, change }) => {
            const membership = await getMembership(member_id, dao_id);
            if (!membership) {
                throw createError(
                    "Membership not found",
                    HttpStatusCode.NOT_FOUND
                );
            }

            const newReputation = membership.reputation + change;

            const { error } = await SupabaseService.getSupabase("admin")
                .from("memberships")
                .update({
                    reputation: newReputation,
                })
                .eq("member_id", member_id)
                .eq("dao_id", dao_id)
                .select()
                .single();

            if (error) {
                throw error;
            }
        })
    );
};
