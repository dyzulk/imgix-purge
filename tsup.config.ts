import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  shims: true,
  dts: false,
  clean: true,
  minify: true,
  sourcemap: false
});
