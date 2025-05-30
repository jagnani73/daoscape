import { SupabaseService } from "../../services";
import { SUPABASE_0_ROWS_ERROR_CODE } from "../../utils/constants";
import type { GetOrCreateMemberParams } from "./member.schema";

export const getOrCreateMember = async ({
    wallet_address,
}: GetOrCreateMemberParams) => {
    const existingMember = await getMember(wallet_address);
    if (existingMember) {
        return existingMember;
    }

    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("members")
        .insert({
            member_id: wallet_address,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getMember = async (member_id: string) => {
    const { data: member, error: memberError } =
        await SupabaseService.getSupabase("admin")
            .from("members")
            .select(
                `
                *,
                memberships(*)
                `
            )
            .eq("member_id", member_id)
            .single();

    if (memberError && memberError.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw memberError;
    }

    return member;
};
