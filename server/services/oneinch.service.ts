import axios, { type AxiosInstance } from "axios";

export class OneinchService {
    private static instance: OneinchService;
    private static axiosInstance: AxiosInstance;

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
            console.info("Oneinch Service initiated successfully!");
        }
    };

    public static getInstance(): AxiosInstance {
        if (!OneinchService.instance) {
            OneinchService.instance = new OneinchService();
        }
        return OneinchService.axiosInstance;
    }
}
