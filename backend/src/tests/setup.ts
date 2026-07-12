import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
// import { db, pool } from "../db/index.js";
// import { sql } from "drizzle-orm";

// Mock environment
// process.env.NODE_ENV = "test";
// process.env.DATABASE_URL =
//   process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5432/test";

beforeAll(async () => {
  // Setup test database
  // await db.connect();
});

afterAll(async () => {
  // await pool.end();
});

beforeEach(async () => {
  // Clean all tables before each test
  // const tables = ["users", "posts"];
  // for (const table of tables) {
  //   await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
  // }
});
