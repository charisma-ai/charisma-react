import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import minify from "rollup-plugin-babel-minify";

import pkg from "./package.json";

const input = "./compiled/Charisma.js";

const externalLibs = ["react", "react-dom"];
const globalLibs = {
  react: "React",
  "react-dom": "ReactDOM"
};

export default [
  {
    input,
    external: externalLibs,
    output: {
      exports: "named",
      file: "dist/umd/index.js",
      format: "umd",
      globals: globalLibs,
      name: "Charisma",
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs({
        include: /node_modules/
      }),
      minify({
        comments: false
      })
    ]
  },
  {
    input,
    external: externalLibs.concat(Object.keys(pkg.dependencies)),
    output: [
      {
        exports: "named",
        file: pkg.module,
        format: "es",
        sourcemap: true
      },
      {
        exports: "named",
        file: pkg.main,
        format: "cjs",
        sourcemap: true
      }
    ],
    plugins: [resolve()]
  }
];
