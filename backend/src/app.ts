import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { FRONTEND_URL } from "@/lib/env";
import notesRouter from "@/features/notes/router";
import authRouter from "@/features/auth/router";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable("etag").disable("x-powered-by");

app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);

// app.use("/static", express.static(path.join(process.cwd(), "public")));
// app.set("view engine", "ejs");
// app.set("views", path.join(process.cwd(), "views"));

// app.get("/", (_, res) => {
//   res.render("index");
// });

app.use("/auth", authRouter);
app.use("/notes", notesRouter);

export default app;
