import * as z from "zod";

export const joinQuestBodySchema = z.object({
    member_id: z.string().trim(),
    quest_id: z.string().uuid(),
});

export type JoinQuestBody = z.infer<typeof joinQuestBodySchema>;

export const updateParticipantCompletionParamsSchema = z.object({
    quest_id: z.string().uuid(),
    member_id: z.string().trim(),
});

export const updateParticipantCompletionBodySchema = z
    .object({
        twitter_follow_completed: z.boolean().optional(),
        twitter_like_completed: z.boolean().optional(),
        twitter_retweet_completed: z.boolean().optional(),
    })
    .refine(
        (data) => {
            return (
                data.twitter_follow_completed !== undefined ||
                data.twitter_like_completed !== undefined ||
                data.twitter_retweet_completed !== undefined
            );
        },
        {
            message: "At least one completion field must be provided",
            path: ["twitter_follow_completed"],
        }
    );

export type UpdateParticipantCompletionBody = z.infer<
    typeof updateParticipantCompletionBodySchema
>;

export const getParticipantParamsSchema = z.object({
    quest_id: z.string().uuid(),
    member_id: z.string().trim(),
});

export type GetParticipantParams = z.infer<typeof getParticipantParamsSchema>;

export const getParticipantsParamsSchema = z.object({
    quest_id: z.string().uuid(),
});

export type GetParticipantsParams = z.infer<typeof getParticipantsParamsSchema>;
