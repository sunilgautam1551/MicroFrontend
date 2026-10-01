import faker from "faker";

const mount = (el) => {
  const cartText = `<div>You have ${faker.random.number()} items</div>`;

  el.innerHTML = cartText;
};

// Situation 1: When app is running on a isolation mode, we can exceute it immediately.
if (process.env.NODE_ENV === "development") {
  const el = document.querySelector("#cart-dev");
  if (el) {
    mount(el);
  }
}

// Situation 2: when app is running through container.
export { mount };
