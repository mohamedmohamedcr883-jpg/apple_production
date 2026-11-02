import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../common/Error/index"; // عدّل المسار حسب مكانه

export const validate = (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new BadRequestError(
          "Validation failed",
          result.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        )
      );
    }

    req.body = result.data;
    next();
  };
