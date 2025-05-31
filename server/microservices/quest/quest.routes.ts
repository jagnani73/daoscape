import { validateQuery } from "../../middlewares";
import { createError, HttpStatusCode } from "../../utils/functions";
import { createQuestBodySchema, type CreateQuestBody } from "./quest.schema";
import { createQuest, getQuest, getQuestsByDaoId } from "./quest.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const questRouter = Router();

const handleCreateQuest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            dao_id,
            start_time,
            end_time,
            title,
            description,
            reward_merits,
            reward_token_chain,
            reward_token_address,
            reward_token_amount,
            twitter_account_url,
            twitter_post_url,
            twitter_follow_enabled,
            twitter_like_enabled,
            twitter_retweet_enabled,
        } = req.body as CreateQuestBody;

        const data = await createQuest({
            dao_id,
            start_time,
            end_time,
            title,
            description,
            reward_merits,
            reward_token_chain,
            reward_token_address,
            reward_token_amount,
            twitter_account_url,
            twitter_post_url,
            twitter_follow_enabled,
            twitter_like_enabled,
            twitter_retweet_enabled,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetQuestsByDaoId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dao_id } = req.params;
        const data = await getQuestsByDaoId(dao_id);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetQuest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { quest_id } = req.params;
        const data = await getQuest(quest_id);

        if (!data) {
            throw createError("Quest not found", HttpStatusCode.NOT_FOUND);
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

questRouter.post(
    "/create",
    // validateJwt(),
    validateQuery("body", createQuestBodySchema),
    handleCreateQuest
);

questRouter.get("/dao/:dao_id", handleGetQuestsByDaoId);

questRouter.get("/:quest_id", handleGetQuest);
