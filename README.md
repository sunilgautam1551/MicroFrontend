# MicroFrontend

A small e-commerce page built from three independently built and deployed microfrontends, wired together at runtime with **webpack 5 Module Federation**. No framework, just plain JavaScript, so the federation mechanics stay visible.

The app also teaches itself: below the shop, every app shows its own source code with line-by-line explanations.

## Live demo

| App | Role | URL |
|---|---|---|
| **container** | Host: owns the page and loads the other two | https://mfe-ecom.vercel.app |
| **products** | Remote: renders the product list | https://mfe-products-list.vercel.app |
| **cart** | Remote: renders the cart summary | https://mfe-shopcart.vercel.app |

Each remote also works on its own. Open its URL directly to see it in isolation.

## Architecture

```
                 ┌───────────────────────────┐
                 │  container (host) :8080   │
                 │  layout + empty slots     │
                 └─────────────┬─────────────┘
          downloads            │            downloads
       remoteEntry.js          │          remoteEntry.js
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│ products (remote) :8081   │       │ cart (remote) :8082       │
│ exposes ./ProductsIndex   │       │ exposes ./CartShow        │
│         ./ProductsLearn   │       │         ./CartLearn       │
└───────────────────────────┘       └───────────────────────────┘
          shared: faker  ◄─── loaded once on the page ───►  shared: faker
```

- The **container** decides *where* things go. It lists the remotes in `remotes` and imports `products/ProductsIndex` and `cart/CartShow` as if they were local modules.
- Each **remote** decides *what* it renders. It exposes a `mount(el)` function, and the host passes in an element to render into. That function is the only contract between the apps.
- `faker` is **shared**, so the page downloads one copy even though both remotes use it.

## Project structure

```
MicroFrontend/
├── container/                 # host app
│   ├── public/index.html      # page layout and slots (#my-products, #my-cart, #learn)
│   ├── src/index.js           # async boundary: import('./bootstrap')
│   ├── src/bootstrap.js       # imports the remotes and calls their mount()
│   ├── src/learn/             # overview and code walkthrough
│   └── webpack.config.js      # ModuleFederationPlugin with `remotes`
├── products/                  # remote app
│   ├── public/index.html      # standalone page (#dev-products)
│   ├── src/index.js           # async boundary
│   ├── src/bootstrap.js       # mount(el); mounts itself when standalone
│   ├── src/learn/             # this app's code walkthrough (exposed)
│   └── webpack.config.js      # ModuleFederationPlugin with `exposes`
└── cart/                      # remote app, same layout as products
```

Each folder is a separate npm project with its own `package.json` and `node_modules`. There is no root package.

## Running locally

Tested with Node.js 22. Start all three dev servers, each in its own terminal:

```bash
cd products  && npm install && npm start   # http://localhost:8081
cd cart      && npm install && npm start   # http://localhost:8082
cd container && npm install && npm start   # http://localhost:8080
```

Then open http://localhost:8080. The container loads both remotes from localhost. Start the remotes before the container, or reload the container once they're up.

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `webpack serve --mode development` | Dev server with live reload |
| `npm run build` | `webpack --mode production` | Minified build in `dist/` |

> After changing a `webpack.config.js`, restart that app's dev server. Webpack only reads its config at startup.

## How it works

1. The browser loads the container's `index.html` and `main.[hash].js`.
2. `src/index.js` runs `import('./bootstrap')`. This **async boundary** gives Module Federation time to fetch the remotes and agree on shared modules before any code uses them. Without it you get *"Shared module is not available for eager consumption"*.
3. `bootstrap.js` imports `products/…` and `cart/…`, so webpack downloads each remote's `remoteEntry.js`, then the exposed chunks.
4. `bootstrap.js` calls `productsMount(#my-products)` and `cartMount(#my-cart)`.

**Isolation mode:** each remote's `bootstrap.js` looks for an element that only exists on its own page (`#dev-products`, `#cart-dev`). If it finds one, the remote is running standalone and mounts itself. Otherwise it waits for the container to call `mount`.

**Styles:** each app injects its own `<style>` tag with class names prefixed by the app (`mfe-products__…`, `mfe-cart__…`), so styles can't clash and no CSS loader is needed.

## Remote URLs

The container picks remote URLs based on the build mode, in [container/webpack.config.js](container/webpack.config.js):

| Mode | products | cart |
|---|---|---|
| `development` (`npm start`) | `http://localhost:8081` | `http://localhost:8082` |
| `production` (`npm run build`) | `https://mfe-products-list.vercel.app` | `https://mfe-shopcart.vercel.app` |

The `PRODUCTS_URL` and `CART_URL` environment variables override either one, for example to point the container at a Vercel preview deployment:

```bash
PRODUCTS_URL=https://<preview>.vercel.app npm run build
```

## Deploying to Vercel

Each app is its own Vercel project, all imported from this same repository:

| Vercel project | Root Directory | Framework Preset | Build Command | Output Directory |
|---|---|---|---|---|
| mfe-products-list | `products` | Other | `npm run build` | `dist` |
| mfe-shopcart | `cart` | Other | `npm run build` | `dist` |
| mfe-ecom | `container` | Other | `npm run build` | `dist` |

- A push to `main` redeploys all three projects. To rebuild only the app that changed, set **Settings → Git → Ignored Build Step** to `git diff HEAD^ HEAD --quiet -- .` in each project.
- **Remotes can be deployed alone.** The container fetches `remoteEntry.js` at runtime, and that file name never changes (other bundles are content-hashed). A redeployed remote therefore shows up in the container on the next page load, without rebuilding the container.
- No CORS setup is needed: `remoteEntry.js` and its chunks are loaded through `<script>` tags.

## The learning panels

Under the shop, the container shows:

- an **overview**: architecture diagram, the `remoteEntry.js` URLs the page actually loaded, a step-by-step load sequence, and a glossary
- a **code walkthrough** for each app: file tabs, the real source with line numbers, and an explanation for each important line, with Previous/Next to step through

How it's built:

- Products and cart **expose their own walkthroughs** (`./ProductsLearn`, `./CartLearn`), and the container loads them through Module Federation like any other remote module. On a remote's standalone page, its walkthrough appears under its box.
- The code shown is the **real source**, imported as text at build time through a `?raw` webpack rule (`type: "asset/source"`).
- Explanations live in each app's `src/learn/index.js`. Each one finds its line by **text** (`match`), not by line number, so editing a file doesn't break them. If a match is no longer found, that note is skipped and a warning is logged to the browser console.
- `src/learn/viewer.js` is copied into each app on purpose, so every app still builds and deploys on its own.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Container page is blank, console shows `ScriptExternalLoadError` | A remote isn't reachable. Start its dev server, or check its deployed `/remoteEntry.js` URL. |
| Dev overlay shows many `Module not found` errors from `node_modules` | A dev server was started before a `webpack.config.js` change. Restart it. |
| Learning section fails on the deployed container, but the boxes work | The remotes are on an older deploy without `./ProductsLearn` / `./CartLearn`. Wait for their deploys to finish, then reload. |
| `npm error Missing script: "build"` on Vercel | The Root Directory is wrong, or the deployed commit predates the `build` script. |
