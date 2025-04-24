const checkAuthentication = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "You are not logged in!",
      text: "Please log in to access your cart.",
      icon: "warning",
      confirmButtonText: "Go to Login",
      allowOutsideClick: false,
    }).then(() => {
      window.location.href = "../login.html";
    });
    return false;
  }
  return true;
};

// Function to decode JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}

// Function to render cart items
const renderCartItems = (products) => {
  const cartItemsContainer = document.getElementById("cart-items");

  if (!products || products.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItemsContainer.innerHTML = products
    .map((product) => {
      const imageUrl = product.image
        ? `https://glowing-02bd61cbeff9.herokuapp.com/${product.image.replace("./", "")}`
        : "./images/default-product.png";

      return `
        <div class="cart-item" id="product-${product.product_id}">
          <img src="${imageUrl}" alt="${product.name}" class="product-image">
          <div class="cart-item-info">
            <p class="cart-item-title">${product.name}</p>
            <p class="cart-item-quantity">
              Quantity: <span>${product.quantity}</span>
            </p>
            <p class="cart-item-price" data-price="${product.price}">
              Price: Rp.${product.price.toLocaleString()}
            </p>
            <div class="quantity-controls">
              <button onclick="updateQuantity('${product.product_id}', -1)">-</button>
              <button onclick="updateQuantity('${product.product_id}', 1)">+</button>
              <button class="delete-item-btn" onclick="removeFromCart('${product.product_id}')">
                <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

// Function to update product quantity
const updateQuantity = async (productId, delta) => {
  try {
    const productElement = document.querySelector(
      `#product-${productId}`
    );
    if (!productElement)
      throw new Error(`Product not found for ID: ${productId}`);

    const quantityElement = productElement.querySelector(
      ".cart-item-quantity span"
    );
    const priceElement = productElement.querySelector(".cart-item-price");
    const currentQuantity = parseInt(quantityElement.innerText);
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 1) {
      Swal.fire({
        title: "Invalid Quantity",
        text: "Quantity cannot be less than 1.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) throw new Error("User  is not authenticated");

    const decoded = parseJwt(token);
    const userId = decoded?.user_id;
    if (!userId) throw new Error("Invalid user ID");

    const response = await fetch("https://glowing-02bd61cbeff9.herokuapp.com/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity: newQuantity,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Failed to update cart: ${responseText}`);
    }

    // Update quantity in UI
    quantityElement.innerText = newQuantity;
    const price = parseFloat(priceElement.getAttribute("data-price"));
    const totalPriceElement =
      productElement.querySelector(".cart-item-price");
    totalPriceElement.innerText = `Price: Rp.${(
      price * newQuantity
    ).toLocaleString()}`;

    updateCartTotal();
  } catch (error) {
    console.error("Error updating cart:", error.message);
    Swal.fire({
      title: "Error",
      text: "Failed to update cart. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

// Function to update cart total
const updateCartTotal = () => {
  let total = 0;
  document.querySelectorAll(".cart-item").forEach((item) => {
    const priceElement = item.querySelector(".cart-item-price");
    const quantityElement = item.querySelector(
      ".cart-item-quantity span"
    );
    const price = parseFloat(priceElement.getAttribute("data-price"));
    const quantity = parseInt(quantityElement.innerText);
    total += price * quantity;
  });
  document.getElementById(
    "cart-total"
  ).innerText = `Total: Rp.${total.toLocaleString()}`;
};

// Function to fetch cart items
const fetchCartItems = async () => {
  if (!checkAuthentication()) return;
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User  is not authenticated");

    const decoded = parseJwt(token);
    const userId = decoded?.user_id;
    if (!userId) throw new Error("Invalid user ID");

    const apiUrl = "https://glowing-02bd61cbeff9.herokuapp.com/cart";
    console.log(`Fetching cart from: ${apiUrl}?user_id=${userId}`);

    const response = await fetch(`${apiUrl}?user_id=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch cart items");

    const data = await response.json();
    renderCartItems(data.products);
    updateCartTotal();
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    document.getElementById("cart-items").innerHTML =
      "<p>Failed to load cart items.</p>";
  }
};

// Function to remove product from cart
const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User  is not authenticated");

    const userId = JSON.parse(atob(token.split(".")[1])).user_id;

    const response = await fetch("https://glowing-02bd61cbeff9.herokuapp.com/cart/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, product_id: productId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove product: ${errorText}`);
    }

    console.log("Product removed successfully.");

    await fetchCartItems();
    Swal.fire({
      title: "Success",
      text: "Product removed successfully!",
      icon: "success",
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error.message);
    Swal.fire({
      title: "Error",
      text: "Failed to remove product from cart. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

document.addEventListener("DOMContentLoaded", fetchCartItems);