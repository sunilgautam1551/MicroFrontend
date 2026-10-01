import faker from "faker";

// Class names are prefixed with "mfe-products" so they never clash with the container or other apps.
const styles = `
  .mfe-products {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-top: 4px solid #4f46e5;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    padding: 20px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1f2937;
  }
  .mfe-products__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .mfe-products__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  .mfe-products__badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #4f46e5;
    background: #eef2ff;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .mfe-products__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .mfe-products__item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #f9fafb;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
  }
  .mfe-products__price {
    font-weight: 600;
    color: #4f46e5;
    white-space: nowrap;
  }
`;

const injectStyles = () => {
  if (document.getElementById("mfe-products-styles")) return;
  const style = document.createElement("style");
  style.id = "mfe-products-styles";
  style.textContent = styles;
  document.head.appendChild(style);
};

const mount = (ele) => {
  injectStyles();

  let products = "";

  for (let i = 0; i < 5; i++) {
    const name = faker.commerce.productName();
    const price = faker.commerce.price();
    products += `
      <li class="mfe-products__item">
        <span>${name}</span>
        <span class="mfe-products__price">$${price}</span>
      </li>`;
  }

  ele.innerHTML = `
    <section class="mfe-products">
      <div class="mfe-products__header">
        <h2 class="mfe-products__title">Products</h2>
        <span class="mfe-products__badge">Products MFE</span>
      </div>
      <ul class="mfe-products__list">${products}</ul>
    </section>`;
};

// Situation 1: When app is running on a isolation mode, we can exceute it immediately.
// #dev-products only exists in products' own index.html, so this never runs inside the container.
const el = document.querySelector("#dev-products");
if (el) {
  mount(el);
}

// Situation 2: when app is running through container.
export { mount };
