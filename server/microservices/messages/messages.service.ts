import { SupabaseService } from "../../services";
import type { CreateMessageBody, MessageHistoryBody } from "./messages.schema";

export const createMessage = async ({
    member_id,
    proposal_id,
    message,
}: CreateMessageBody) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("messages")
        .insert({
            member_id,
            proposal_id,
            message,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getMessages = async ({
    proposal_id,
    limit,
    offset,
}: MessageHistoryBody) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("messages")
        .select()
        .eq("proposal_id", proposal_id)
        .order("created_at", { ascending: false })
        .range(offset!, limit! + offset!)
        .limit(limit!);

    if (error) {
        throw error;
    }

    return data;
};
