import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    Object.defineProperty(req, source, {
      configurable: true,
      writable: true,
      value: result.data,
    });
    next();
  };
}

export function pickDefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
