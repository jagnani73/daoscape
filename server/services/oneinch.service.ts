import { PrivateKeyProviderConnector, SDK } from "@1inch/cross-chain-sdk";
import axios, { type AxiosInstance } from "axios";
import Web3 from "web3";

export class OneinchService {
    private static instance: OneinchService;
    private static axiosInstance: AxiosInstance;
    private static fusionSDK: SDK;

    public static init = (): void => {
        if (!process.env.ONEINCH_BASE_URL || !process.env.ONEINCH_API_KEY) {
            console.error("Missing Oneinch env variables.");
            process.exit(1);
        } else {
            this.axiosInstance = axios.create({
                baseURL: process.env.ONEINCH_BASE_URL,
                headers: {
                    Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
                },
            });

            if (!process.env.MAKER_PRIVATE_KEY || !process.env.WEB3_NODE_URL) {
                console.error(
                    "Missing MAKER_PRIVATE_KEY or WEB3_NODE_URL for Fusion SDK."
                );
                process.exit(1);
            }

            const blockchainProvider = new PrivateKeyProviderConnector(
                process.env.MAKER_PRIVATE_KEY,
                new Web3(process.env.WEB3_NODE_URL!) as any
            );

            this.fusionSDK = new SDK({
                url: "https://api.1inch.dev/fusion-plus",
                authKey: process.env.ONEINCH_API_KEY,
                blockchainProvider,
            });

            console.info("Oneinch Service initiated successfully!");
        }
    };

    public static getInstance(): AxiosInstance {
        if (!OneinchService.instance) {
            OneinchService.instance = new OneinchService();
        }
        return OneinchService.axiosInstance;
    }

    public static getFusionSDK(): SDK {
        if (!OneinchService.instance) {
            OneinchService.instance = new OneinchService();
        }
        if (!OneinchService.fusionSDK) {
            throw new Error(
                "Fusion SDK not initialized. Call OneinchService.init() first."
            );
        }
        return OneinchService.fusionSDK;
    }
}
