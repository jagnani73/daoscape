import { SupabaseService } from "../../services";
import { SUPABASE_0_ROWS_ERROR_CODE } from "../../utils/constants";
import { createError, HttpStatusCode } from "../../utils/functions";
import type { CreateQuestBody } from "./quest.schema";

export const createQuest = async ({
    dao_id,
    start_time,
    end_time,
    title,
    description,
    reward_merits,
    reward_token_chain,
    reward_token_address,
    reward_token_amount,
    twitter_account_url,
    twitter_post_url,
    twitter_follow_enabled,
    twitter_like_enabled,
    twitter_retweet_enabled,
}: CreateQuestBody) => {
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (startDate >= endDate) {
        throw createError(
            "Start time must be before end time",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quests")
        .insert({
            dao_id,
            start_time,
            end_time,
            title,
            description,
            reward_merits,
            reward_token_chain,
            reward_token_address,
            reward_token_amount,
            twitter_account_url,
            twitter_post_url,
            twitter_follow_enabled,
            twitter_like_enabled,
            twitter_retweet_enabled,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getQuestsByDaoId = async (dao_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quests")
        .select()
        .eq("dao_id", dao_id)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
};

export const getQuest = async (quest_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quests")
        .select()
        .eq("quest_id", quest_id)
        .single();

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};
