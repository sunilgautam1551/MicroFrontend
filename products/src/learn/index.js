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
      "The project's manifest: which libraries it needs and which commands start or build it. Read this first: it tells you how the app is run.",
    code: packageJson,
    notes: [
      {
        match: '"name": "products"',
        note: "<p>The npm package name. This is only a label for npm.</p><p>The name other apps use to find this microfrontend is set separately, in <code>webpack.config.js</code> (<code>name: \"products\"</code>).</p>",
      },
      {
        match: '"start"',
        note: "<p><code>npm start</code> runs <code>webpack serve</code>, the <b>dev server</b>. It builds the app in memory, serves it on <code>http://localhost:8081</code> and reloads when you save a file.</p><p><code>--mode development</code> gives readable output and sets <code>process.env.NODE_ENV</code> to <code>\"development\"</code>.</p>",
      },
      {
        match: '"build"',
        note: "<p><code>npm run build</code> makes the <b>production</b> build: minified files written to <code>dist/</code>.</p><p>Vercel runs this command. That is why the Vercel project uses Build Command <code>npm run build</code> and Output Directory <code>dist</code>.</p>",
      },
      {
        match: '"faker"',
        note: "<p>A library that generates fake data (product names, prices). It is the app's only runtime dependency.</p><p>It is also listed under <code>shared</code> in the webpack config, so when products and cart are on the same page they can use one copy instead of two.</p>",
      },
      {
        match: '"html-webpack-plugin"',
        note: "Generates the final <code>index.html</code> and adds the <code>&lt;script&gt;</code> tags for the bundles automatically.",
      },
      {
        match: '"nodemon"',
        note: "Restarts Node scripts when files change. <b>No script here uses it</b>, so it is safe to remove.",
      },
      {
        match: '"webpack"',
        note: "<p>The bundler. It turns <code>src/</code> into files the browser can load.</p><p><b>Module Federation is built into webpack 5</b>, so no extra package is needed for microfrontends.</p>",
      },
      {
        match: '"webpack-cli"',
        note: "Provides the <code>webpack</code> command used by the <code>start</code> and <code>build</code> scripts.",
      },
      {
        match: '"webpack-dev-server"',
        note: "Provides <code>webpack serve</code>, the local development server on port 8081.",
      },
    ],
  },
  {
    name: "webpack.config.js",
    about:
      "<b>The most important file for microfrontends.</b> It tells webpack how to build the app and, through <code>ModuleFederationPlugin</code>, which parts of this app other apps are allowed to load at runtime.",
    code: webpackConfig,
    notes: [
      {
        match: "const HtmlWebpackPlugin",
        note: "Loads the plugin that creates <code>index.html</code> for us and injects the right <code>&lt;script&gt;</code> tags (file names change on every build, so we can't hard-code them).",
      },
      {
        match: "const ModuleFederationPlugin",
        note: "<p>The heart of the microfrontend setup, and part of webpack itself.</p><p>It lets this build <b>expose</b> modules that other, separately deployed apps can import <b>at runtime</b>, over the network.</p>",
      },
      {
        match: "module.exports",
        note: "<p>Webpack reads this object.</p><p>There is no <code>entry</code>, so webpack uses its default: <code>./src/index.js</code>. There is no <code>output.path</code>, so files go to <code>dist/</code>. <code>mode</code> comes from the <code>--mode</code> flag in <code>package.json</code>.</p>",
      },
      {
        match: "filename:",
        note: "<p>Bundle names include a hash of their content, e.g. <code>main.3f9a1c.js</code>. When the code changes, the name changes too, so browsers can cache files forever without ever serving stale code.</p><p><code>remoteEntry.js</code> is the exception: it keeps a fixed name (set below) because the container must know its URL.</p>",
      },
      {
        match: "clean: true",
        note: "Empties <code>dist/</code> before every build, so old hashed files don't pile up.",
      },
      {
        match: "port: 8081",
        note: "<p>The dev server port. Each app gets its own: container 8080, <b>products 8081</b>, cart 8082.</p><p>In development the container loads products from <code>http://localhost:8081/remoteEntry.js</code>; in production from <code>https://mfe-products-list.vercel.app/remoteEntry.js</code>.</p>",
      },
      {
        match: "resourceQuery: /raw/",
        note: "<p>Only for this learning panel: <code>import text from \"./file?raw\"</code> returns the file's source code as a string. That's how you are reading the real code right now.</p><p>A normal microfrontend doesn't need this.</p>",
      },
      {
        match: "new ModuleFederationPlugin",
        note: "Turns this app into a <b>remote</b>: an app whose modules can be loaded by another app (the <b>host</b>, here the container).",
      },
      {
        match: 'name: "products"',
        note: "<p>The remote's global name. The container refers to it as <code>products@&lt;url&gt;/remoteEntry.js</code>.</p><p>The part before <code>@</code> <b>must match this name</b>, or the container can't find the remote.</p>",
      },
      {
        match: 'filename: "remoteEntry.js"',
        note: "<p>The <b>manifest</b> file, and the first thing the container downloads from this app. It is small: it lists what is exposed and how to fetch the real code chunks on demand.</p><p>Served at <code>/remoteEntry.js</code>, e.g. <code>http://localhost:8081/remoteEntry.js</code> locally, or <code>https://mfe-products-list.vercel.app/remoteEntry.js</code> in production.</p>",
      },
      {
        match: "exposes:",
        note: "This app's <b>public API</b>: the only modules other apps may import. Everything else stays private.",
      },
      {
        match: '"./ProductsIndex"',
        note: "<p>Key = public name, value = real file.</p><p>When the container writes <code>import { mount } from \"products/ProductsIndex\"</code>, it gets <code>./src/bootstrap.js</code>. Products can rename or move files freely without breaking the container, as long as this mapping stays the same.</p>",
      },
      {
        match: '"./ProductsLearn"',
        note: "Exposes this learning panel too, so the container can show products' code walkthrough on its own page. Each app documents itself.",
      },
      {
        match: "shared:",
        note: "<p>\"If the page already has a compatible <code>faker</code>, reuse it.\" Products and cart both use faker; with <code>shared</code> the container page downloads it <b>once</b>.</p><p>Each app still bundles its own copy as a fallback, so products works on its own as well.</p>",
      },
      {
        match: "new HtmlWebpackPlugin",
        note: "Generates <code>index.html</code>, used only when products runs <b>on its own</b>. The container never loads this HTML; it only loads <code>remoteEntry.js</code> and the JS chunks.",
      },
      {
        match: "template:",
        note: "Uses <code>public/index.html</code> as the starting point and adds the <code>&lt;script&gt;</code> tags for the hashed bundles automatically.",
      },
    ],
  },
  {
    name: "public/index.html",
    about:
      "The page you see when products runs <b>on its own</b> (localhost:8081 or the products Vercel URL). Inside the container this file is not used at all.",
    code: indexHtml,
    notes: [
      {
        match: "<title>",
        note: "The browser tab title in standalone mode.",
      },
      {
        match: "<style>",
        note: "Page styles for standalone mode only. The product box's own styles live in <code>bootstrap.js</code>, so they travel with the app into the container.",
      },
      {
        match: "<body>",
        note: "There is no <code>&lt;script&gt;</code> tag here. <code>HtmlWebpackPlugin</code> adds one into <code>&lt;head&gt;</code> (with <code>defer</code>) at build time, pointing at the hashed <code>main.[hash].js</code>.",
      },
      {
        match: 'id="dev-products"',
        note: "<p>The mount point. <code>bootstrap.js</code> looks for this exact id.</p><p>It only exists in products' own HTML, not in the container's, and <b>that is how the app knows it is running on its own</b>.</p>",
      },
      {
        match: 'id="dev-products-learn"',
        note: "Where this learning panel appears in standalone mode.",
      },
    ],
  },
  {
    name: "src/index.js",
    about:
      "The entry point: the first file webpack runs. It's deliberately tiny. All it does is load the real code <b>asynchronously</b>.",
    code: indexJs,
    notes: [
      {
        match: "import ('./bootstrap.js')",
        note: "<p><b>The async boundary</b>, also called the <b>bootstrap pattern</b>. <code>import()</code> (with brackets) loads <code>bootstrap.js</code> as a separate chunk, later.</p><p>Why? Before code that uses <code>faker</code> runs, Module Federation must first agree with the other apps on the page which faker copy to use. The async import gives webpack that moment.</p><p>Import bootstrap directly and you get the error <i>\"Shared module is not available for eager consumption\"</i>.</p>",
      },
      {
        match: "import ('./learn')",
        note: "Loads this learning panel the same way. In standalone mode it renders into <code>#dev-products-learn</code>.",
      },
    ],
  },
  {
    name: "src/bootstrap.js",
    about:
      "The actual products app. It builds the product list and exposes a <code>mount(element)</code> function. That function is the <b>contract</b> between products and the container.",
    code: bootstrapJs,
    notes: [
      {
        match: 'import faker from "faker"',
        note: "Looks like a normal import, but because <code>faker</code> is <code>shared</code>, webpack resolves it through the <b>shared scope</b>. On the container page it might be the same faker copy that cart uses.",
      },
      {
        match: "const styles",
        note: "<p>The box's CSS as a plain string. Every class starts with <code>mfe-products</code>, so it can't collide with the container's or cart's CSS.</p><p>No CSS loader is needed: the styles are just JavaScript.</p>",
      },
      {
        match: "const injectStyles",
        note: "Adds the CSS to the page as a <code>&lt;style&gt;</code> tag. The <code>id</code> check means it's only added once, even if <code>mount</code> is called twice.",
      },
      {
        match: "const mount",
        note: "<p><b>The contract.</b> Whoever loads products just passes in an element, and products renders itself inside it.</p><p>The container doesn't know or care <i>how</i> products renders: plain JS today, maybe React or Vue tomorrow. Only this function signature has to stay the same.</p>",
      },
      {
        match: "for (let i = 0; i < 5; i++)",
        note: "Generates 5 fake products, each with a name and a price from faker.",
      },
      {
        match: "ele.innerHTML",
        note: "Writes the finished box into the element it was given. Products owns <b>what</b> is shown; the container only decides <b>where</b>.",
      },
      {
        match: 'document.querySelector("#dev-products")',
        note: "<p><b>Situation 1: running on its own.</b> Look for <code>#dev-products</code>, which exists only in products' own <code>index.html</code>.</p>",
      },
      {
        match: "if (el)",
        note: "<p>Found it: we're on products' own page, so mount right away.</p><p>Inside the container the element doesn't exist, so nothing happens here and products waits for the container to call <code>mount</code>.</p>",
      },
      {
        match: "export { mount }",
        note: "<p><b>Situation 2: running inside the container.</b> Export <code>mount</code> so the container can call it with its own element.</p><p>This export is what <code>\"./ProductsIndex\"</code> in the webpack config makes public.</p>",
      },
    ],
  },
];

const mount = (el) => {
  createLearnPanel(el, {
    ns: "mfe-products-learn",
    theme: { accent: "#4f46e5", soft: "#eef2ff", bright: "#818cf8" },
    badge: "Products MFE · remote",
    title: "How the Products app works",
    subtitle: "A remote: it runs on its own on port 8081 and is also loaded into the container at runtime.",
    intro: `
      <p><b>Products is a remote.</b> It is built and deployed on its own (its own Vercel project), and other apps can load the modules it <i>exposes</i>.</p>
      <p>Read the files in order: <code>package.json</code> → <code>webpack.config.js</code> → <code>public/index.html</code> → <code>src/index.js</code> → <code>src/bootstrap.js</code>. Use <b>Next</b> to step through each line.</p>`,
    files,
  });
};

// Standalone: products' own index.html has this element; the container does not.
const el = document.querySelector("#dev-products-learn");
if (el) {
  mount(el);
}

export { mount };
