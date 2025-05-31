import { validateQuery } from "../../middlewares";
import {
    getQuoteBodySchema,
    swapRequestBodySchema,
    type GetQuoteBody,
    type SwapRequestBody,
} from "./swap.schema";
import { executeSwap, getSwapQuote } from "./swap.service";
import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";

export const swapRouter = Router();

const handleGetQuote = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { src, dst, amount } = req.body as GetQuoteBody;

        const data = await getSwapQuote({
            src,
            dst,
            amount,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleExecuteSwap = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            src,
            dst,
            amount,
            from,
            slippage,
            disableEstimate,
            allowPartialFill,
        } = req.body as SwapRequestBody;

        const data = await executeSwap({
            src,
            dst,
            amount,
            from,
            slippage,
            disableEstimate,
            allowPartialFill,
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

swapRouter.post(
    "/quote",
    validateQuery("body", getQuoteBodySchema),
    handleGetQuote
);

swapRouter.post(
    "/execute",
    validateQuery("body", swapRequestBodySchema),
    handleExecuteSwap
);
