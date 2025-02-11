document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/sellers";
  const approveUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/admin/approve-seller";
  const rejectUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/admin/reject-seller";
  const sellerTable = document.querySelector("#seller-table tbody");
  const sellerForm = document.getElementById("seller-form");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const closeModal = document.getElementById("close-modal");

  let editingSellerId = null;

  // Fetch all sellers
  async function fetchSellers() {
try {
const response = await fetch(apiUrl);

// Periksa apakah respons berhasil
if (!response.ok) {
const errorData = await response.json(); // Cobalah membaca pesan error dari server jika ada
throw new Error(
  `Failed to fetch sellers: ${response.status} - ${errorData.message || response.statusText}`
);
}

const data = await response.json();

// Validasi struktur data
if (!data || !Array.isArray(data.data)) {
throw new Error("Invalid response format: Expected an array of sellers in 'data.data'");
}

// Panggil fungsi untuk render data sellers
renderSellers(data.data);
} catch (error) {
console.error("Error fetching sellers:", error.message);

// Tampilkan pesan error di UI (opsional)
sellerTable.innerHTML = `<tr><td colspan="8">Error fetching sellers: ${error.message}</td></tr>`;
}
}
function renderSellers(users) {
sellerTable.innerHTML = users
.filter(user => Array.isArray(user.roles) && user.roles.includes("seller"))
.map(user => {
const isIncomplete =
  !user.store_info?.store_name ||
  !user.store_info?.full_address ||
  !user.store_info?.nik;

// Tentukan URL gambar
const photoUrl = user.store_info?.photo_path
  ? `https://tefae-commerce-2c0fdca4d608.herokuapp.com/${user.store_info.photo_path.replace(/\\/g, "/")}`
  : "./images/default-photo.png"; // Gambar default jika tidak ada foto

return `
  <tr class="${isIncomplete ? "incomplete" : ""}">
    <td>${user.username || "-"}</td>
    <td>${user.email || "-"}</td>
    <td>${user.store_info?.store_name || "-"}</td>
    <td>${user.store_info?.full_address || "-"}</td>
    <td>${user.store_info?.nik || "-"}</td>
    <td>${user.store_status || "-"}</td>
    <td>
      <img 
        src="${photoUrl}" 
        alt="Photo" 
        style="width: 50px; height: 50px; object-fit: cover; cursor: pointer;" 
        class="clickable-photo" 
        data-url="${photoUrl}" 
      >
    </td>
    <td>
      <button class="edit-btn" data-id="${user.id}">Edit</button>
      <button class="delete-btn" data-id="${user.id}">Delete</button>
      <button class="approve-btn" data-id="${user.id}">Approve</button>
      <button class="reject-btn" data-id="${user.id}">Reject</button>
    </td>
  </tr>
`;
})
.join("");

// Tambahkan event listener untuk semua foto
document.querySelectorAll(".clickable-photo").forEach(photo => {
photo.addEventListener("click", (e) => {
const photoUrl = e.target.dataset.url;
showPhotoModal(photoUrl); // Gunakan nama fungsi yang benar
});
});
}

// Show photo modal
function showPhotoModal(photoUrl) {
const modal = document.createElement("div");
modal.className = "photo-modal";
modal.innerHTML = `
<div class="modal-overlay"></div>
<div class="modal-content">
<img src="${photoUrl}" alt="Large Photo" style="max-width: 90%; max-height: 90%; border-radius: 8px;">
<button class="close-modal" style="margin-top: 10px;">Close</button>
</div>
`;
document.body.appendChild(modal);

// Tambahkan event listener untuk menutup modal
modal.querySelector(".modal-overlay").addEventListener("click", () => modal.remove());
modal.querySelector(".close-modal").addEventListener("click", () => modal.remove());
}

  // Add new seller
  sellerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("add-name").value;
    const email = document.getElementById("add-email").value;
    const storeName = document.getElementById("add-store-name").value;
    const fullAddress = document.getElementById("add-full-address").value;
    const nik = document.getElementById("add-nik").value;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: name,
                email,
                store_info: { store_name: storeName, full_address: fullAddress, nik },
            }),
        });

        if (!response.ok) throw new Error("Failed to add seller");

        // Mengganti alert dengan SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Seller added successfully!',
        });

        sellerForm.reset();
        fetchSellers();
    } catch (error) {
        console.error("Error adding seller:", error);
        // Menampilkan SweetAlert untuk kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add seller. Please try again.',
        });
    }
});

  // Handle actions for sellers
  sellerTable.addEventListener("click", async (e) => {
    const sellerId = e.target.getAttribute("data-id");
    if (!sellerId) return;

    if (e.target.classList.contains("edit-btn")) {
        editingSellerId = sellerId;
        const row = e.target.closest("tr");
        const name = row.children[0].textContent;
        const email = row.children[1].textContent;
        const storeName = row.children[2].textContent;
        const fullAddress = row.children[3].textContent;
        const nik = row.children[4].textContent;
        const photoUrl = row.querySelector("img").src;

        document.getElementById("edit-name").value = name;
        document.getElementById("edit-email").value = email;
        document.getElementById("edit-store-name").value = storeName;
        document.getElementById("edit-full-address").value = fullAddress;
        document.getElementById("edit-nik").value = nik;
        document.getElementById("edit-photo").src = photoUrl;

        editModal.classList.remove("hidden");
    } else if (e.target.classList.contains("approve-btn")) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to approve this seller?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(approveUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: sellerId, status: "approved" }),
                });
                if (!response.ok) throw new Error("Failed to approve seller");

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Seller approved successfully!',
                });
                fetchSellers();
            } catch (error) {
                console.error("Error approving seller:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to approve seller. Please try again.',
                });
            }
        }
    } else if (e.target.classList.contains("reject-btn")) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to reject this seller?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reject it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(rejectUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: sellerId, status: "rejected" }),
                });
                if (!response.ok) throw new Error("Failed to reject seller");

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Seller rejected successfully!',
                });
                fetchSellers();
            } catch (error) {
                console.error("Error rejecting seller:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to reject seller. Please try again.',
                });
            }
        }
    } else if (e.target.classList.contains("delete-btn")) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this seller?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${apiUrl}/${sellerId}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Failed to delete seller");

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Seller deleted successfully!',
                });
                fetchSellers();
            } catch (error) {
                console.error("Error deleting seller:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete seller. Please try again.',
                });
            }
        }
    }
});

  // Update seller details
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingSellerId) return;

    const name = document.getElementById("edit-name").value;
    const email = document.getElementById("edit-email").value;
    const storeName = document.getElementById("edit-store-name").value;
    const fullAddress = document.getElementById("edit-full-address").value;
    const nik = document.getElementById("edit-nik").value;

    try {
        const response = await fetch(`${apiUrl}/${editingSellerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: name,
                email,
                store_info: { store_name: storeName, full_address: fullAddress, nik },
            }),
        });

        if (!response.ok) throw new Error("Failed to update seller");

        // Mengganti alert dengan SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Seller updated successfully!',
        });

        editModal.classList.add("hidden");
        fetchSellers();
    } catch (error) {
        console.error("Error updating seller:", error);
        // Menampilkan SweetAlert untuk kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update seller. Please try again.',
        });
    }
});

  closeModal.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  fetchSellers();
});
