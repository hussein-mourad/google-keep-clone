import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import notesRouter from "@/features/notes/router";
import labelsRouter from "@/features/labels/router";
import env from "@/lib/env";
import { errorHandler, notFoundHandler } from "@/lib/error-handler";

export const TEST_USER_ID = "test-user-id-00000000-0000-0000-0000-000000000000";

export function createTestApp() {
  const app = express();

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

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use((req: any, _res: any, next: any) => {
    req.user = { id: TEST_USER_ID };
    req.session = { user: { id: TEST_USER_ID } };
    next();
  });

  app.use("/api/notes", notesRouter);
  app.use("/api/labels", labelsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
