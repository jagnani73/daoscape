import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const getOrCreateMemberParamsSchema = z.object({
    wallet_address: evmAddressSchema,
});

export type GetOrCreateMemberParams = z.infer<
    typeof getOrCreateMemberParamsSchema
>;
