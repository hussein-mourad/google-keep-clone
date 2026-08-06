import assert from "assert";
import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { describe, it } from "vitest";
import { ZodError, z } from "zod";
import { AppError } from "../lib/http-error";
import { errorHandler, notFoundHandler } from "../lib/error-handler";
import { requireAuth } from "@/features/auth/middleware";

function minimalApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe("requireAuth", () => {
  it("returns 401 with { error: 'Unauthorized' } when no session", async () => {
    const app = minimalApp();
    app.use("/api/protected", requireAuth, (_req: Request, res: Response) => {
      res.json({ ok: true });
    });

    const res = await request(app).get("/api/protected").expect(401);

    assert.deepEqual(res.body, { error: "Unauthorized" });
  });
});

describe("notFoundHandler", () => {
  it("returns 404 with { error: 'Not found' } for unknown routes", async () => {
    const app = minimalApp();
    app.use(notFoundHandler);

    const res = await request(app).get("/api/does-not-exist").expect(404);

    assert.deepEqual(res.body, { error: "Not found" });
  });
});

describe("errorHandler", () => {
  const app = minimalApp();

  app.get("/app-error", () => {
    throw new AppError(403, "FORBIDDEN", "You cannot do that");
  });

  app.get("/zod-error", () => {
    const result = z
      .object({ title: z.string().min(1) })
      .safeParse({ title: "" });
    if (!result.success) throw result.error;
    throw new Error("unreachable");
  });

  app.get("/generic-error", () => {
    throw new Error("database connection pool exhausted");
  });

  app.use(errorHandler);

  it("maps AppError to its status, message and code", async () => {
    const res = await request(app).get("/app-error").expect(403);

    assert.deepEqual(res.body, {
      error: "You cannot do that",
      code: "FORBIDDEN",
    });
  });

  it("maps ZodError to 400 with details", async () => {
    const res = await request(app).get("/zod-error").expect(400);

    assert.equal(res.body.error, "Validation failed");
    assert.equal(res.body.details[0].path, "title");
    assert.equal(res.body.details[0].message, "Too small: expected string to have >=1 characters");
  });

  it("masks unexpected errors as 500 without leaking internals", async () => {
    const res = await request(app).get("/generic-error").expect(500);

    assert.deepEqual(res.body, { error: "Internal server error" });
    assert.equal(res.body.stack, undefined);
  });
});
