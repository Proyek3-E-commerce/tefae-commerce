"use strict";

// Fungsi untuk menambahkan event listener pada elemen
const addEventOnElem = function (elem, type, callback) {
  if (!elem) {
    console.error("Element is null or undefined.");
    return;
  }

  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      if (elem[i].addEventListener) {
        elem[i].addEventListener(type, callback);
      } else {
        console.error("Element does not support addEventListener:", elem[i]);
      }
    }
  } else {
    if (elem.addEventListener) {
      elem.addEventListener(type, callback);
    } else {
      console.error("Element does not support addEventListener:", elem);
    }
  }
};

/**
 * navbar toggle
 */
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
};

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
};

addEventOnElem(navbarLinks, "click", closeNavbar);

/**
 * header sticky & back top btn active
 */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
  if (window.scrollY > 150) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
};

addEventOnElem(window, "scroll", headerActive);

let lastScrolledPos = 0;

const headerSticky = function () {
  if (lastScrolledPos >= window.scrollY) {
    header.classList.remove("header-hide");
  } else {
    header.classList.add("header-hide");
  }

  lastScrolledPos = window.scrollY;
};

addEventOnElem(window, "scroll", headerSticky);

/**
 * scroll reveal effect
 */
const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 2) {
      sections[i].classList.add("active");
    }
  }
};

scrollReveal();
addEventOnElem(window, "scroll", scrollReveal);

/**
 * Login validation and redirection based on role
 */
function validateLogin(event) {
  event.preventDefault(); // Prevent form refresh

  // Get input values from form
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    Swal.fire("Error", "Email dan password harus diisi!", "error");
    return;
  }

  // Send login request
  fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      console.log("Response status:", response.status); // Debug response status
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Parse response JSON
    })
    .then((data) => {
      console.log("Response from backend:", data); // Debug data

      if (data.status === "success") {
        localStorage.setItem("token", data.token); // Save token in localStorage
        localStorage.setItem("user_id", data.user_id); // Save user_id in localStorage
        localStorage.setItem("role", data.role); // Save role in localStorage
        localStorage.setItem("seller_id", data.seller_id); // Save seller_id in localStorage

        // Redirect based on role
        if (data.role === "admin") {
          window.location.href = "Admin-Dashboard/index.html";
        } else if (data.role === "seller") {
          window.location.href = "Penjual-Dashboard/index.html";
        } else {
          window.location.href = "index.html";
        }

        // Check role after DOM is loaded
        document.addEventListener("DOMContentLoaded", () => {
          const role = localStorage.getItem("role");
          if (role !== "customer") {
            Swal.fire("Error", "You must be logged in as a customer to access this page.", "error");
            window.location.href = "login.html"; // Redirect to login page
          }
        });
      } else {
        Swal.fire("Login Failed", data.message, "error");
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error); // Debug error
      Swal.fire("Login Failed", "Please try again.", "error");
    });

  console.log("Email:", email);
  console.log("Password:", password);
}

/**
 * Registration validation
 */
const validateRegistration = function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    Swal.fire("Error", "All fields are required!", "error");
    return false;
  }

  // Simulasi registrasi berhasil
  Swal.fire("Success", "Registration successful!", "success");
  window.location.href = "login.html"; // Redirect ke halaman login
};

// Tambahkan event listener hanya pada halaman login atau registrasi
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", validateLogin);
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", validateRegistration);
}

document.addEventListener("DOMContentLoaded", function () {
  // Tambahkan event listener ke setiap tombol wishlist
  const favoriteButtons = document.querySelectorAll(
    '[aria-label="add to whishlist"]'
  );

  favoriteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".shop-card");
      if (!productCard) return; // Jika productCard tidak ditemukan, keluar dari fungsi

      // Ambil detail produk
      const product = {
        id: productCard.dataset.id || new Date().getTime(), // Tambahkan ID unik (jika ada)
        image: productCard.querySelector(".img-cover")?.src || "",
        name:
          productCard.querySelector(".card-title")?.innerText ||
          "Produk Tidak Diketahui",
        price: productCard.querySelector(".span")?.innerText || "Rp.0",
      };

      // Ambil data favorit yang sudah ada
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      // Cek apakah produk sudah ada di daftar favorit
      const isDuplicate = favorites.some((item) => item.name === product.name);
      if (!isDuplicate) {
        favorites.push(product);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        Swal.fire("Success", "Produk ditambahkan ke favorit!", "success");
      } else {
        Swal.fire("Info", "Produk sudah ada di favorit!", "info");
      }
    });
  });

  // Redirect ke halaman favorit
  const favoriteBtn = document.getElementById("favorite-btn");
  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", function () {
      window.location.href = "fav.html";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const cart = []; // Array untuk menyimpan produk dalam keranjang
  const cartBadge = document.querySelector(".header-action-btn .btn-badge"); // Notifikasi keranjang
  const cartLink = document.querySelector(
    '.header-action-btn[href="cart.html"] data'
  ); // Total harga di header

  // Fungsi untuk memperbarui badge dan total keranjang
  function updateCartUI() {
    const totalQuantity = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const totalPrice = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    cartBadge.textContent = totalQuantity; // Update jumlah badge
    cartLink.textContent = `Rp.${totalPrice.toLocaleString("id-ID")}`; // Update total harga
  }

  // Fungsi untuk menambahkan produk ke keranjang
  function addToCart(product) {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity++; // Jika sudah ada, tambahkan kuantitas
    } else {
      cart.push({ ...product, quantity: 1 }); // Jika belum ada, tambahkan produk
    }
    updateCartUI();
  }

  // Event listener untuk tombol "add-to-cart"
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productData = JSON.parse(event.currentTarget.dataset.product);
      addToCart(productData);

      // Opsional: Tampilkan notifikasi sukses
      Swal.fire("Success", `${productData.name} berhasil ditambahkan ke keranjang!`, "success");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const authIcon = document.getElementById("auth-icon");
  const authMenu = document.getElementById("auth-menu");

  // Function to check if user is logged in by verifying the presence of token in localStorage
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return token !== null;
  };

  // Function to handle logout: removes token and redirects to login page
  const logout = () => {
    localStorage.removeItem("token");
    Swal.fire({
        title: "Success",
        text: "Logout successful!",
        icon: "success",
        timer: 1500, 
        timerProgressBar: true, // Menampilkan progress bar
        willClose: () => {
            window.location.href = "login.html"; // Mengarahkan ke halaman login setelah SweetAlert ditutup
        }
    });
};

  // Function to update the auth menu based on login status
  const updateAuthMenu = () => {
    if (isLoggedIn()) {
      authMenu.innerHTML = `
        <a href="profile.html" style="display: block; margin-bottom: 10px;">Profile</a>
        <a href="#" id="logout-btn" style="display: block;">Logout</a>
      `;

      // Add event listener to logout button
      const logoutBtn = document.getElementById("logout-btn");
      logoutBtn.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
    } else {
      authMenu.innerHTML = `
        <a href="login.html" style="display: block;">Login</a>
      `;
    }
  };

  // Toggle dropdown menu visibility on authIcon click
  authIcon.addEventListener("click", () => {
    const currentDisplay = authMenu.style.display;
    authMenu.style.display = currentDisplay === "block" ? "none" : "block";
  });

  // Close the dropdown menu if the user clicks outside the menu
  document.addEventListener("click", (event) => {
    if (!authMenu.contains(event.target) && !authIcon.contains(event.target)) {
      authMenu.style.display = "none";
    }
  });

  // Initialize the auth menu on page load
  updateAuthMenu();
});

document.addEventListener("DOMContentLoaded", () => {
  const sellerButton = document.getElementById("seller-button");

  sellerButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Mencegah default action dari tombol

    const token = localStorage.getItem("token");
    if (!token) {
        // Jika pengguna belum login, tampilkan popup dan arahkan ke login.html
        Swal.fire({
            title: "Error",
            text: "You must log in first to become a seller.",
            icon: "error",
            timer: 2000, // Menampilkan SweetAlert selama 2 detik (2000 ms)
            timerProgressBar: true, // Menampilkan progress bar
            willClose: () => {
                window.location.href = "login.html"; // Mengarahkan ke halaman login setelah SweetAlert ditutup
            }
        });
        return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userId = decoded.user_id;

      const response = await fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      const roles = data.data.roles;
      const storeStatus = data.data.store_status;

      if (roles.includes("seller")) {
        if (storeStatus === "pending") {
          // Jika masih dalam review
          Swal.fire("Info", "Your store registration is under review. Please wait for approval.", "info");
        } else if (storeStatus === "approved") {
          // Jika sudah disetujui, arahkan ke dashboard seller
          window.location.href = "Penjual-Dashboard/index.html";
        } else if (storeStatus === "rejected") {
          // Jika ditolak, tampilkan popup dan arahkan ke halaman utama
          Swal.fire("Error", "Your store registration has been rejected. You will be redirected to the home page.", "error");
          window.location.href = "index.html";
        }
      } else {
        // Jika belum jadi seller, arahkan ke halaman form pendaftaran seller
        window.location.href = "become.html";
      }
    } catch (error) {
      console.error("Error checking user roles:", error.message);
      window.location.href = "become.html";
    }
  });
});

// Fungsi untuk mengambil produk dari backend dan render ke halaman
async function fetchProducts(url, containerId) {
  try {
    const response = await fetch(url);
    const data = await response.json();

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
          ? `https://tefae-commerce-2c0fdca4d608.herokuapp.com/${product.image.replace("./", "")}`
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
                <h3><a href="ProductPage/index.html?productId=${product._id}" class="card-title">${name}</a></h3>
              </div>
            </div>
          </li>
        `;
      })
      .join("");

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
    if (!token) throw new Error("User   is not authenticated");

    const decoded = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const userId = decoded.user_id;

    const body = {
      user_id: userId,
      product_id: product._id,
      image: product.image,
      price: product.price,
      quantity: 1,
      total_price: product.price,
    };

    const response = await fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/cart", {
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

    // Menampilkan SweetAlert dengan timer
    Swal.fire({
      title: 'Success',
      text: 'Product added to cart!',
      icon: 'success',
      timer: 3000, // Menampilkan alert selama 3 detik
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "cart/cart.html"; // Redirect setelah alert ditutup
    });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    Swal.fire("Error", "Failed to add product to cart. Please try again.", "error");
  }
};

// Fetch products on page load
fetchProducts("https://tefae-commerce-2c0fdca4d608.herokuapp.com/products", "bestsellers-list");

// Fungsi untuk mendapatkan jumlah produk di keranjang
const updateCartCount = async () => {
  try {
    // Ambil keranjang dari localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("User   not authenticated. Cart count will default to 0.");
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
    const response = await fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/cart?user_id=${userId}`);
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