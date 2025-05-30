import { validateQuery } from "../../middlewares";
import {
    concludeProposalBodySchema,
    createProposalBodySchema,
    type ConcludeProposalBody,
    type CreateProposalBody,
} from "./proposal.schema";
import { concludeProposal, createProposal } from "./proposal.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const proposalRouter = Router();

const handleCreateProposal = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            voting_end: deadline,
            dao_id,
            description,
            voting_start,
            feedback_end,
            title,
        } = req.body as CreateProposalBody;

        const data = await createProposal({
            voting_end: deadline,
            dao_id,
            description,
            voting_start,
            title,
            feedback_end,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleConcludeProposal = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { proposal_id, is_feedback } = req.body as ConcludeProposalBody;

        const data = await concludeProposal(proposal_id, is_feedback);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

proposalRouter.post(
    "/create",
    // validateJwt(),
    validateQuery("body", createProposalBodySchema),
    handleCreateProposal
);

proposalRouter.post(
    "/conclude",
    validateQuery("body", concludeProposalBodySchema),
    handleConcludeProposal
);
