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
        .select()
        .eq("dao_id", dao_id)
        .single();

    if (error) {
        throw error;
    }

    return data;
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
