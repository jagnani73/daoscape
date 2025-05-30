/**
 * Creates a standardized error with HTTP status code
 */
export class ApiError extends Error {
    errorCode: number;

    constructor(message: string, errorCode: number) {
        super(message);
        this.name = this.constructor.name;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Creates an API error with the specified message and HTTP status code
 */
export const createError = (message: string, statusCode: number): ApiError => {
    return new ApiError(message, statusCode);
};

/**
 * Common HTTP status codes
 */
export const HttpStatusCode = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER: 500,
} as const;
