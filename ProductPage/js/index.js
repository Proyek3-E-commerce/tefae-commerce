const params = new URLSearchParams(window.location.search);
const productId = params.get("productId");

const renderProductDetails = (data) => {
  const product = data.product;
  const store = data.store;

  const imageUrl = product.image
    ? `https://tefae-commerce-2c0fdca4d608.herokuapp.com/${product.image.replace("./", "")}`
    : "./images/default-product.png";

  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = `
    <div class="product-detail-card">
      <!-- Product Images -->
      <div class="product-image img">
        <div class="product-image img">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy" />
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1 class="product-title">${product.category}: ${product.name}</h1>
        <p class="product-price">
          ${
            product.discount > 0
              ? `<del>Rp.${product.price.toLocaleString()}</del>`
              : ""
          }
          <span>Rp.${(
            product.price *
            (1 - product.discount / 100)
          ).toLocaleString()}</span>
        </p>
        <p class="product-description">${product.description}</p>

        <!-- Store Info -->
        <div class="store-info">
          <a href="halamantoko.html?storeId=${
            store.seller_id
          }" class="store-link" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;">
            <ion-icon name="storefront-outline" aria-hidden="true" style="font-size: 1.5rem; color: #e63946;"></ion-icon>
            <span>${store.store_name}</span>
          </a>
          <p>${store.full_address}</p>
        </div>

        <!-- Add to Cart Button -->
        <button class="btn-add-to-cart" onclick="addToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    </div>
  `;
};

const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User  is not authenticated");
  
      const userId = JSON.parse(atob(token.split(".")[1])).user_id;
  
      // Ambil detail produk dari backend
      const response = await fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/products/${productId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch product details: ${response.statusText}`
        );
      }
  
      const productData = await response.json();
      const product = productData.product;
  
      // Kirim produk ke backend untuk disimpan di keranjang
      const cartResponse = await fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          image: product.image,
          price: product.price,
          quantity: 1,
          total_price: product.price,
        }),
      });
  
      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(
          `Failed to add product to cart: ${errorData.message || "Unknown error"}`
        );
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product added to cart!',
      }).then(() => {
        window.location.href = "../cart/cart.html";
      });
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product to cart. Please try again.',
      });
    }
  };

const updateCartCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("User not authenticated. Cart count will default to 0.");
      document.getElementById("cart-count").textContent = "0";
      return;
    }

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedToken = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );
    const userId = decodedToken.user_id;

    // Fetch data keranjang dari backend
    const response = await fetch(
      `https://tefae-commerce-2c0fdca4d608.herokuapp.com/cart?user_id=${userId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cart data: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    // Hitung jumlah total produk
    const totalCount = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Perbarui jumlah produk di badge
    document.getElementById("cart-count").textContent = totalCount;
  } catch (error) {
    console.error("Error updating cart count:", error.message);
    document.getElementById("cart-count").textContent = "0"; // Tampilkan 0 jika terjadi kesalahan
  }
};

// Fetch detail produk saat halaman dimuat
if (productId) {
  fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/products/${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch product details: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => renderProductDetails(data))
    .catch((error) =>
      console.error("Error fetching product details:", error.message)
    );
} else {
  document.getElementById("product-container").innerHTML =
    "<p>No product ID found in URL</p>";
}

// Panggil fungsi untuk memperbarui jumlah keranjang
document.addEventListener("DOMContentLoaded", updateCartCount);
