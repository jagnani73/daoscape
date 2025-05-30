import axios, { type AxiosInstance } from "axios";

export class BlockscoutService {
    private static instance: BlockscoutService;
    private static axiosInstance: AxiosInstance;

    public static init = (): void => {
        if (
            !process.env.BLOCKSCOUT_MERITS_BASE_URL ||
            !process.env.BLOCKSCOUT_API_KEY
        ) {
            console.error("Missing Blockscout env variables.");
            process.exit(1);
        } else {
            this.axiosInstance = axios.create({
                baseURL: process.env.BLOCKSCOUT_MERITS_BASE_URL,
                headers: {
                    Authorization: `Bearer ${process.env.BLOCKSCOUT_API_KEY}`,
                },
            });
            console.info("Blockscout Service initiated successfully!");
        }
    };

    public static getInstance(): AxiosInstance {
        if (!BlockscoutService.instance) {
            BlockscoutService.instance = new BlockscoutService();
        }
        return BlockscoutService.axiosInstance;
    }
}
