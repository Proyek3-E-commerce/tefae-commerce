document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000/customers";
  const customerTable = document
    .getElementById("customer-table")
    .querySelector("tbody");
  const customerForm = document.getElementById("customer-form");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const closeModal = document.getElementById("close-modal");

  let editingCustomerId = null;

  // Fetch and display customers
  async function fetchCustomers() {
    try {
      const response = await fetch(apiUrl);
      const customers = await response.json();

      customerTable.innerHTML = customers
        .map(
          (customer) => `
                <tr>
                  <td>${customer.username}</td>
                  <td>${customer.email}</td>
                  <td>${customer.phone || "N/A"}</td>
                  <td>
                    <button class="edit-btn" data-id="${
                      customer._id
                    }">Edit</button>
                    <button class="delete-btn" data-id="${
                      customer._id
                    }">Delete</button>
                    <button class="suspend-btn" data-id="${customer._id}" ${
            customer.suspended ? "disabled" : ""
          }>Suspend</button>
                    <button class="unsuspend-btn" data-id="${customer._id}" ${
            !customer.suspended ? "disabled" : ""
          }>Unsuspend</button>
                  </td>
                </tr>`
        )
        .join("");
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }

  // Add new customer
  customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("customer-name").value;
    const email = document.getElementById("customer-email").value;
    const phone = document.getElementById("customer-phone").value;

    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, phone }),
      });
      customerForm.reset();
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  });

  // Edit customer
  customerTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      editingCustomerId = e.target.dataset.id;

      const row = e.target.closest("tr");
      const name = row.children[0].textContent;
      const email = row.children[1].textContent;
      const phone = row.children[2].textContent;

      document.getElementById("edit-name").value = name;
      document.getElementById("edit-email").value = email;
      document.getElementById("edit-phone").value = phone;

      editModal.classList.remove("hidden");
    }
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("edit-name").value;
    const email = document.getElementById("edit-email").value;
    const phone = document.getElementById("edit-phone").value;

    try {
      await fetch(`${apiUrl}/${editingCustomerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, phone }),
      });
      editModal.classList.add("hidden");
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  });

  // Delete customer
  customerTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;

      try {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  // Initial fetch
  fetchCustomers();
});
customerTable.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("suspend-btn")) {
    try {
      await fetch(`http://localhost:3000/users/suspend/${id}`, {
        method: "PATCH",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Error suspending customer:", error);
    }
  }

  if (e.target.classList.contains("unsuspend-btn")) {
    try {
      await fetch(`http://localhost:3000/users/unsuspend/${id}`, {
        method: "PATCH",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Error unsuspending customer:", error);
    }
  }
});
