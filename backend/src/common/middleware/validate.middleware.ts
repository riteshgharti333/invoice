import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

type ValidationSchema = z.ZodObject<any> | z.ZodEffects<any>;

export const validate =
  (schema: ValidationSchema): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params, 
      });

      next();
    } catch (error) {
      next(error);
    }
  };
