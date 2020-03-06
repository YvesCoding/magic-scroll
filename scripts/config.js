// rollup.config.js
const resolveNode = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const typescript = require("rollup-plugin-typescript");
const ts = require("typescript");
const replace = require("rollup-plugin-replace");
const path = require("path");
const postcss = require("rollup-plugin-postcss");
const fs = require("fs");

function getPkgInfo(dirOfPackageJson) {
  const json = require(dirOfPackageJson);
  return {
    banner: `/**
 * ${json.name} v${json.version}
 * (c) 2018-${new Date().getFullYear()} WangYi7099
 * Released under the MIT License
 */
`,
    version: json.version,
    name: json.name
  };
}

const resolve = p => {
  return path.resolve("./src", p);
};

const builds = {
  "magic-scroll-native-umd": {
    entry: resolve("native/index.tsx"),
    dest: resolve("../dist/magic-scroll.js"),
    format: "umd",
    external: ["react", "react-dom", "prop-types"]
  }
  // 'magic-scroll-native-umd-min': {
  //   entry: resolve(root + '/index.tsx'),
  //   dest: resolve('dist/ReactSuperScroll.min.js'),
  //   format: 'umd',
  //   external: ['react', 'react-dom', 'prop-types'],
  //   banner
  // }
};

function genConfig(name) {
  const opts = builds[name];
  const pkgInfo = getPkgInfo(resolve(`../package.json`));

  const config = {
    input: opts.entry,
    external: opts.external,
    output: {
      exports: "named",
      globals: {
        react: "react",
        "react-dom": "ReactDOM",
        "prop-types": "PropTypes"
      },
      file: opts.dest,
      format: opts.format,
      banner: pkgInfo.banner,
      name: opts.moduleName || pkgInfo.name
    },
    plugins: [
      resolveNode(),
      typescript({
        typescript: ts
      }),
      postcss({
        extract: true,
        modules: true
      }),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      }),
      replace({
        "process.env.NODE_FORMAT": JSON.stringify(opts.format),
        __version__: pkgInfo.version
      })
    ]
  };

  return config;
}

exports.getBuild = genConfig;
exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
