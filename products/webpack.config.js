const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  mode: "development",
  devServer: {
    port: 8081, // main.js running on port 8081
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "products",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductsIndex": "./src/bootstrap",
      },
      shared: ['faker']
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html", // I am not explicityly adding script tag to index.html as build can genrate files with any name so htmlwebpackplugin will help in insterting the right file.
    }),
  ],
};
