import { validateQuery } from "../../middlewares";
import {
    emailVerifiedBodySchema,
    getMembershipsBodySchema,
    joinDaoBodySchema,
    type EmailVerifiedBody,
    type GetMembershipsBody,
    type JoinDaoBody,
} from "./membership.schema";
import { emailVerified, getMemberships, joinDao } from "./membership.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const membershipRouter = Router();

const handleJoinDao = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dao_id, wallet_address } = req.body as JoinDaoBody;

        const data = await joinDao({
            dao_id,
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

const handleGetMemberships = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { wallet_address } = req.body as GetMembershipsBody;

        const data = await getMemberships(wallet_address);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleEmailVerified = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { wallet_address, dao_id } = req.body as EmailVerifiedBody;

        const data = await emailVerified({
            wallet_address,
            dao_id,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

membershipRouter.post(
    "/join",
    // validateJwt(),
    validateQuery("body", joinDaoBodySchema),
    handleJoinDao
);

membershipRouter.post(
    "/daos",
    validateQuery("body", getMembershipsBodySchema),
    handleGetMemberships
);

membershipRouter.post(
    "/email-verified",
    validateQuery("body", emailVerifiedBodySchema),
    handleEmailVerified
);
