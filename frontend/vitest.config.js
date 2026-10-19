import { defineConfig } from "vitest/config";

// Pure units run in a node environment. Add jsdom + @testing-library/react
// here the first time a component is tested.
export default defineConfig({
  test: {
    environment: "node",
  },
});
