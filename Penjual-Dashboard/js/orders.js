document.addEventListener("DOMContentLoaded", async () => {
  const orderTableBody = document.querySelector("#order-table-body");
  const updateStatusModal = document.getElementById("updateStatusModal");
  const updateAllDataModal =
    document.getElementById("updateAllDataModal");
  const viewOrderModal = document.getElementById("viewOrderModal");
  const closeStatusModalBtn = document.getElementById("close-modal-btn");
  const closeAllDataModalBtn = document.getElementById(
    "close-modal-all-btn"
  );
  const closeViewOrderModalBtn = document.getElementById(
    "close-view-modal-btn"
  );
  const updateStatusForm = document.getElementById("updateStatusForm");
  const updateAllDataForm = document.getElementById("updateAllDataForm");
  const apiBaseUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com";
  const ordersApi = `${apiBaseUrl}/orders`;
  const updateOrderApi = `${apiBaseUrl}/orders`;

  let sellerId = null;
  let currentOrderId = null;

  // Fetch sellerId from token
  function getSellerIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'You are not logged in. Please login first.',
        }).then(() => {
            window.location.href = "/login.html";
        });
        return null;
    }

    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.seller_id || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

  sellerId = getSellerIdFromToken();
  if (!sellerId) return;

  // Fetch orders
  async function fetchOrders() {
    try {
      const response = await fetch(`${ordersApi}?seller_id=${sellerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const result = await response.json();
      const orders = result.data || [];

      orderTableBody.innerHTML = orders
        .map(
          (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.user_id || "No name"}</td>
          <td>Rp ${order.total_amount.toLocaleString()}</td>
          <td><span class="order-status ${getOrderStatusClass(
            order.status
          )}">${order.status}</span></td>
          <td>
            <button class="view-btn" data-id="${order.id}">View</button>
            <button class="delete-btn" data-id="${
              order.id
            }">Delete</button>
            <button class="status-btn" data-id="${
              order.id
            }">Update Status</button>
          </td>
        </tr>
      `
        )
        .join("");

      attachOrderActions();
    } catch (error) {
      console.error(error);
    }
  }

  // Handle order actions (view, edit, delete, update status)
  function attachOrderActions() {
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        currentOrderId = e.target.getAttribute("data-id");
        showOrderDetails(currentOrderId);
        updateAllDataModal.style.display = "flex";
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const orderId = e.target.getAttribute("data-id");
        const confirmed = await 
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });

        if (confirmed.isConfirmed) {
          await deleteOrder(orderId);
        }
      });
    });

    document.querySelectorAll(".status-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        currentOrderId = e.target.getAttribute("data-id");
        updateStatusModal.style.display = "flex";
      });
    });

    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        currentOrderId = e.target.getAttribute("data-id");
        viewOrderModal.style.display = "flex";
        showOrderDetails(currentOrderId);
      });
    });
  }

  // Fetch order details for editing
  async function showOrderDetails(orderId) {
    try {
      const response = await fetch(`${ordersApi}/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch order details");

      const result = await response.json();
      const order = result.data;

      const orderDetails = document.getElementById("order-details");
      orderDetails.innerHTML = `
<p><strong>Order ID:</strong> ${order.id}</p>
<p><strong>User ID:</strong> ${order.user_id}</p>
<p><strong>Seller ID:</strong> ${order.seller_id}</p>
<p><strong>Status:</strong> ${order.status}</p>
<p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
<p><strong>Total Amount:</strong> Rp ${order.total_amount.toLocaleString()}</p>
<p><strong>Shipping Cost:</strong> Rp ${order.shipping_cost.toLocaleString()}</p>
<p><strong>Payment Date:</strong> ${new Date(
order.payment_date
).toLocaleString()}</p>
`;
// Display product items in the modal
const productListView =
document.getElementById("product-list-view");
productListView.innerHTML = ""; // Clear existing products
order.items.forEach((item) => {
const productItem = document.createElement("li");
productItem.innerHTML = `${item.name} (Quantity: ${
item.quantity
}, Price: Rp ${parseFloat(item.price).toLocaleString()})`;
productListView.appendChild(productItem);
});

      // Add "Cetak Resi" button
const printButtonContainer = document.getElementById("print-button-container");
printButtonContainer.innerHTML = `
<button id="print-shipping-label" class="btn-cetak-resi">Cetak Resi</button>
`;

// Add event listener for "Cetak Resi" button
document.getElementById('print-shipping-label').addEventListener('click', function() {
// Generate PDF using jsPDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

// Set font untuk judul dan detail
doc.setFont("helvetica", "normal");

// Header
doc.setFontSize(16);
doc.text("Resi Pengiriman - Toko Anda", 14, 20);
doc.setFontSize(12);
doc.text("Logo Toko (Placeholder)", 14, 30); // Bisa diganti dengan logo sebenarnya
doc.line(10, 35, 200, 35);  // Garis pemisah

// Order Information (Biodata Order)
doc.setFontSize(12);
doc.text("Order ID: " + order.id, 14, 50);
doc.text("Status: " + order.status, 14, 60);
doc.text("Shipping Address: " + order.shipping_address, 14, 70);
doc.text("Total Amount: Rp " + order.total_amount.toLocaleString(), 14, 80);
doc.text("Shipping Cost: Rp " + order.shipping_cost.toLocaleString(), 14, 90);
doc.text("Payment Date: " + new Date(order.payment_date).toLocaleString(), 14, 100);

// Line separator
doc.line(10, 105, 200, 105);

// Customer Information
doc.text("Customer Information", 14, 115);
doc.text("User ID: " + order.user_id, 14, 125);
doc.text("Seller ID: " + order.seller_id, 14, 135);

// Table untuk Produk
doc.text("Produk Pesanan:", 14, 145);

// Table header
const startY = 155;
doc.setFontSize(10);
doc.text("Nama Produk", 14, startY);
doc.text("Kuantitas", 100, startY);
doc.text("Harga", 140, startY);
doc.line(10, startY + 2, 200, startY + 2); // Garis header

// Tabel Produk
let yPosition = startY + 10;
order.items.forEach(item => {
doc.text(item.name, 14, yPosition);
doc.text(item.quantity.toString(), 100, yPosition);
doc.text("Rp " + parseFloat(item.price).toLocaleString(), 140, yPosition);
yPosition += 10;
});

// Garis pemisah untuk footer
doc.line(10, yPosition + 5, 200, yPosition + 5);

// Footer
doc.setFontSize(8);
doc.text("Terima kasih telah berbelanja di Toko Kami!", 14, yPosition + 15);
doc.text("Alamat Toko: [Alamat Toko Anda]", 14, yPosition + 20);
doc.text("Kontak: [Nomor Kontak Toko]", 14, yPosition + 25);

// Save the generated PDF
doc.save(`resi_${order.id}.pdf`);
});
    } catch (error) {
      console.error(error);
    }
  }

  // Show modal with order details
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      currentOrderId = e.target.getAttribute("data-id");
      viewOrderModal.style.display = "flex";
      showOrderDetails(currentOrderId);
    });
  });

  // Handle updating order status
  updateStatusForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("status").value;

    try {
      const response = await fetch(
        `${updateOrderApi}/status/${currentOrderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      Swal.fire({
        title: "Success!",
        text: "Order status has been updated.",
        icon: "success",
      });

      fetchOrders(); // Refresh orders
      updateStatusModal.style.display = "none"; // Close modal
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update status",
        icon: "error",
      });
    }
  });

  // Handle updating all order data
  updateAllDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const customer_name = document.getElementById("customer_name").value;
    const total_amount = document.getElementById("total_amount").value;
    const status = document.getElementById("order_status").value;
    const products = [];

    // Collect product data
    document
      .querySelectorAll(".product-row")
      .forEach((productRow, index) => {
        const name = document.getElementById(
          `product-${index}-name`
        ).value;
        const quantity = document.getElementById(
          `product-${index}-quantity`
        ).value;
        const price = document.getElementById(
          `product-${index}-price`
        ).value;

        products.push({ name, quantity, price });
      });

    try {
      const response = await fetch(
        `${updateOrderApi}/${currentOrderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name,
            total_amount,
            status,
            products,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update order");

      Swal.fire({
        title: "Success!",
        text: "Order has been updated.",
        icon: "success",
      });

      fetchOrders(); // Refresh orders
      updateAllDataModal.style.display = "none"; // Close modal
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Failed to update order",
        icon: "error",
      });
    }
  });

  // Handle updating order status
  updateStatusForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("order_status").value;

    try {
      const response = await fetch(
        `${updateOrderApi}/${currentOrderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      Swal.fire({
        title: "Success!",
        text: "Order status has been updated.",
        icon: "success",
      });

      fetchOrders(); // Refresh orders
      updateStatusModal.style.display = "none"; // Close modal
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Failed to update status",
        icon: "error",
      });
    }
  });

  // Utility function to get CSS class based on order status
  function getOrderStatusClass(status) {
    switch (status) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      default:
        return "";
    }
  }

  // Handle deleting order
  async function deleteOrder(orderId) {
    try {
      const response = await fetch(`${ordersApi}/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete order");

      Swal.fire({
        title: "Success!",
        text: "Order has been deleted.",
        icon: "success",
      });

      fetchOrders(); // Refresh orders
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete order",
        icon: "error",
      });
    }
  }
  // Close modals
  closeStatusModalBtn.addEventListener(
    "click",
    () => (updateStatusModal.style.display = "none")
  );
  closeAllDataModalBtn.addEventListener(
    "click",
    () => (updateAllDataModal.style.display = "none")
  );
  closeViewOrderModalBtn.addEventListener(
    "click",
    () => (viewOrderModal.style.display = "none")
  );

  // Fetch orders when the page loads
  fetchOrders();
});
