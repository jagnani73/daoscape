import { HttpStatusCode, createError } from "../utils/functions";
import { type NextFunction, type Request, type Response } from "express";
import { verify } from "jsonwebtoken";
import { z } from "zod";

export const jwtHeaderSchema = z.object({
    authorization: z
        .string()
        .trim()
        .min(1, { message: "JWT cannot be null" })
        .regex(/^Bearer .+$/, { message: "JWT should be Bearer Token" }),
});

export const validateJwt = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = jwtHeaderSchema.safeParse(req.headers);

            if (!result.success) {
                return next(
                    createError(
                        "Authorization header is required",
                        HttpStatusCode.UNAUTHORIZED
                    )
                );
            }

            const authToken = result.data.authorization.split(" ")[1];

            verify(authToken, process.env.JWT_SECRET!);

            next();
        } catch (err: any) {
            next(
                createError(
                    `${err.name}: ${err.message}`,
                    HttpStatusCode.FORBIDDEN
                )
            );
        }
    };
};
