import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const createDaoBodySchema = z.object({
    name: z.string().trim(),
    description: z.string().trim(),
    logo: z.string().trim(),
    owner_address: evmAddressSchema,
    tokens: z.array(
        z.object({
            token_address: evmAddressSchema,
            chain_id: z.number(),
        })
    ),
    socials: z.object({
        twitter: z.string().trim().url().nullable().optional(),
        telegram: z.string().trim().url().nullable().optional(),
        discord: z.string().trim().url().nullable().optional(),
        website: z.string().trim().url().nullable().optional(),
    }),
    tags: z.array(z.string().trim()).optional().default([]),
    email_subfix: z.string().trim(),
});

export type CreateDaoBody = z.infer<typeof createDaoBodySchema>;

export const getTokenDetailsBodySchema = z.object({
    token_address: evmAddressSchema,
    chain_id: z.number(),
});

export type GetTokenDetailsBody = z.infer<typeof getTokenDetailsBodySchema>;
