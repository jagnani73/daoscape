import { validateQuery } from "../../middlewares";
import {
    createMessageBodySchema,
    messageHistoryBodySchema,
    type CreateMessageBody,
    type MessageHistoryBody,
} from "./messages.schema";
import { createMessage, getMessages } from "./messages.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const messagesRouter = Router();

const handleCreateMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { member_id, proposal_id, message } =
            req.body as CreateMessageBody;

        const data = await createMessage({
            member_id,
            proposal_id,
            message,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { proposal_id, limit, offset } = req.body as MessageHistoryBody;

        const data = await getMessages({
            proposal_id,
            limit,
            offset,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

messagesRouter.post(
    "/create",
    validateQuery("body", createMessageBodySchema),
    handleCreateMessage
);

messagesRouter.get(
    "/",
    validateQuery("body", messageHistoryBodySchema),
    handleGetMessages
);
