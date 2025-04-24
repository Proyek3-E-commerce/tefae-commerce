document.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = "https://glowing-02bd61cbeff9.herokuapp.com";

  async function fetchCount(endpoint, elementId) {
    try {
      const response = await fetch(`${apiBaseUrl}/${endpoint}`);
      const result = await response.json();

      console.log(`Response for ${endpoint}:`, result);

      let count = 0;

      // Penanganan berbagai jenis respons
      if (Array.isArray(result)) {
        count = result.length;
      } else if (result.data && Array.isArray(result.data)) {
        count = result.data.length;
      } else {
        console.warn(
          `Unexpected response format for ${endpoint}:`,
          result
        );
      }

      document.getElementById(elementId).textContent = count;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      document.getElementById(elementId).textContent = "Error";
    }
  }

  // Fetch counts for Customers, Sellers, and Products
  fetchCount("customers", "total-customers");
  fetchCount("sellers", "total-sellers");
  fetchCount("products", "total-products");

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
});
