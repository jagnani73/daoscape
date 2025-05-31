import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const swapRequestBodySchema = z.object({
    src: evmAddressSchema,
    dst: evmAddressSchema,
    amount: z.string(),
    from: evmAddressSchema,
    slippage: z.number().min(0).max(50).optional().default(1),
    disableEstimate: z.boolean().optional().default(false),
    allowPartialFill: z.boolean().optional().default(false),
});

export type SwapRequestBody = z.infer<typeof swapRequestBodySchema>;

export const getQuoteBodySchema = z.object({
    src: evmAddressSchema,
    dst: evmAddressSchema,
    amount: z.string(),
});

export type GetQuoteBody = z.infer<typeof getQuoteBodySchema>;
