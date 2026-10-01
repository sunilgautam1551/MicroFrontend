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
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartShow": "./src/bootstrap",
      },
      shared: ['faker']

    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
