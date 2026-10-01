import faker from "faker";

const mount = (ele) => {
  let products = "";

  for (let i = 0; i < 5; i++) {
    const name = faker.commerce.productName();
    products += `<div>${name}</div>`;
  }
  ele.innerHTML = products;
};

// Situation 1: When app is running on a isolation mode, we can exceute it immediately.
if (process.env.NODE_ENV === "development") {
  const el = document.querySelector("#dev-products");
  if (el) {
    mount(el);
  }
}

// Situation 2: when app is running through container.
export { mount };
