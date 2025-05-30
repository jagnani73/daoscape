import { type NextFunction, type Request, type Response } from "express";
import { type ZodSchema, ZodError } from "zod";

type RequestLocations = "query" | "body" | "params" | "headers";

/**
 * Generic Request Validator
 * @param {RequestLocations} location The parameter of the req object to be validated.
 * @param {AnyZodObject} schema The Zod schema against which validation is to be done.
 */
export const validateQuery = (
    location: RequestLocations,
    schema: ZodSchema
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let _location;
        switch (location) {
            case "query":
                _location = req.query;
                break;
            case "body":
                _location = req.body;
                break;
            case "params":
                _location = req.params;
                break;
            case "headers":
                _location = req.headers;
                break;
        }
        try {
            await schema.parseAsync(_location);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const message = error.errors
                    .map((e) => `'${e.path.join(".")}': ${e.message}`)
                    .join(". ");
                res.status(400).json({
                    name: "Validation Error",
                    message,
                });
            } else {
                next(error);
            }
        }
    };
};

export default validateQuery;
