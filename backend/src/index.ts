import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { FRONTEND_URL, PORT } from "./env";
import notesRouter from "./features/notes/router";
// import path from "path";

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

app.use("/notes", notesRouter);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

// Gracefull shutdown
process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
