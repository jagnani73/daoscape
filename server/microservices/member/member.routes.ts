import { validateQuery } from "../../middlewares";
import { createUserBodySchema, type CreateUserBody } from "./member.schema";
import { createUser } from "./member.service";
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

memberRouter.post(
    "/create",
    // validateJwt(),
    validateQuery("body", createUserBodySchema),
    handleCreateUser
);
