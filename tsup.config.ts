import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "bin/imgix": "src/bin/imgix.ts"
  },
  format: ["esm"],
  platform: "node",
  target: "node22",
  shims: true,
  dts: false,
  clean: true,
  minify: true,
  sourcemap: false
});
