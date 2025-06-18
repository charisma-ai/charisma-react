import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,global-require
    tsconfigRaw: require("./tsconfig.json"),
  },
  test: {
    include: ["src/**/*.test.{js,ts,jsx,tsx}"],
    globals: true,
    environment: "jsdom",
  },
});
