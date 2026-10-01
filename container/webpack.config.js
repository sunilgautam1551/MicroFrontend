const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

// On Vercel, set PRODUCTS_URL and CART_URL in the project's environment variables.
const PRODUCTS_URL = process.env.PRODUCTS_URL || 'http://localhost:8081';
const CART_URL = process.env.CART_URL || 'http://localhost:8082';

module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    clean: true,
  },
  devServer: {
    port: 8080,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        products: `products@${PRODUCTS_URL}/remoteEntry.js`,
        cart: `cart@${CART_URL}/remoteEntry.js`
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
