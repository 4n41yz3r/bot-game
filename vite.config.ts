import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/game/**/*.test.ts", "tests/tooling/**/*.test.ts"]
  }
});
