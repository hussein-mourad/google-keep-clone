import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { auth } from "@/lib/auth";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import notesRouter from "@/features/notes/router";
import labelsRouter from "@/features/labels/router";
import env from "@/lib/env";
import { requireAuth } from "./features/auth/middleware";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable("etag").disable("x-powered-by");

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/api/auth/me", async (req: Request, res: Response) => {
  const result = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!result) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json(result.user);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(requireAuth);
app.use("/api/notes", notesRouter);
app.use("/api/labels", labelsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
