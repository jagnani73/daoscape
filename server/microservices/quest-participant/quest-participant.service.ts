import { SupabaseService } from "../../services";
import { SUPABASE_0_ROWS_ERROR_CODE } from "../../utils/constants";
import { createError, HttpStatusCode } from "../../utils/functions";
import type { MeritDistribution } from "../proposal/proposal.schema";
import { distributeMerits } from "../proposal/proposal.service";
import { getQuest } from "../quest/quest.service";
import type {
    JoinQuestBody,
    UpdateParticipantCompletionBody,
} from "./quest-participant.schema";

export const joinQuest = async ({ member_id, quest_id }: JoinQuestBody) => {
    const quest = await getQuest(quest_id);
    if (!quest) {
        throw createError("Quest not found", HttpStatusCode.NOT_FOUND);
    }

    const participant = await getParticipant(quest_id, member_id);
    if (participant) {
        throw createError(
            "Participant already exists",
            HttpStatusCode.BAD_REQUEST
        );
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quest_participant")
        .insert({
            member_id,
            quest_id,
            twitter_follow_completed: quest.twitter_follow_enabled
                ? false
                : true,
            twitter_like_completed: quest.twitter_like_enabled ? false : true,
            twitter_retweet_completed: quest.twitter_retweet_enabled
                ? false
                : true,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getQuestParticipants = async (quest_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quest_participant")
        .select()
        .eq("quest_id", quest_id)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
};

export const getParticipant = async (quest_id: string, member_id: string) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quest_participant")
        .select()
        .eq("quest_id", quest_id)
        .eq("member_id", member_id)
        .single();

    if (error && error.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw error;
    }

    return data;
};

export const updateParticipantCompletion = async (
    quest_id: string,
    member_id: string,
    completionData: UpdateParticipantCompletionBody
) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("quest_participant")
        .update(completionData)
        .eq("quest_id", quest_id)
        .eq("member_id", member_id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    if (
        data.twitter_follow_completed &&
        data.twitter_like_completed &&
        data.twitter_retweet_completed
    ) {
        completeQuest(quest_id, member_id);
    }

    return data;
};

const completeQuest = async (quest_id: string, member_id: string) => {
    const quest = await getQuest(quest_id);
    if (!quest) {
        throw createError("Quest not found", HttpStatusCode.NOT_FOUND);
    }

    const distributions: MeritDistribution[] = [
        {
            amount: quest.reward_merits.toString(),
            address: member_id,
        },
    ];

    await distributeMerits(
        `${quest_id}::${member_id}::${Date.now()}`,
        "Quest completion reward",
        distributions
    );

    // TODO: Add token distribution
    // if (
    //     quest.reward_token_address &&
    //     quest.reward_token_amount &&
    //     quest.reward_token_address
    // ) {
    // }
};
