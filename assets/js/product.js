"use strict";

// Fungsi untuk mengambil produk dari backend dan render ke halaman
async function fetchProducts(url, containerId) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Fetched Data:", data);

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error("Invalid data format:", data);
      document.getElementById(containerId).innerHTML = "<p>No products found</p>";
      return;
    }

    const products = data.data;
    const container = document.getElementById(containerId);

    container.innerHTML = products
      .map((product) => {
        const imageUrl = product.image
          ? `https://glowing-02bd61cbeff9.herokuapp.com/${product.image.replace("./", "")}`
          : "./images/default-product.png";
        const name = product.name || "Unknown Product";
        const price = product.price || 0;
        const discount = product.discount || 0;

        return `
          <li class="scrollbar-item">
            <div class="shop-card">
              <div class="card-banner img-holder" style="--width: 540; --height: 720">
                <a href="ProductPage/index.html?productId=${product._id}" class="product-link">
                  <img src="${imageUrl}" width="540" height="720" loading="lazy" alt="${name}" class="img-cover" />
                </a>
                ${
                  discount > 0
                    ? `<span class="badge" aria-label="${discount}% off">-${discount}%</span>`
                    : ""
                }
                <div class="card-actions">
                  <button class="action-btn" aria-label="add to cart" data-product='${JSON.stringify(
                    product
                  )}'>
                    <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                  </button>
                </div>
              </div>
              <div class="card-content">
                <div class="price">
                  ${
                    discount > 0
                      ? `<del class="del">Rp.${price.toLocaleString()}</del>`
                      : ""
                  }
                  <span class="span">Rp.${(
                    price * (1 - discount / 100)
                  ).toLocaleString()}</span>
                </div>
                <h3><a href="ProductPage/index.html?productId=${product.id}" class="card-title">${name}</a></h3>
              </div>
            </div>
          </li>
        `;
      })
      .join("");

    // Tambahkan event listener untuk tombol "Add to Cart"
    const buttons = container.querySelectorAll(".action-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const productData = JSON.parse(
          event.currentTarget.getAttribute("data-product")
        );
        addToCart(productData);
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Fungsi untuk menambahkan produk ke keranjang
const addToCart = async (product) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User  is not authenticated");

    // Decode token untuk mendapatkan user_id
    const decoded = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const userId = decoded.user_id;

    // Body request sesuai dengan format yang diberikan
    const body = {
      user_id: userId,
      product_id: product._id,
      image: product.image,
      price: product.price,
      quantity: 1, // Default jumlah
      total_price: product.price, // Total harga awal
    };

    const response = await fetch("https://glowing-02bd61cbeff9.herokuapp.com/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Failed to add product to cart: ${responseText}`);
    }

    const data = await response.json();
    Swal.fire("Success", data.message, "success"); // Menampilkan pesan sukses

    // Redirect ke halaman keranjang
    window.location.href = "cart/cart.html";
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    Swal.fire("Error", "Failed to add product to cart. Please try again.", "error");
  }
};

// Panggil fungsi untuk mengambil produk
fetchProducts("https://glowing-02bd61cbeff9.herokuapp.com/products", "bestsellers-list");

// Fungsi untuk mendapatkan jumlah produk di keranjang
const updateCartCount = async () => {
  try {
    // Ambil keranjang dari localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("User  not authenticated. Cart count will default to 0.");
      document.getElementById("cart-count").textContent = "0";
      return;
    }

    // Ambil user_id dari token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedToken = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    const userId = decodedToken.user_id;

    // Fetch data keranjang dari backend
    const response = await fetch(`https://glowing-02bd61cbeff9.herokuapp.com/cart?user_id=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cart data: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    // Hitung jumlah total produk
    const totalCount = products.reduce((sum, product) => sum + product.quantity, 0);

    // Perbarui jumlah produk di badge
    document.getElementById("cart-count").textContent = totalCount;
  } catch (error) {
    console.error("Error updating cart count:", error.message);
    document.getElementById("cart-count").textContent = "0"; // Tampilkan 0 jika terjadi kesalahan
  }
};

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", updateCartCount);