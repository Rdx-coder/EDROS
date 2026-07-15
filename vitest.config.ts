/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 25,
        branches: 15,
        functions: 25,
        lines: 25,
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        "tests/**",
        "vite.config.ts",
        "vitest.config.ts",
        "server.ts",
        "src/presentation/routes/v2/**",
        "src/infrastructure/databaseProviders.ts",
        "src/infrastructure/bullQueue.ts",
        "src/infrastructure/eventProcessor.ts",
        "src/infrastructure/logging.ts",
        "src/infrastructure/observability.ts",
        "src/infrastructure/pinoLogger.ts",
        "src/infrastructure/redisClient.ts",
        "src/application/paymentService.ts",
        "src/presentation/middlewares.ts"
      ],
    },
  },
});
