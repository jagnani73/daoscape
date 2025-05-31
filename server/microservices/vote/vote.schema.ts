import { HOUSES, VOTE_TYPES } from "../../utils/constants";
import { evmAddressSchema } from "../../utils/shared.schema";
import z from "zod";

export const castVoteBodySchema = z.object({
    proposal_id: z.string().uuid(),
    wallet_address: evmAddressSchema,
    vote: z.nativeEnum(VOTE_TYPES),
    is_feedback: z.boolean(),
});

export type CastVoteBody = z.infer<typeof castVoteBodySchema>;

export const getVotesBodySchema = z.object({
    proposal_id: z.string().uuid(),
    is_feedback: z.boolean(),
    house: z.nativeEnum(HOUSES).optional().nullable(),
});

export type GetVotesBody = z.infer<typeof getVotesBodySchema>;
