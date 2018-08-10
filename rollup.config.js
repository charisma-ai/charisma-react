import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const externalLibs = ["react"];

const globalLibs = {
  react: "React"
};

const name = "Charisma";

export default {
  input: "src/Charisma.tsx",
  output: [
    {
      external: externalLibs,
      file: pkg.main,
      format: "umd",
      globals: globalLibs,
      name: "Charisma",
      sourcemap: true
    },
    {
      external: externalLibs,
      file: pkg.module,
      format: "es",
      globals: globalLibs,
      name: "Charisma",
      sourcemap: true
    }
  ],
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    typescript({
      typescript: require("typescript")
    })
  ]
};
