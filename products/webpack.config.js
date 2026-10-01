const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  output: {
    filename: "[name].[contenthash].js",
    clean: true,
  },
  devServer: {
    port: 8081, // main.js running on port 8081
  },
  module: {
    rules: [
      // `import text from "./file?raw"` gives the file's source as a string (used by the learning panel).
      { resourceQuery: /raw/, type: "asset/source" },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "products",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductsIndex": "./src/bootstrap",
        "./ProductsLearn": "./src/learn",
      },
      shared: ['faker']
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html", // I am not explicityly adding script tag to index.html as build can genrate files with any name so htmlwebpackplugin will help in insterting the right file.
    }),
  ],
};
