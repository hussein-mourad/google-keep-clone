import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/postgres",
      FRONTEND_URL: "http://localhost:3000",
      BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production",
      BETTER_AUTH_URL: "http://localhost:8000",
      PORT: "8000",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/*.d.ts", "src/tests/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ["./src/tests/setup.ts"],
  },
});
