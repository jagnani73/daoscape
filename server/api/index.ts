import {
    daoRouter,
    memberRouter,
    membershipRouter,
    proposalRouter,
    voteRouter,
} from "../microservices";
import {
    BlockscoutService,
    OneinchService,
    SupabaseService,
} from "../services";
import cors from "cors";
import "dotenv/config";
import express, {
    type Express,
    type NextFunction,
    type Request,
    type Response,
} from "express";

const app: Express = express();
app.use(cors());
app.use(express.json());

app.get("/healthcheck", (_req: Request, res: Response) => {
    const now = new Date();
    res.json({
        success: true,
        timestamp: now.toISOString(),
        uptime: process.uptime(),
    });
});

app.use("/api/v1/dao", daoRouter);
app.use("/api/v1/member", memberRouter);
app.use("/api/v1/proposal", proposalRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/membership", membershipRouter);

app.use("*", (_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
    });
});

app.use(
    (err: Error | any, _req: Request, res: Response, _next: NextFunction) => {
        const now = new Date();
        console.error("Server Error", `${now.toISOString()}`, err);
        if (err.errorCode) {
            res.status(err.errorCode).json({
                success: false,
                message: `${err.name || "Server Error"}: ${err.message}`,
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }
);

(async () => {
    try {
        await Promise.all([
            BlockscoutService.init(),
            OneinchService.init(),
            SupabaseService.init(),
        ]);
        const env: string = process.env.NODE_ENV || "development";
        if (env !== "test") {
            const port: number = +(process.env.PORT || 8080);
            app.listen(port, () => {
                console.info(
                    `Server listening on Port ${port} in the ${env} environment`
                );
            });
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

process.on("SIGINT", () => {
    process.exit(0);
});
process.on("SIGHUP", () => {
    process.exit(0);
});

export default app;
