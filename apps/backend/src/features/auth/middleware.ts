import type { NextFunction, Request, Response } from "express";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/http-error";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.session = session;
    req.user = session.user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export function getUserId(req: Request): string {
  const id = req.user?.id;
  if (!id) {
    throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
  }
  return id;
}
