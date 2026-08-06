import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "./http-error";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

interface UploadError {
  code?: string;
}

function isUploadError(err: unknown): err is UploadError {
  return typeof err === "object" && err !== null && "code" in err;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next,
) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, code: err.code });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Error && err.message.startsWith("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }

  if (isUploadError(err) && err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Maximum size is 10MB." });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ error: "Internal server error" });
};
