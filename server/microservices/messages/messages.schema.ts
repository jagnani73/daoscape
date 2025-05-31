import * as z from "zod";

export const createMessageBodySchema = z.object({
    member_id: z.string().uuid(),
    proposal_id: z.string().uuid(),
    message: z.string().trim().min(1).max(1000),
});

export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;

export const messageHistoryBodySchema = z.object({
    proposal_id: z.string().uuid(),
    limit: z.coerce.number().min(1).max(100).optional().default(50),
    offset: z.coerce.number().min(0).optional().default(0),
});

export type MessageHistoryBody = z.infer<typeof messageHistoryBodySchema>;
