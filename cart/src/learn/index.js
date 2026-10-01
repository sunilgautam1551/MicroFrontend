import { createLearnPanel } from "./viewer";

// "?raw" imports the real source text of each file (see the rule in webpack.config.js),
// so the code shown on screen is always exactly the code that is running.
import packageJson from "../../package.json?raw";
import webpackConfig from "../../webpack.config.js?raw";
import indexHtml from "../../public/index.html?raw";
import indexJs from "../index.js?raw";
import bootstrapJs from "../bootstrap.js?raw";

const files = [
  {
    name: "package.json",
    about:
      "The project's manifest: dependencies and the commands that run or build the app. It's almost the same as products'. Each microfrontend is a <b>fully independent project</b> with its own <code>node_modules</code>.",
    code: packageJson,
    notes: [
      {
        match: '"name": "cart"',
        note: "The npm package name, only a label. The Module Federation name is set in <code>webpack.config.js</code>.",
      },
      {
        match: '"start"',
        note: "<code>npm start</code> runs the dev server on <code>http://localhost:8082</code> with live reload.",
      },
      {
        match: '"build"',
        note: "<p><code>npm run build</code> writes the minified production build to <code>dist/</code>.</p><p>The cart Vercel project runs this and serves <code>dist/</code>. Cart is deployed <b>separately</b> from products and the container.</p>",
      },
      {
        match: '"faker"',
        note: "Fake data generator, used for the item count. Products uses it too, so both list it as <code>shared</code>.",
      },
      {
        match: '"html-webpack-plugin"',
        note: "Generates <code>index.html</code> with the right <code>&lt;script&gt;</code> tags.",
      },
      {
        match: '"nodemon"',
        note: "Not used by any script. Safe to remove.",
      },
      {
        match: '"webpack"',
        note: "Webpack 5, which includes <b>Module Federation</b> out of the box.",
      },
      {
        match: '"webpack-cli"',
        note: "Provides the <code>webpack</code> command.",
      },
      {
        match: '"webpack-dev-server"',
        note: "Provides <code>webpack serve</code> for local development.",
      },
    ],
  },
  {
    name: "webpack.config.js",
    about:
      "Same shape as products' config. That's the point: every remote follows the same recipe. Only the <b>name</b>, the <b>port</b> and what it <b>exposes</b> differ.",
    code: webpackConfig,
    notes: [
      {
        match: "const HtmlWebpackPlugin",
        note: "Plugin that generates <code>index.html</code> and injects the hashed bundle names.",
      },
      {
        match: "const ModuleFederationPlugin",
        note: "Webpack's built-in Module Federation plugin. It lets other apps load cart's code at runtime.",
      },
      {
        match: "module.exports",
        note: "The webpack config. Defaults apply: entry <code>./src/index.js</code>, output folder <code>dist/</code>, mode from the <code>--mode</code> CLI flag.",
      },
      {
        match: "filename:",
        note: "Content-hashed bundle names (<code>main.ab12cd.js</code>) for safe long-term caching.",
      },
      {
        match: "clean: true",
        note: "Clears <code>dist/</code> before each build.",
      },
      {
        match: "port: 8082",
        note: "Cart's dev port. With <code>npm start</code> the container loads cart from <code>http://localhost:8082</code>; its production build uses <code>https://mfe-shopcart.vercel.app</code>.",
      },
      {
        match: "resourceQuery: /raw/",
        note: "Lets the learning panel import source files as text (<code>?raw</code>). Not needed by a normal microfrontend.",
      },
      {
        match: "new ModuleFederationPlugin",
        note: "Makes cart a <b>remote</b>.",
      },
      {
        match: 'name: "cart"',
        note: "<p>The remote's name. The container's config says <code>cart: `cart@${CART_URL}/remoteEntry.js`</code>. The <code>cart@</code> part must equal this name.</p>",
      },
      {
        match: 'filename: "remoteEntry.js"',
        note: "<p>The manifest the container downloads first: <code>https://mfe-shopcart.vercel.app/remoteEntry.js</code> in production.</p><p>Because its name never changes, you can <b>redeploy cart alone</b> and the container picks up the new version on the next page load, without being rebuilt.</p>",
      },
      {
        match: "exposes:",
        note: "Cart's public API: the modules other apps may import.",
      },
      {
        match: '"./CartShow"',
        note: "The container imports <code>cart/CartShow</code> and gets <code>./src/bootstrap.js</code>, which exports <code>mount</code>.",
      },
      {
        match: '"./CartLearn"',
        note: "Exposes this learning panel so the container can show cart's walkthrough as well.",
      },
      {
        match: "shared:",
        note: "<p>Share <code>faker</code> with the other apps on the page. On the container page, products and cart negotiate and <b>one</b> faker copy is loaded.</p><p>Cart still bundles its own copy as a fallback for when it runs alone.</p>",
      },
      {
        match: "new HtmlWebpackPlugin",
        note: "Generates the standalone page. The container never uses it.",
      },
      {
        match: "template:",
        note: "Starts from <code>public/index.html</code> and adds the <code>&lt;script&gt;</code> tags.",
      },
    ],
  },
  {
    name: "public/index.html",
    about:
      "Cart's own page, shown only when it runs <b>on its own</b> (localhost:8082 or the cart Vercel URL).",
    code: indexHtml,
    notes: [
      {
        match: "<title>",
        note: "Browser tab title in standalone mode.",
      },
      {
        match: "<style>",
        note: "Standalone page styles only. The cart box's own CSS lives in <code>bootstrap.js</code>.",
      },
      {
        match: "<body>",
        note: "No <code>&lt;script&gt;</code> here. <code>HtmlWebpackPlugin</code> adds it at build time.",
      },
      {
        match: 'id="cart-dev"',
        note: "<p>The mount point that <code>bootstrap.js</code> looks for.</p><p>It only exists on cart's own page, so finding it means <b>\"I'm running on my own\"</b>.</p>",
      },
      {
        match: 'id="cart-dev-learn"',
        note: "Where this learning panel appears in standalone mode.",
      },
    ],
  },
  {
    name: "src/index.js",
    about: "The entry point. It only loads the real code asynchronously.",
    code: indexJs,
    notes: [
      {
        match: "import ('./bootstrap.js')",
        note: "<p><b>The async boundary (bootstrap pattern).</b> Loading <code>bootstrap.js</code> with <code>import()</code> gives Module Federation time to set up the shared <code>faker</code> before any code uses it.</p><p>Without it you'd get <i>\"Shared module is not available for eager consumption\"</i>.</p>",
      },
      {
        match: "import ('./learn')",
        note: "Loads this learning panel (into <code>#cart-dev-learn</code> when standalone).",
      },
    ],
  },
  {
    name: "src/bootstrap.js",
    about:
      "The cart app itself. Like products, it exposes one function, <code>mount(el)</code>, and works in two situations: on its own, or inside the container.",
    code: bootstrapJs,
    notes: [
      {
        match: 'import faker from "faker"',
        note: "Resolved through the <b>shared scope</b>, so on the container page this may be the same faker instance products uses.",
      },
      {
        match: "const styles",
        note: "The cart box's CSS. All classes start with <code>mfe-cart</code> to avoid clashing with other apps.",
      },
      {
        match: "const injectStyles",
        note: "Adds the CSS once as a <code>&lt;style&gt;</code> tag (the <code>id</code> check prevents duplicates).",
      },
      {
        match: "const mount",
        note: "<p><b>The contract:</b> give cart an element and it renders itself inside it.</p><p>The container and cart only agree on this one function.</p>",
      },
      {
        match: "el.innerHTML",
        note: "Renders the cart box into the element it was given.",
      },
      {
        match: "faker.random.number()",
        note: "A random item count. A real cart would fetch this from an API.",
      },
      {
        match: 'document.querySelector("#cart-dev")',
        note: "<b>Situation 1: running on its own.</b> Look for the element that exists only on cart's own page.",
      },
      {
        match: "if (el)",
        note: "Found means standalone, so mount immediately. Inside the container it's not found, so cart waits for the container to call <code>mount</code>.",
      },
      {
        match: "export { mount }",
        note: "<b>Situation 2: inside the container.</b> This export is what <code>\"./CartShow\"</code> exposes.",
      },
    ],
  },
];

const mount = (el) => {
  createLearnPanel(el, {
    ns: "mfe-cart-learn",
    theme: { accent: "#059669", soft: "#ecfdf5", bright: "#34d399" },
    badge: "Cart MFE · remote",
    title: "How the Cart app works",
    subtitle: "A second remote: same recipe as products, its own port (8082) and its own deployment.",
    intro: `
      <p><b>Cart is a remote, just like products.</b> Comparing the two shows the pattern: every remote has the same <code>webpack.config.js</code> shape and the same <code>mount(el)</code> contract.</p>
      <p>The two remotes never import each other. Only the container knows about both.</p>`,
    files,
  });
};

// Standalone: cart's own index.html has this element; the container does not.
const el = document.querySelector("#cart-dev-learn");
if (el) {
  mount(el);
}

export { mount };
