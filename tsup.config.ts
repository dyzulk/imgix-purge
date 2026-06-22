import { defineConfig } from "tsup";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const version = pkg.version;

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
  sourcemap: false,
  noExternal: [/.*/],
  define: {
    __VERSION__: JSON.stringify(version)
  }
});
