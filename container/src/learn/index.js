import { createLearnPanel } from "./viewer";

// These two imports are Module Federation in action: each remote ships its own
// learning panel, and the container loads it at runtime just like the product and cart boxes.
import { mount as productsLearnMount } from "products/ProductsLearn";
import { mount as cartLearnMount } from "cart/CartLearn";

// "?raw" imports the real source text of each file (see the rule in webpack.config.js).
import packageJson from "../../package.json?raw";
import webpackConfig from "../../webpack.config.js?raw";
import indexHtml from "../../public/index.html?raw";
import indexJs from "../index.js?raw";
import bootstrapJs from "../bootstrap.js?raw";

const files = [
  {
    name: "package.json",
    about:
      "The container's manifest. Notice what's <b>missing</b>: no <code>faker</code>. The container doesn't render products or cart itself, so it doesn't need their libraries.",
    code: packageJson,
    notes: [
      {
        match: '"name": "container"',
        note: "The npm package name. The container is a normal webpack project, like the remotes.",
      },
      {
        match: '"start"',
        note: "<p><code>npm start</code> runs the dev server on <code>http://localhost:8080</code>.</p><p>Products (8081) and cart (8082) must be running too, because the container loads them from those URLs.</p>",
      },
      {
        match: '"build"',
        note: "<p>Production build into <code>dist/</code>, run by the container's Vercel project (<code>https://mfe-ecom.vercel.app</code>).</p><p>In this mode the remotes' <b>Vercel URLs are baked in at build time</b> (see <code>webpack.config.js</code>).</p>",
      },
      {
        match: '"html-webpack-plugin"',
        note: "Generates the container's <code>index.html</code>, the page you are looking at.",
      },
      {
        match: '"nodemon"',
        note: "Not used by any script. Safe to remove.",
      },
      {
        match: '"webpack"',
        note: "Webpack 5 with built-in Module Federation. The host and the remotes all use the same plugin, just configured differently.",
      },
      {
        match: '"webpack-cli"',
        note: "Provides the <code>webpack</code> command.",
      },
      {
        match: '"webpack-dev-server"',
        note: "Provides <code>webpack serve</code>.",
      },
    ],
  },
  {
    name: "webpack.config.js",
    about:
      "The host's config. Where the remotes have <code>exposes</code> (\"here's what I offer\"), the container has <code>remotes</code> (\"here's where to find what I need\").",
    code: webpackConfig,
    notes: [
      {
        match: "const HtmlWebpackPlugin",
        note: "Plugin that generates <code>index.html</code> with the correct script tags.",
      },
      {
        match: "const ModuleFederationPlugin",
        note: "The same plugin the remotes use. Here it's configured as a <b>host</b>, an app that <i>consumes</i> other apps' modules.",
      },
      {
        match: "const REMOTE_URLS",
        note: "<p>The address book: where each remote lives. Each app is its own Vercel project with its own URL, so the container needs two sets of addresses.</p>",
      },
      {
        match: "production: {",
        note: "<p>The deployed remotes, used by <code>npm run build</code> (which is what Vercel runs):</p><p>products → <code>https://mfe-products-list.vercel.app</code><br>cart → <code>https://mfe-shopcart.vercel.app</code></p>",
      },
      {
        match: "development: {",
        note: "The local dev servers, used by <code>npm start</code>. Run products (8081) and cart (8082) locally and the container loads them from your machine.",
      },
      {
        match: "module.exports",
        note: "<p>This time the config is a <b>function</b>, not a plain object. Webpack calls it with the CLI arguments, so <code>argv.mode</code> tells us whether this is <code>--mode production</code> or <code>--mode development</code>.</p><p>Entry still defaults to <code>./src/index.js</code> and output to <code>dist/</code>.</p>",
      },
      {
        match: "const urls",
        note: "Picks the production or development address book based on the mode.",
      },
      {
        match: "const PRODUCTS_URL",
        note: "<p>The products URL, decided <b>when webpack runs</b> (build time), not in the browser.</p><p>A <code>PRODUCTS_URL</code> environment variable overrides it, which is handy to point the container at a Vercel <i>preview</i> deployment of products.</p>",
      },
      {
        match: "const CART_URL",
        note: "Same for cart, with a <code>CART_URL</code> override.",
      },
      {
        match: "return {",
        note: "The actual webpack config object, built with the URLs chosen above.",
      },
      {
        match: "filename:",
        note: "Content-hashed bundle names for long-term caching.",
      },
      {
        match: "clean: true",
        note: "Clears <code>dist/</code> before each build.",
      },
      {
        match: "port: 8080",
        note: "The container's dev port. Open <code>http://localhost:8080</code> to see the composed app.",
      },
      {
        match: "resourceQuery: /raw/",
        note: "Lets the learning panel import source files as text. Not needed for the microfrontend itself.",
      },
      {
        match: "new ModuleFederationPlugin",
        note: "Module Federation, host side.",
      },
      {
        match: "name: 'container'",
        note: "<p>The host's name.</p><p>There's no <code>filename</code> and no <code>exposes</code>: nobody loads code <i>from</i> the container, so it has no <code>remoteEntry.js</code>.</p>",
      },
      {
        match: "remotes:",
        note: "<p>The list of remotes the container may import from. Format: <code>importPrefix: \"remoteName@url/remoteEntry.js\"</code>.</p>",
      },
      {
        match: "products: `products@",
        note: "<p>The key <code>products</code> becomes the <b>import prefix</b> in code: <code>import ... from \"products/ProductsIndex\"</code>.</p><p><code>products@</code> must equal <code>name: \"products\"</code> in products' config. The URL after it is where <code>remoteEntry.js</code> is downloaded from <b>in the browser, at runtime</b>.</p>",
      },
      {
        match: "cart: `cart@",
        note: "Same for cart: <code>import ... from \"cart/CartShow\"</code> loads from <code>${CART_URL}/remoteEntry.js</code>.",
      },
      {
        match: "new HtmlWebpackPlugin",
        note: "Generates the page you see.",
      },
      {
        match: "template:",
        note: "Starts from <code>public/index.html</code> and adds the script tags.",
      },
    ],
  },
  {
    name: "public/index.html",
    about:
      "The page shell. The container owns the <b>layout</b>: the header, the grid, and empty slots where the remotes will render themselves.",
    code: indexHtml,
    notes: [
      {
        match: "<title>",
        note: "The browser tab title. The container owns the page, so it owns the title.",
      },
      {
        match: "<style>",
        note: "Page-level styles only: background, header and grid. The product and cart boxes bring their own styles.",
      },
      {
        match: ".container-layout {",
        note: "The grid that holds the two remotes side by side.",
      },
      {
        match: "grid-template-columns: 2fr 1fr",
        note: "Products gets two-thirds of the width and cart one-third. Changing the layout only touches the container; the remotes don't change.",
      },
      {
        match: "@media",
        note: "On narrow screens the two boxes stack into one column.",
      },
      {
        match: ".container-learn {",
        note: "Layout for the learning section you're reading now.",
      },
      {
        match: "<header",
        note: "The header belongs to the container, not to either remote.",
      },
      {
        match: 'id="my-products"',
        note: "<p>An empty <b>slot</b>. <code>bootstrap.js</code> passes this element to products' <code>mount</code>.</p><p>The container decides <b>where</b> products appears; products decides <b>what</b> it looks like.</p>",
      },
      {
        match: 'id="my-cart"',
        note: "The slot for cart.",
      },
      {
        match: 'id="learn"',
        note: "Where <code>src/learn</code> renders the overview and the three walkthroughs.",
      },
    ],
  },
  {
    name: "src/index.js",
    about: "The entry point, the same async-boundary pattern as the remotes.",
    code: indexJs,
    notes: [
      {
        match: "import('./bootstrap')",
        note: "<p><b>The async boundary.</b> <code>bootstrap.js</code> imports from <code>products/…</code> and <code>cart/…</code>, which live on other servers.</p><p>Loading it with <code>import()</code> lets webpack first download each remote's <code>remoteEntry.js</code> and set up shared modules, and only then run the code that needs them.</p>",
      },
      {
        match: "import('./learn')",
        note: "Loads this learning section. It imports <code>products/ProductsLearn</code> and <code>cart/CartLearn</code> from the remotes too.",
      },
    ],
  },
  {
    name: "src/bootstrap.js",
    about:
      "Only six lines: import each remote's <code>mount</code> and call it with a slot. That's all a host needs to do.",
    code: bootstrapJs,
    notes: [
      {
        match: 'from "products/ProductsIndex"',
        note: "<p>Looks like a normal import, but <code>products/</code> matches a key in <code>remotes</code>. At runtime webpack:</p><p>1. downloads <code>${PRODUCTS_URL}/remoteEntry.js</code>,<br>2. asks it for <code>./ProductsIndex</code>,<br>3. downloads that chunk (products' <code>src/bootstrap.js</code>).</p><p><code>mount as productsMount</code> renames it so it doesn't clash with cart's <code>mount</code>.</p>",
      },
      {
        match: 'from "cart/CartShow"',
        note: "Same for cart: fetched from <code>${CART_URL}/remoteEntry.js</code>, renamed to <code>cartMount</code>.",
      },
      {
        match: "console.log",
        note: "Runs only after both remotes have loaded. Open DevTools → Console to see it.",
      },
      {
        match: "productsMount(",
        note: "<p>Hands the <code>#my-products</code> slot to products. Products renders its box inside it.</p><p>Open DevTools → Network and reload: you'll see <code>remoteEntry.js</code> requested from products' URL.</p>",
      },
      {
        match: "cartMount(",
        note: "Hands the <code>#my-cart</code> slot to cart.",
      },
    ],
  },
];

const overviewStyles = `
  .learn-ov {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-top: 4px solid #d97706;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    padding: 20px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1f2937;
    line-height: 1.6;
  }
  .learn-ov *, .learn-ov *::before { box-sizing: border-box; }
  .learn-ov code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
    overflow-wrap: anywhere;
  }
  .learn-ov__badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #d97706;
    background: #fffbeb;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .learn-ov h2 { margin: 10px 0 4px; font-size: 22px; }
  .learn-ov h3 { margin: 28px 0 12px; font-size: 16px; }
  .learn-ov__sub { margin: 0; color: #6b7280; font-size: 14px; }

  .learn-ov__diagram { margin-top: 20px; display: grid; gap: 8px; }
  .learn-ov__node {
    border: 1px solid #e5e7eb;
    border-top: 4px solid var(--node);
    border-radius: 10px;
    padding: 12px 14px;
    background: #ffffff;
    font-size: 13px;
  }
  .learn-ov__node--host { max-width: 420px; width: 100%; justify-self: center; }
  .learn-ov__node h4 { margin: 0; font-size: 15px; display: flex; gap: 8px; align-items: center; }
  .learn-ov__node p { margin: 6px 0 0; color: #4b5563; }
  .learn-ov__tag {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 999px;
    color: var(--node);
    background: var(--node-soft);
  }
  .learn-ov__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .learn-ov__arrow { text-align: center; font-size: 12.5px; color: #6b7280; }
  .learn-ov__arrow b { display: block; font-size: 18px; line-height: 1.2; color: #9ca3af; }
  @media (max-width: 560px) {
    .learn-ov__row { grid-template-columns: 1fr; }
    .learn-ov__arrow + .learn-ov__arrow { display: none; }
  }

  .learn-ov__steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; counter-reset: step; }
  .learn-ov__steps li {
    position: relative;
    padding: 10px 12px 10px 46px;
    background: #f9fafb;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    font-size: 14px;
    counter-increment: step;
  }
  .learn-ov__steps li::before {
    content: counter(step);
    position: absolute;
    left: 12px;
    top: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #d97706;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }

  .learn-ov__live {
    margin-top: 12px;
    padding: 12px 14px;
    border: 1px dashed #d97706;
    border-radius: 8px;
    background: #fffbeb;
    font-size: 13.5px;
  }
  .learn-ov__live ul { margin: 6px 0 0; padding-left: 18px; }
  .learn-ov a { color: #b45309; }

  .learn-ov__terms { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; margin: 0; }
  .learn-ov__term { padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; }
  .learn-ov__term dt { font-weight: 600; font-size: 14px; }
  .learn-ov__term dd { margin: 4px 0 0; font-size: 13.5px; color: #4b5563; }

  .learn-ov__try { margin: 0; padding-left: 18px; font-size: 14px; }
  .learn-ov__try li { margin-bottom: 6px; }
`;

const node = ({ color, soft, tag, name, text, url, port, extra }) => `
  <div class="learn-ov__node${tag === "Host" ? " learn-ov__node--host" : ""}" style="--node: ${color}; --node-soft: ${soft}">
    <h4>${name} <span class="learn-ov__tag">${tag}</span></h4>
    <p>${text}</p>
    <p>Live: <a href="${url}" target="_blank" rel="noopener"><code>${url.replace("https://", "")}</code></a><br>Dev server: <code>localhost:${port}</code><br>${extra}</p>
  </div>`;

// The remotes' remoteEntry.js URLs this page actually downloaded (taken from the browser's resource timing).
const loadedRemoteEntries = () =>
  performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((url) => url.includes("remoteEntry.js"));

const renderOverview = (el) => {
  if (!document.getElementById("learn-ov-styles")) {
    const style = document.createElement("style");
    style.id = "learn-ov-styles";
    style.textContent = overviewStyles;
    document.head.appendChild(style);
  }

  const urls = loadedRemoteEntries();

  el.innerHTML = `
    <section class="learn-ov">
      <span class="learn-ov__badge">Start here</span>
      <h2>How this page is built</h2>
      <p class="learn-ov__sub">The page above is made of <b>three separately built and deployed apps</b>. Below, each app explains its own source code line by line.</p>

      <div class="learn-ov__diagram">
        ${node({
          color: "#d97706",
          soft: "#fffbeb",
          tag: "Host",
          name: "Container",
          text: "Owns the page: header, layout and empty slots. Decides <b>where</b> each app appears.",
          url: "https://mfe-ecom.vercel.app",
          port: 8080,
          extra: "Config: <code>remotes</code>",
        })}
        <div class="learn-ov__row">
          <div class="learn-ov__arrow"><b>↓</b>downloads <code>remoteEntry.js</code></div>
          <div class="learn-ov__arrow"><b>↓</b>downloads <code>remoteEntry.js</code></div>
        </div>
        <div class="learn-ov__row">
          ${node({
            color: "#4f46e5",
            soft: "#eef2ff",
            tag: "Remote",
            name: "Products",
            text: "Renders the product list. Also runs on its own.",
            url: "https://mfe-products-list.vercel.app",
          port: 8081,
            extra: "Exposes: <code>./ProductsIndex</code>, <code>./ProductsLearn</code>",
          })}
          ${node({
            color: "#059669",
            soft: "#ecfdf5",
            tag: "Remote",
            name: "Cart",
            text: "Renders the cart summary. Also runs on its own.",
            url: "https://mfe-shopcart.vercel.app",
          port: 8082,
            extra: "Exposes: <code>./CartShow</code>, <code>./CartLearn</code>",
          })}
        </div>
      </div>

      <div class="learn-ov__live">
        <b>Live:</b> the remote files this page actually loaded
        ${
          urls.length
            ? `<ul>${urls.map((url) => `<li><code>${url}</code></li>`).join("")}</ul>`
            : "<p>Your browser didn't report them. Open DevTools → Network and search for <code>remoteEntry.js</code>.</p>"
        }
      </div>

      <h3>What happens when you open this page</h3>
      <ol class="learn-ov__steps">
        <li>The browser downloads the container's <code>index.html</code> and <code>main.[hash].js</code>.</li>
        <li><code>src/index.js</code> runs <code>import('./bootstrap')</code>, an <b>async boundary</b> that gives webpack time to fetch the remotes first.</li>
        <li><code>bootstrap.js</code> needs <code>products/…</code> and <code>cart/…</code>, so webpack downloads each remote's <code>remoteEntry.js</code> from the URLs in <code>remotes</code>.</li>
        <li><b>Shared scope:</b> products and cart both declare <code>faker</code> as shared. Webpack picks one compatible copy and both use it, so it's downloaded once.</li>
        <li>The exposed modules (<code>./ProductsIndex</code>, <code>./CartShow</code>) are downloaded as normal JS chunks from each remote's server.</li>
        <li><code>bootstrap.js</code> calls <code>productsMount(#my-products)</code> and <code>cartMount(#my-cart)</code>, and the boxes appear.</li>
      </ol>

      <h3>Key terms</h3>
      <dl class="learn-ov__terms">
        <div class="learn-ov__term"><dt>Microfrontend (MFE)</dt><dd>A piece of UI built, tested and deployed as its own app, then combined with others in the browser.</dd></div>
        <div class="learn-ov__term"><dt>Host (container)</dt><dd>The app that loads other apps and decides the page layout. Configured with <code>remotes</code>.</dd></div>
        <div class="learn-ov__term"><dt>Remote</dt><dd>An app that offers modules to hosts (products, cart). Configured with <code>name</code>, <code>filename</code> and <code>exposes</code>.</dd></div>
        <div class="learn-ov__term"><dt>remoteEntry.js</dt><dd>A remote's small manifest file. It tells the host what's exposed and how to load each piece.</dd></div>
        <div class="learn-ov__term"><dt>exposes</dt><dd>A remote's public API: public name → real file, e.g. <code>"./CartShow": "./src/bootstrap"</code>.</dd></div>
        <div class="learn-ov__term"><dt>shared</dt><dd>Libraries apps agree to share at runtime so they're loaded once (here: <code>faker</code>).</dd></div>
        <div class="learn-ov__term"><dt>Async boundary</dt><dd><code>index.js</code> only does <code>import('./bootstrap')</code>, giving Module Federation time to load remotes and shared modules first.</dd></div>
        <div class="learn-ov__term"><dt>mount(el)</dt><dd>The contract between host and remote: "here's an element, render yourself in it." It works with any framework.</dd></div>
        <div class="learn-ov__term"><dt>Isolation (standalone) mode</dt><dd>A remote checks for its own dev element (<code>#dev-products</code>, <code>#cart-dev</code>). Found means it's on its own page and mounts itself.</dd></div>
        <div class="learn-ov__term"><dt>Independent deployment</dt><dd>Each app is its own Vercel project. Redeploy cart and the container picks it up on the next page load, without a rebuild.</dd></div>
      </dl>

      <h3>Try it yourself</h3>
      <ol class="learn-ov__try">
        <li>Run <code>npm start</code> in <code>products</code>, <code>cart</code> and <code>container</code>, then open <code>localhost:8080</code>.</li>
        <li>Open <a href="https://mfe-products-list.vercel.app" target="_blank" rel="noopener">mfe-products-list.vercel.app</a> or <a href="https://mfe-shopcart.vercel.app" target="_blank" rel="noopener">mfe-shopcart.vercel.app</a> (or <code>localhost:8081</code> / <code>localhost:8082</code>) to see a remote running on its own.</li>
        <li>Stop the cart dev server and reload <code>localhost:8080</code>. The whole page fails, because <code>bootstrap.js</code> statically imports both remotes. Real apps add error handling around remote loading.</li>
        <li>Change a product's markup in <code>products/src/bootstrap.js</code>. The container shows it without being touched.</li>
      </ol>
    </section>`;
};

const mount = (el) => {
  el.innerHTML = `
    <div id="learn-overview"></div>
    <div id="learn-container"></div>
    <div id="learn-products"></div>
    <div id="learn-cart"></div>`;

  renderOverview(el.querySelector("#learn-overview"));

  createLearnPanel(el.querySelector("#learn-container"), {
    ns: "container-learn-panel",
    theme: { accent: "#d97706", soft: "#fffbeb", bright: "#fbbf24" },
    badge: "Container · host",
    title: "How the Container works",
    subtitle: "The host: it owns the page and loads products and cart at runtime.",
    intro: `
      <p><b>The container renders nothing itself.</b> Its job is to know <i>where</i> the remotes live (<code>remotes</code> in the webpack config) and <i>where</i> they go on the page (the slots in <code>index.html</code>).</p>
      <p>Start with <code>webpack.config.js</code>, then <code>src/bootstrap.js</code>. That's where the remotes are imported and mounted.</p>`,
    files,
  });

  // These two panels come from the remotes' own deployments, not from the container.
  productsLearnMount(el.querySelector("#learn-products"));
  cartLearnMount(el.querySelector("#learn-cart"));
};

mount(document.querySelector("#learn"));
