const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

// Where each remote is deployed. `npm run build` (production) uses the Vercel URLs,
// `npm start` (development) uses the local dev servers.
const REMOTE_URLS = {
  production: {
    products: 'https://mfe-products-list.vercel.app',
    cart: 'https://mfe-shopcart.vercel.app',
  },
  development: {
    products: 'http://localhost:8081',
    cart: 'http://localhost:8082',
  },
};

module.exports = (_env, argv) => {
  const urls = REMOTE_URLS[argv.mode === 'production' ? 'production' : 'development'];
  // PRODUCTS_URL / CART_URL environment variables still win, e.g. to point at a preview deployment.
  const PRODUCTS_URL = process.env.PRODUCTS_URL || urls.products;
  const CART_URL = process.env.CART_URL || urls.cart;

  return {
    output: {
      filename: '[name].[contenthash].js',
      clean: true,
    },
    devServer: {
      port: 8080,
    },
    module: {
      rules: [
        // `import text from "./file?raw"` gives the file's source as a string (used by the learning panel).
        { resourceQuery: /raw/, type: 'asset/source' },
      ],
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
};
