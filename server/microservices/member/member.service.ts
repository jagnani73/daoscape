import { SupabaseService } from "../../services";
import { SUPABASE_0_ROWS_ERROR_CODE } from "../../utils/constants";
import type { CreateUserBody } from "./member.schema";

export const createUser = async ({ wallet_address }: CreateUserBody) => {
    const { data, error } = await SupabaseService.getSupabase("admin")
        .from("members")
        .insert({
            member_id: wallet_address,
            reputation: 10,
        })
        .select()
        .single();

    if (error) {
        const existingMember = await getMember(wallet_address);
        if (existingMember) {
            return existingMember;
        }

        throw error;
    }

    return data;
};

export const getMember = async (member_id: string) => {
    const { data: member, error: memberError } =
        await SupabaseService.getSupabase("admin")
            .from("members")
            .select()
            .eq("member_id", member_id)
            .single();

    if (memberError && memberError.code !== SUPABASE_0_ROWS_ERROR_CODE) {
        throw memberError;
    }

    return member;
};

export const changeReputation = async (
    members: {
        member_id: string;
        change: number;
    }[]
) => {
    await Promise.all(
        members.map(async ({ member_id, change }) => {
            const currentMember = await getMember(member_id);
            if (!currentMember) {
                throw new Error("Member not found");
            }

            const newReputation = currentMember.reputation + change;

            const { error } = await SupabaseService.getSupabase("admin")
                .from("members")
                .update({
                    reputation: newReputation,
                })
                .eq("member_id", member_id)
                .select()
                .single();

            if (error) {
                throw error;
            }
        })
    );
};
