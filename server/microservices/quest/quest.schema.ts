import { evmAddressSchema } from "../../utils/shared.schema";
import * as z from "zod";

export const createQuestBodySchema = z
    .object({
        dao_id: z.string().uuid(),
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        reward_merits: z.number().int().positive(),
        reward_token_chain: z.number().int().optional(),
        reward_token_address: evmAddressSchema.optional(),
        reward_token_amount: z.number().positive().optional(),
        twitter_account_url: z.string().trim().url().optional(),
        twitter_post_url: z.string().trim().url().optional(),
        twitter_follow_enabled: z.boolean(),
        twitter_like_enabled: z.boolean(),
        twitter_retweet_enabled: z.boolean(),
    })
    .refine(
        (data) => {
            const hasTokenChain = data.reward_token_chain !== undefined;
            const hasTokenAddress = data.reward_token_address !== undefined;
            const hasTokenAmount = data.reward_token_amount !== undefined;

            if (hasTokenChain || hasTokenAddress || hasTokenAmount) {
                return hasTokenChain && hasTokenAddress && hasTokenAmount;
            }
            return true;
        },
        {
            message:
                "If providing token rewards, all token fields (chain, address, amount) must be provided",
            path: ["reward_token_chain"],
        }
    )
    .refine(
        (data) => {
            if (data.twitter_follow_enabled && !data.twitter_account_url) {
                return false;
            }
            return true;
        },
        {
            message: "Twitter account URL is required when follow is enabled",
            path: ["twitter_account_url"],
        }
    )
    .refine(
        (data) => {
            const needsPostUrl =
                data.twitter_like_enabled || data.twitter_retweet_enabled;
            if (needsPostUrl && !data.twitter_post_url) {
                return false;
            }
            return true;
        },
        {
            message:
                "Twitter post URL is required when like or retweet is enabled",
            path: ["twitter_post_url"],
        }
    );

export type CreateQuestBody = z.infer<typeof createQuestBodySchema>;
