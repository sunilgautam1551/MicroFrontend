import faker from "faker";

// Class names are prefixed with "mfe-cart" so they never clash with the container or other apps.
const styles = `
  .mfe-cart {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-top: 4px solid #059669;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    padding: 20px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1f2937;
  }
  .mfe-cart__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .mfe-cart__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  .mfe-cart__badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #059669;
    background: #ecfdf5;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .mfe-cart__body {
    text-align: center;
    padding: 20px 12px;
    background: #f9fafb;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
  }
  .mfe-cart__count {
    display: block;
    font-size: 40px;
    font-weight: 700;
    line-height: 1;
    color: #059669;
  }
  .mfe-cart__label {
    display: block;
    margin-top: 8px;
    color: #6b7280;
  }
`;

const injectStyles = () => {
  if (document.getElementById("mfe-cart-styles")) return;
  const style = document.createElement("style");
  style.id = "mfe-cart-styles";
  style.textContent = styles;
  document.head.appendChild(style);
};

const mount = (el) => {
  injectStyles();

  el.innerHTML = `
    <section class="mfe-cart">
      <div class="mfe-cart__header">
        <h2 class="mfe-cart__title">Cart</h2>
        <span class="mfe-cart__badge">Cart MFE</span>
      </div>
      <div class="mfe-cart__body">
        <span class="mfe-cart__count">${faker.random.number()}</span>
        <span class="mfe-cart__label">items in your cart</span>
      </div>
    </section>`;
};

// Situation 1: When app is running on a isolation mode, we can exceute it immediately.
// #cart-dev only exists in cart's own index.html, so this never runs inside the container.
const el = document.querySelector("#cart-dev");
if (el) {
  mount(el);
}

// Situation 2: when app is running through container.
export { mount };
