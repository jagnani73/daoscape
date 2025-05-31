import { OneinchService } from "../../services/oneinch.service";
import type { GetQuoteBody, SwapRequestBody } from "./swap.schema";
import type { SupportedChain } from "@1inch/cross-chain-sdk";
import { HashLock, NetworkEnum, PresetEnum } from "@1inch/cross-chain-sdk";
import { randomBytes } from "crypto";

const getNetworkEnum = (chainId: number): SupportedChain => {
    switch (chainId) {
        case 1:
            return NetworkEnum.ETHEREUM;
        case 56:
            return NetworkEnum.BINANCE;
        case 137:
            return NetworkEnum.POLYGON;
        case 42161:
            return NetworkEnum.ARBITRUM;
        case 10:
            return NetworkEnum.OPTIMISM;
        case 43114:
            return NetworkEnum.AVALANCHE;
        case 100:
            return NetworkEnum.GNOSIS;
        case 8453:
            return NetworkEnum.COINBASE;
        case 59144:
            return NetworkEnum.LINEA;
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
};

export const getSwapQuote = async ({
    src,
    dst,
    amount,
    srcChainId,
    dstChainId,
}: GetQuoteBody) => {
    const sdk = OneinchService.getFusionSDK();

    const params = {
        srcChainId: getNetworkEnum(srcChainId),
        dstChainId: getNetworkEnum(dstChainId),
        srcTokenAddress: src,
        dstTokenAddress: dst,
        amount: amount,
        enableEstimate: true,
        walletAddress: process.env.MAKER_WALLET_ADDRESS || "",
    };

    const quote = await sdk.getQuote(params);
    return quote;
};

export const executeSwap = async ({
    src,
    dst,
    amount,
    from,
    srcChainId,
    dstChainId,
    to,
}: SwapRequestBody) => {
    const sdk = OneinchService.getFusionSDK();

    const params = {
        srcChainId: getNetworkEnum(srcChainId),
        dstChainId: getNetworkEnum(dstChainId),
        srcTokenAddress: src,
        dstTokenAddress: dst,
        amount: amount,
        enableEstimate: true,
        walletAddress: from,
    };

    const quote = await sdk.getQuote(params);

    const preset = PresetEnum.fast;
    const secrets = Array.from({
        length: quote.presets[preset].secretsCount,
    }).map(() => "0x" + randomBytes(32).toString("hex"));

    const hashLock =
        secrets.length === 1
            ? HashLock.forSingleFill(secrets[0])
            : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

    const { hash, quoteId, order } = await sdk.createOrder(quote, {
        walletAddress: to || from,
        hashLock,
        preset,
        source: "swap-microservice",
        secretHashes,
    });

    return {
        hash,
        quoteId,
        order,
        secrets,
        secretHashes,
    };
};
