// === Restaurant Data ===
const restaurants = [
  { name: "Mama's Kitchen", cuisine: "Kenyan", rating: 4.5, price: 350 },
  { name: "Tandoori Express", cuisine: "Indian", rating: 4.2, price: 450 },
  { name: "Pizza Palace", cuisine: "Italian", rating: 4.7, price: 500 }
];

// === Menu Data ===
const menus = {
  "Mama's Kitchen": ["Ugali & Sukuma - KES 150", "Nyama Choma - KES 300"],
  "Tandoori Express": ["Chicken Tikka - KES 400", "Paneer Masala - KES 350"],
  "Pizza Palace": ["Margherita - KES 500", "Pepperoni - KES 550"]
};

// === Cart Logic ===
let cart = {};

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML = "";
  let total = 0;

  Object.keys(cart).forEach((key) => {
    const item = cart[key];
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - KES ${item.price} x ${item.quantity} = KES ${item.price * item.quantity}
      <button onclick="removeFromCart('${key.replace(/'/g, "\\'")}')">Remove</button>
    `;
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Total: KES ${total}`;
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(item) {
  if (cart[item.name]) {
    cart[item.name].quantity += 1;
  } else {
    cart[item.name] = { ...item, quantity: 1 };
  }
  updateCart();
}

function removeFromCart(name) {
  delete cart[name];
  updateCart();
}

// === Menu Modal Logic ===
const modal = document.getElementById("menuModal");
const closeModal = document.getElementById("closeModal");
const menuTitle = document.getElementById("menuTitle");
const menuItems = document.getElementById("menuItems");

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

function showMenu(name) {
  const menu = menus[name];
  if (!menu) {
    menuTitle.textContent = "Menu not found.";
    menuItems.innerHTML = "<li>No items available.</li>";
  } else {
    menuTitle.textContent = `${name} Menu`;
    menuItems.innerHTML = "";
    menu.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      menuItems.appendChild(li);
    });
  }
  modal.style.display = "flex";
}

// === Render Restaurants ===
const grid = document.getElementById("restaurantGrid");

function renderRestaurants(filter = "") {
  grid.innerHTML = "";
  restaurants
    .filter((r) => !filter || r.cuisine === filter)
    .forEach((r) => {
      const card = document.createElement("div");
      card.className = "restaurant-card";
      const safeName = r.name.replace(/'/g, "\\'");

      card.innerHTML = `
        <h3>${r.name}</h3>
        <p>Cuisine: ${r.cuisine}</p>
        <p>Rating: ${r.rating} ⭐</p>
        <p>Price: KES ${r.price}</p>
        <button class="add-btn">Add to Cart</button>
        <button onclick="showMenu('${safeName}')">View Menu</button>
      `;

      card.querySelector(".add-btn").addEventListener("click", () => {
        addToCart(r);
      });

      grid.appendChild(card);
    });
}

// === Checkout Logic ===
document.getElementById("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const address = document.getElementById("address").value;
  const payment = document.getElementById("payment").value;
  const confirmation = document.getElementById("confirmationMessage");
  const tracking = document.getElementById("orderTracking");
  const status = document.getElementById("orderStatus");

  if (Object.keys(cart).length === 0) {
    confirmation.textContent = "Your cart is empty. Please add items before checking out.";
    return;
  }

  const orderId = Math.floor(Math.random() * 1000000);
  const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  confirmation.textContent = `Order #${orderId} placed! Your food will be delivered to ${address}. Payment method: ${payment.toUpperCase()}.`;
  status.textContent = `Order #${orderId} is being prepared. Estimated delivery: 30–45 minutes.`;
  tracking.style.display = "block";

  // Save order to history
  const orderHistory = JSON.parse(localStorage.getItem("orders") || "[]");
  orderHistory.push({
    id: orderId,
    items: { ...cart },
    total,
    address,
    payment,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("orders", JSON.stringify(orderHistory));

  cart = {};
  updateCart();
  this.reset();
  loadOrderHistory();
});

// === Load Order History ===
function loadOrderHistory() {
  const orderList = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orderList.innerHTML = "";

  if (orders.length === 0) {
    orderList.innerHTML = "<li>No past orders found.</li>";
    return;
  }

  orders.forEach((order) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Order #${order.id}</strong> - ${order.date}<br/>
      Items: ${Object.values(order.items).map(i => `${i.name} x${i.quantity}`).join(", ")}<br/>
      Total: KES ${order.total}<br/>
      Delivery: ${order.address} | Payment: ${order.payment.toUpperCase()}
    `;
    orderList.appendChild(li);
  });
}

// === Cuisine Filter Support ===
const filterSelect = document.getElementById("filterCuisine");
if (filterSelect) {
  filterSelect.addEventListener("change", (e) => {
    renderRestaurants(e.target.value);
  });
}

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

// === Login Logic with Password ===
function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const welcome = document.getElementById("welcomeMessage");
  const logoutBtn = document.getElementById("logoutBtn");

  const validUser = "Ray Charles";
  const validPass = "1234";

  if (username === validUser && password === validPass) {
    localStorage.setItem("username", username);
    welcome.textContent = `Welcome, ${username}!`;
    document.getElementById("siteContent").style.display = "block";
    document.getElementById("logoOnly").style.display = "none";
    document.getElementById("loginSection").style.display = "none";
    logoutBtn.style.display = "inline-block";

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCart();
    }

    loadOrderHistory();
  } else {
    welcome.textContent = "Invalid username or password.";
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("username");
  document.getElementById("siteContent").style.display = "none";
  document.getElementById("logoOnly").style.display = "flex";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("welcomeMessage").textContent = "";
});

// === Splash Screen Fade-Out ===
window.addEventListener("load", () => {
  const splash = document.getElementById("splashScreen");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);
  }
});

// === Auto Login on Page Load ===
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) {
    document.getElementById("welcomeMessage").textContent = `Welcome back, ${savedUser}!`;
    document.getElementById("siteContent").style.display = "block";
    document.getElementById("logoOnly").style.display = "none";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCart();
    }

    loadOrderHistory();
  } else {
    document.getElementById("siteContent").style.display = "none";
    document.getElementById("logoOnly").style.display = "flex";
    document.getElementById("loginSection").style.display = "block";
  }
});

