document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://glowing-02bd61cbeff9.herokuapp.com/customers";
  const userApiUrl = "https://glowing-02bd61cbeff9.herokuapp.com/users"; // Untuk suspend
  const customerTable = document.querySelector("#customer-table tbody");
  const customerForm = document.getElementById("customer-form");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const closeModal = document.getElementById("close-modal");

  let editingCustomerId = null;

  // Fetch and display customers
  async function fetchCustomers() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const customers = await response.json();

      customerTable.innerHTML = customers
        .map(
          (customer) => `
      <tr>
        <td>${customer.username}</td>
        <td>${customer.email}</td>
        <td>
          <button class="edit-btn" data-id="${customer.id}">Edit</button>
          <button class="delete-btn" data-id="${
            customer.id
          }">Delete</button>
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
    const password = document.getElementById("customer-password").value;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: name, email, password }),
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Customer added successfully!',
            });
            customerForm.reset();
            fetchCustomers();
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
            });
        }
    } catch (error) {
        console.error("Error adding customer:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
});

  // Handle "Edit" button click
  customerTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
        editingCustomerId = e.target.getAttribute("data-id");

        if (!editingCustomerId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Customer ID is missing.',
            });
            return;
        }

        const row = e.target.closest("tr");
        const name = row.children[0].textContent;
        const email = row.children[1].textContent;

        document.getElementById("edit-name").value = name;
        document.getElementById("edit-email").value = email;

        editModal.classList.remove("hidden");
    }
});

  // Handle saving edited customer
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("edit-name").value;
    const email = document.getElementById("edit-email").value;

    if (!editingCustomerId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Customer ID is missing.',
        });
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: editingCustomerId,
                updates: {
                    username: name,
                    email: email,
                },
            }),
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Customer updated successfully!',
            });
            editModal.classList.add("hidden");
            fetchCustomers();
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
            });
        }
    } catch (error) {
        console.error("Error updating customer:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
});

  // Close modal
  closeModal.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  // Handle "Delete" button click
  customerTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const customerId = e.target.getAttribute("data-id");

        if (!customerId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Customer ID is missing.',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${apiUrl}/${customerId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Customer deleted successfully!',
                    });
                    fetchCustomers();
                } else {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Error: ${errorData.message}`,
                    });
                }
            } catch (error) {
                console.error("Error deleting customer:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred. Please try again.',
                });
            }
        }
    }
});
  // Initial fetch
  fetchCustomers();
});
