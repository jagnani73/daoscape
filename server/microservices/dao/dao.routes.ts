import { validateQuery } from "../../middlewares";
import {
    createDaoBodySchema,
    getTokenDetailsBodySchema,
    type CreateDaoBody,
    type GetTokenDetailsBody,
} from "./dao.schema";
import { createDao, getTokenDetails } from "./dao.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const daoRouter = Router();

const handleCreateDao = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { description, logo, name, owner_address, socials, tokens } =
            req.body as CreateDaoBody;

        const data = await createDao({
            description,
            logo,
            name,
            owner_address,
            socials,
            tokens,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetTokenDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token_address, chain_id } = req.body as GetTokenDetailsBody;

        const data = await getTokenDetails({
            token_address,
            chain_id,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};
daoRouter.post(
    "/create",
    // validateJwt(),
    validateQuery("body", createDaoBodySchema),
    handleCreateDao
);

daoRouter.post(
    "/token",
    validateQuery("body", getTokenDetailsBodySchema),
    handleGetTokenDetails
);
