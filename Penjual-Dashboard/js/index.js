const apiBaseUrl = "https://glowing-02bd61cbeff9.herokuapp.com";
let sellerId = "";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Not Logged In',
      text: 'You are not logged in!',
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  // Decode token
  const decoded = JSON.parse(atob(token.split(".")[1]));
  sellerId = decoded.user_id;

  // Fetch Data
  fetchDashboardData();
  fetchProducts();
  fetchOrders();
  fetchMessages();
});

async function fetchDashboardData() {
  try {
    const response = await fetch(`${apiBaseUrl}/dashboard-data?seller_id=${sellerId}`);
    const data = await response.json();

    document.getElementById("total-sales").textContent = `Rp ${data.totalSales.toLocaleString()}`;
    document.getElementById("pending-orders").textContent = data.pendingOrders;
    document.getElementById("total-revenue").textContent = `Rp ${data.totalRevenue.toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${apiBaseUrl}/products?seller_id=${sellerId}`);
    const products = await response.json();

    const productTable = document.getElementById("product-table");
    productTable.innerHTML = products.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>Rp ${product.price.toLocaleString()}</td>
        <td>${product.stock}</td>
        <td>
          <button onclick="editProduct('${product.id}')">Edit</button>
          <button onclick="deleteProduct('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

async function fetchOrders() {
  try {
    const response = await fetch(`${apiBaseUrl}/orders?seller_id=${sellerId}`);
    const orders = await response.json();

    const orderTable = document.getElementById("order-table");
    orderTable.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>Rp ${order.total.toLocaleString()}</td>
        <td>${order.status}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

async function fetchMessages() {
  try {
    const response = await fetch(`${apiBaseUrl}/messages?seller_id=${sellerId}`);
    const messages = await response.json();

    const messageList = document.getElementById("message-list");
    messageList.innerHTML = messages.map(msg => `<p><strong>${msg.sender}:</strong> ${msg.content}</p>`).join("");
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

// Logika Logout
const logoutLink = document.getElementById("logout-link");

const logout = () => {
    console.log("Logging out...");

    // Tampilkan SweetAlert untuk konfirmasi logout
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Hapus token dari localStorage
            localStorage.removeItem("token");

            // Verifikasi penghapusan token
            if (!localStorage.getItem("token")) {
                console.log("Token removed successfully.");
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Logout successful!',
                }).then(() => {
                    // Redirect ke halaman login setelah SweetAlert ditutup
                    window.location.href = "/login.html";
                });
            } else {
                console.error("Failed to remove token.");
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to logout. Please try again.',
                });
            }
        }
    });
};

if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault(); // Mencegah navigasi default
        logout(); // Jalankan fungsi logout
    });
} else {
    console.error("Logout link not found.");
}