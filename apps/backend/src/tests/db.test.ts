// Test that db is up and connect is successfull

import * as assert from "assert";
import { db } from "../db";
import { describe, it } from "vitest";

describe("db", () => {
  it("should connect to db", async () => {
    await db.execute("SELECT 1");
    assert.ok(true);
  });
});
