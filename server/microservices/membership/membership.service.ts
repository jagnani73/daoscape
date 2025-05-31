import { OneinchService, SupabaseService } from "../../services";
import {
    EMAIL_VERIFIED_MERITS,
    EMAIL_VERIFIED_REPUTATION_CHANGE,
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
import { distributeMerits } from "../proposal/proposal.service";
import type { EmailVerifiedBody, JoinDaoBody } from "./membership.schema";

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

export const getTokensBalances = async (
    wallet_address: string,
    dao_tokens: {
        token_address: string;
        chain_id: number;
    }[]
) => {
    const balanceChecks = (
        await Promise.all<{
            token_address: string;
            chain_id: number;
            balance: number;
        } | null>(
            dao_tokens.map(async ({ chain_id, token_address }) => {
                try {
                    const { data } = await OneinchService.getInstance().get(
                        `/balance/v1.2/${chain_id}/balances/${wallet_address}`
                    );

                    const tokenBalance = data[token_address.toLowerCase()];
                    return {
                        token_address,
                        chain_id,
                        balance: parseFloat(tokenBalance),
                    };
                } catch (error) {
                    console.error(
                        `Failed to check balance for token ${token_address} on chain ${chain_id}:`,
                        error
                    );
                    return null;
                }
            })
        )
    ).filter(Boolean);

    return balanceChecks as {
        token_address: string;
        chain_id: number;
        balance: number;
    }[];
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

    const tokenBalances = await getTokensBalances(
        wallet_address,
        dao.tokens as {
            token_address: string;
            chain_id: number;
        }[]
    );

    if (tokenBalances.every((tokenBalance) => tokenBalance.balance === 0)) {
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

export const emailVerified = async ({
    wallet_address,
    dao_id,
}: EmailVerifiedBody) => {
    const membership = await getMembership(wallet_address, dao_id);
    if (!membership) {
        throw createError("Membership not found", HttpStatusCode.NOT_FOUND);
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("memberships")
        .update({
            reputation:
                membership.reputation + EMAIL_VERIFIED_REPUTATION_CHANGE,
        })
        .eq("member_id", wallet_address)
        .select()
        .single();

    if (error) {
        throw error;
    }

    const merits = await distributeMerits(
        `${dao_id}::${wallet_address}::${Date.now()}`,
        "Email verified",
        [
            {
                address: wallet_address,
                amount: EMAIL_VERIFIED_MERITS.toString(),
            },
        ]
    );

    return {
        merits,
        membership: data,
    };
};
