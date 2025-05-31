import { OneinchService } from "../../services/oneinch.service";
import type { GetQuoteBody, SwapRequestBody } from "./swap.schema";

export const getSwapQuote = async ({ src, dst, amount }: GetQuoteBody) => {
    const { data } = await OneinchService.getInstance().get(`/v6.0/1/quote`, {
        params: {
            src,
            dst,
            amount,
        },
    });

    return data;
};

export const executeSwap = async ({
    src,
    dst,
    amount,
    from,
    slippage,
    disableEstimate,
    allowPartialFill,
}: SwapRequestBody) => {
    const { data } = await OneinchService.getInstance().get(`/v6.0/1/swap`, {
        params: {
            src,
            dst,
            amount,
            from,
            slippage,
            disableEstimate,
            allowPartialFill,
        },
    });

    return data;
};
