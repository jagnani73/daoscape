import { validateQuery } from "../../middlewares";
import { createError, HttpStatusCode } from "../../utils/functions";
import {
    getParticipantParamsSchema,
    getParticipantsParamsSchema,
    joinQuestBodySchema,
    updateParticipantCompletionBodySchema,
    updateParticipantCompletionParamsSchema,
    type GetParticipantParams,
    type GetParticipantsParams,
    type JoinQuestBody,
    type UpdateParticipantCompletionBody,
} from "./quest-participant.schema";
import {
    getParticipant,
    getQuestParticipants,
    joinQuest,
    updateParticipantCompletion,
} from "./quest-participant.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const questParticipantRouter = Router();

const handleJoinQuest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { member_id, quest_id } = req.body as JoinQuestBody;

        const data = await joinQuest({ member_id, quest_id });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetQuestParticipants = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { quest_id } = req.params as GetParticipantsParams;
        const data = await getQuestParticipants(quest_id);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetParticipant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { quest_id, member_id } = req.params as GetParticipantParams;
        const data = await getParticipant(quest_id, member_id);

        if (!data) {
            throw createError(
                "Participant not found",
                HttpStatusCode.NOT_FOUND
            );
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleUpdateParticipantCompletion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { quest_id, member_id } = req.params;
        const completionData = req.body as UpdateParticipantCompletionBody;

        const data = await updateParticipantCompletion(
            quest_id,
            member_id,
            completionData
        );

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

questParticipantRouter.post(
    "/join",
    validateQuery("body", joinQuestBodySchema),
    handleJoinQuest
);

questParticipantRouter.get(
    "/quest/:quest_id",
    validateQuery("params", getParticipantsParamsSchema),
    handleGetQuestParticipants
);

questParticipantRouter.get(
    "/quest/:quest_id/member/:member_id",
    validateQuery("params", getParticipantParamsSchema),
    handleGetParticipant
);

questParticipantRouter.patch(
    "/quest/:quest_id/member/:member_id/completion",
    validateQuery("params", updateParticipantCompletionParamsSchema),
    validateQuery("body", updateParticipantCompletionBodySchema),
    handleUpdateParticipantCompletion
);
