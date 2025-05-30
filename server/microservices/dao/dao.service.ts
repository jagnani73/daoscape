import { OneinchService, SupabaseService } from "../../services";
import { createError, HttpStatusCode } from "../../utils/functions";
import { getMember } from "../member/member.service";
import { joinDao } from "../membership/membership.service";
import type { CreateDaoBody, GetTokenDetailsBody } from "./dao.schema";

export const createDao = async ({
    description,
    logo,
    name,
    owner_address,
    socials,
    tokens,
    tags,
}: CreateDaoBody) => {
    const member = await getMember(owner_address);
    if (!member) {
        throw createError("Member not found", HttpStatusCode.NOT_FOUND);
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("daos")
        .insert({
            description,
            logo,
            name,
            owner_address,
            socials: [
                socials.discord || "",
                socials.telegram || "",
                socials.twitter || "",
                socials.website || "",
            ],
            tokens,
            tags,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    await joinDao({ dao_id: data.dao_id, wallet_address: owner_address });

    return data;
};

export const getDao = async (dao_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("daos")
        .select(
            `   
            *,
            total_members:memberships(count),
            total_proposals:proposals(count)
        `
        )
        .eq("dao_id", dao_id)
        .single();

    if (error) {
        throw error;
    }

    const transformedData = {
        ...data,
        total_members: data.total_members?.[0]?.count || 0,
        total_proposals: data.total_proposals?.[0]?.count || 0,
    };

    return transformedData;
};

export const getAllDaos = async () => {
    const { data, error } = await SupabaseService.getSupabase("admin").from(
        "daos"
    ).select(`
            *,
            total_members:memberships(count),
            total_proposals:proposals(count)
        `);

    if (error) {
        throw error;
    }

    const transformedData = data?.map((dao) => ({
        ...dao,
        total_members: dao.total_members?.[0]?.count || 0,
        total_proposals: dao.total_proposals?.[0]?.count || 0,
    }));

    return transformedData;
};

export const getTokenDetails = async ({
    token_address,
    chain_id,
}: GetTokenDetailsBody) => {
    const { data: details } = await OneinchService.getInstance().get(
        `/token/v1.2/${chain_id}/custom/${token_address}`
    );

    const { data: price_usd } = await OneinchService.getInstance().post(
        `/price/v1.1/${chain_id}`,
        {
            tokens: [token_address],
            currency: "USD",
        }
    );

    return {
        ...details,
        price_usd: Object.values(price_usd)[0],
    };
};
