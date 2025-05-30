import { z } from "zod";

export const evmAddressSchema = z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid EVM address")
    .refine((val) => val.startsWith("0x"), "Must start with 0x");
