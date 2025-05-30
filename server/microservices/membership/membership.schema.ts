import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const joinDaoBodySchema = z.object({
    dao_id: z.string(),
    wallet_address: evmAddressSchema,
});

export type JoinDaoBody = z.infer<typeof joinDaoBodySchema>;

export const getMembershipsBodySchema = z.object({
    wallet_address: evmAddressSchema,
});

export type GetMembershipsBody = z.infer<typeof getMembershipsBodySchema>;
