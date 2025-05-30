import { validateQuery } from "../../middlewares";
import { createError, HttpStatusCode } from "../../utils/functions";
import {
    createUserBodySchema,
    getMemberParamsSchema,
    type CreateUserBody,
    type GetMemberParams,
} from "./member.schema";
import { createUser, getMember } from "./member.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const memberRouter = Router();

const handleCreateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { wallet_address } = req.body as CreateUserBody;

        const data = await createUser({
            wallet_address,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { member_id } = req.params as GetMemberParams;

        const data = await getMember(member_id);

        if (!data) {
            throw createError("Member not found", HttpStatusCode.NOT_FOUND);
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

memberRouter.post(
    "/create",
    // validateJwt(),
    validateQuery("body", createUserBodySchema),
    handleCreateUser
);

memberRouter.get(
    "/:member_id",
    validateQuery("params", getMemberParamsSchema),
    handleGetMember
);
