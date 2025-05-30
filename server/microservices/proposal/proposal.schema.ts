import * as z from "zod";

export const createProposalBodySchema = z
    .object({
        title: z.string().trim(),
        description: z.string().trim(),
        dao_id: z.string().uuid().optional(),
        voting_start: z.string().datetime(),
        voting_end: z.string().datetime(),
        feedback_end: z.string().datetime(),
    })
    .refine(
        (data) => {
            const votingStart = new Date(data.voting_start);
            const now = new Date();
            return votingStart > now;
        },
        {
            message: "Voting start must be in the future",
            path: ["voting_start"],
        }
    )
    .refine(
        (data) => {
            const votingStart = new Date(data.voting_start);
            const votingEnd = new Date(data.voting_end);
            return votingEnd > votingStart;
        },
        {
            message: "Voting end must be after voting start",
            path: ["voting_end"],
        }
    )
    .refine(
        (data) => {
            const votingEnd = new Date(data.voting_end);
            const feedbackEnd = new Date(data.feedback_end);
            return feedbackEnd > votingEnd;
        },
        {
            message: "Feedback end must be after voting end",
            path: ["feedback_end"],
        }
    );

export type CreateProposalBody = z.infer<typeof createProposalBodySchema>;

export const concludeProposalBodySchema = z.object({
    proposal_id: z.string().uuid(),
    is_feedback: z.boolean(),
});

export type ConcludeProposalBody = z.infer<typeof concludeProposalBodySchema>;

export const getProposalParamsSchema = z.object({
    proposal_id: z.string().uuid(),
});

export type GetProposalParams = z.infer<typeof getProposalParamsSchema>;

export interface MeritDistribution {
    address: string;
    amount: string;
}
