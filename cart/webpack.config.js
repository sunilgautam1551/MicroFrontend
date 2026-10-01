const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require(
  "webpack/lib/container/ModuleFederationPlugin",
);

module.exports = {
  output: {
    filename: "[name].[contenthash].js",
    clean: true,
  },
  devServer: {
    port: 8082,
  },
  module: {
    rules: [
      // `import text from "./file?raw"` gives the file's source as a string (used by the learning panel).
      { resourceQuery: /raw/, type: "asset/source" },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartShow": "./src/bootstrap",
        "./CartLearn": "./src/learn",
      },
      shared: ['faker']

    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
