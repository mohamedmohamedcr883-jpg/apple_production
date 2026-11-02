export class AppError extends Error {
    constructor(message: string, public statusCode: number, public errorDetails?: Record<string, any>[]) {
        super(message);
    }
}
export class ConflictError extends AppError {
    constructor(public message: string, public errorDetails?: Record<string, any>[]) {
        super(message, 409, errorDetails);
    }
}
export class AuthorityError extends AppError {
    constructor(public message: string, public errorDetails?: Record<string, any>[]) {
        super(message, 401, errorDetails);
    }
}
export class BadRequestError extends AppError {
    constructor(public message: string, public errorDetails?: Record<string, any>[]) {
        super(message, 400, errorDetails);
    }
}
export class NotFoundError extends AppError {
    constructor(public message: string, public errorDetails?: Record<string, any>[]) {
        super(message, 404, errorDetails);
    }
}