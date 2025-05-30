import { validateQuery } from "../../middlewares";
import {
    createDaoBodySchema,
    getTokenDetailsBodySchema,
    type CreateDaoBody,
    type GetTokenDetailsBody,
} from "./dao.schema";
import { createDao, getAllDaos, getDao, getTokenDetails } from "./dao.service";
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
        const {
            description,
            logo,
            name,
            owner_address,
            socials,
            tokens,
            tags,
        } = req.body as CreateDaoBody;

        const data = await createDao({
            description,
            logo,
            name,
            owner_address,
            socials,
            tokens,
            tags,
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

const handleGetAllDaos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await getAllDaos();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetDao = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dao_id } = req.params;
        const data = await getDao(dao_id);

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

daoRouter.get("/:dao_id", handleGetDao);

daoRouter.get("/", handleGetAllDaos);
