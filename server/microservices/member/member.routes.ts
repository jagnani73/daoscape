import { validateQuery } from "../../middlewares";
import {
    getOrCreateMemberParamsSchema,
    type GetOrCreateMemberParams,
} from "./member.schema";
import { getOrCreateMember } from "./member.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const memberRouter = Router();

const handleGetOrCreateMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { wallet_address } = req.params as GetOrCreateMemberParams;

        const data = await getOrCreateMember({
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

memberRouter.get(
    "/:wallet_address",
    validateQuery("params", getOrCreateMemberParamsSchema),
    handleGetOrCreateMember
);
