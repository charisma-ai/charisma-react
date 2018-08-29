import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const externalLibs = ["react", "react-dom"];
const globalLibs = {
  react: "React",
  "react-dom": "ReactDOM"
};

const name = "Charisma";

export default {
  input: "src/Charisma.tsx",
  external: externalLibs,
  output: [
    {
      exports: "named",
      file: pkg.main,
      format: "umd",
      globals: globalLibs,
      name,
      sourcemap: true
    },
    {
      exports: "named",
      file: pkg.module,
      format: "es",
      name,
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      typescript: require("typescript")
    })
  ]
};
