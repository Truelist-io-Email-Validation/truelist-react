import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      zod: "src/zod.ts",
      "react-hook-form": "src/react-hook-form.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "zod", "react-hook-form"],
    treeshake: true,
    splitting: true,
  },
]);
