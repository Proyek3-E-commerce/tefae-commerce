"use strict";

// Fungsi-fungsi yang sudah ada tetap dipertahankan

/**
 * add event on element
 */
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
    alert("Email dan password harus diisi!");
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
            alert("You must be logged in as a customer to access this page.");
            window.location.href = "login.html"; // Redirect to login page
          }
        });
      } else {
        alert("Login failed: " + data.message);
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error); // Debug error
      alert("Login failed. Please try again.");
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
    alert("All fields are required!");
    return false;
  }

  // Simulasi registrasi berhasil
  alert("Registration successful!");
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
        alert("Produk ditambahkan ke favorit!");
      } else {
        alert("Produk sudah ada di favorit!");
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
      alert(`${productData.name} berhasil ditambahkan ke keranjang!`);
    });
  });
});
