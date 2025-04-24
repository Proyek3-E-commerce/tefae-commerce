const fetchStoreData = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");

  if (!storeId) {
    document.getElementById("store-name").textContent = "Invalid Store ID";
    return;
  }

  try {
    const response = await fetch(`https://glowing-02bd61cbeff9.herokuapp.com/stores/${storeId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch store data: ${response.statusText}`);
    }

    const data = await response.json();

    const storeName = document.getElementById("store-name");
    const storeAddress = document.getElementById("store-address");
    const storeStatus = document.getElementById("store-status");
    const storeEmail = document.getElementById("store-email");
    const productList = document.getElementById("product-list");

    // Set data toko
    storeName.innerHTML = `
      <ion-icon name="storefront-outline" style="color: #e63946; font-size: 2rem;"></ion-icon>
      ${data.store.store_name}
    `;
    storeAddress.textContent = `Address: ${data.store.full_address}`;
    storeStatus.textContent = `Status: ${data.store.status}`;
    storeEmail.textContent = data.store.email;

    // Hapus loading text di daftar produk
    productList.innerHTML = "";

    // Tampilkan produk
    if (data.products.length > 0) {
      data.products.forEach((product) => {
        // Pastikan jalur gambar ditampilkan dengan benar
        const imageUrl = product.image
          ? `https://glowing-02bd61cbeff9.herokuapp.com/${product.image.replace("./", "")}`
          : "./images/default-product.png";

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
          <img src="${imageUrl}" alt="${product.name}" loading="lazy">
          <h2>${product.name}</h2>
          <p>Price: Rp.${product.price.toLocaleString()}</p>
          <p>Discount: ${product.discount}%</p>
          <p>${product.description}</p>
          <button class="add-to-cart-btn" data-id="${product.id}">
            <ion-icon name="bag-outline"></ion-icon>
          </button>
        `;
        productList.appendChild(productCard);
      });

      // Tambahkan event listener untuk tombol Add to Cart
      const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", handleAddToCart);
      });
    } else {
      productList.textContent = "No products available.";
    }
  } catch (error) {
    console.error("Error fetching store data:", error);
    document.getElementById("store-name").textContent =
      "Error loading store data.";
    document.getElementById("product-list").textContent =
      "Failed to load products.";
  }
};

const handleAddToCart = async (event) => {
    const productId = event.target.closest("button").getAttribute("data-id");
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User  is not authenticated");
  
      const userId = JSON.parse(atob(token.split(".")[1])).user_id;
  
      const response = await fetch("https://glowing-02bd61cbeff9.herokuapp.com/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity: 1,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to add product to cart: ${errorData.message || "Unknown error"}`
        );
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product added to cart successfully!',
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product to cart.',
      });
    }
  };
  
document.addEventListener("DOMContentLoaded", fetchStoreData);
