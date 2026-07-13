import "dotenv/config";
import app from "@/app";
import env from "@/lib/env";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

// Gracefull shutdown
process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
