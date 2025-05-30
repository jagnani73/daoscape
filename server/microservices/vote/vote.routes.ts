import { validateQuery } from "../../middlewares";
import { castVoteBodySchema, type CastVoteBody } from "./vote.schema";
import { castVote } from "./vote.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const voteRouter = Router();

const handleCastVote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { proposal_id, wallet_address, vote, is_feedback } =
            req.body as CastVoteBody;

        const data = await castVote({
            proposal_id,
            wallet_address,
            is_feedback,
            vote,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

voteRouter.post(
    "/",
    // validateJwt(),
    validateQuery("body", castVoteBodySchema),
    handleCastVote
);
