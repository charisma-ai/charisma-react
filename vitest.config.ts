import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{js,ts,jsx,tsx}"],
    globals: true,
    environment: "jsdom",
  },
});
