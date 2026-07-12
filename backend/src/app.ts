import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import notesRouter from "@/features/notes/router";
import env from "@/lib/env";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";

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

// app.use("/static", express.static(path.join(process.cwd(), "public")));
// app.set("view engine", "ejs");
// app.set("views", path.join(process.cwd(), "views"));

// app.get("/", (_, res) => {
//   res.render("index");
// });

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/notes", notesRouter);

export default app;
