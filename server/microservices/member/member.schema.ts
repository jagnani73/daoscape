import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const createUserBodySchema = z.object({
    wallet_address: evmAddressSchema,
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
