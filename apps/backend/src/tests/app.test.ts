// Test that app is up and running

import * as assert from "assert";
// import { app } from "../index";
// import request from "supertest";
import { describe, it } from "vitest";

// Test that the testing framework is working correctly
describe("testing framework", () => {
  it("should be working", () => {
    assert.ok(true);
    assert.equal(1, 1);
  });
});

// describe("app", () => {
//   it("should start server", async () => {
//     app.listen(8000);
//     assert.ok(true);
//   });
// });
//
// // Test the health check endpoint
// describe("health check", () => {
//   it("should return 200", async () => {
//     const response = await request(app)
//       .get("/health")
//       .expect("Content-Type", /json/);
//     assert.equal(response.statusCode, 200);
//   });
// });
