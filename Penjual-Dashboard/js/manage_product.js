  document.addEventListener("DOMContentLoaded", async () => {
    const productTableBody = document.querySelector("#product-table-body");
    const addProductButton = document.getElementById("add-product");

    let categories = [];
    let subCategories = [];
    let userId = null;

    const apiBaseUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com";
    const categoryApi = `${apiBaseUrl}/categories`;
    const productsApi = `${apiBaseUrl}/seller/products`;
    const updateDeleteApi = `${apiBaseUrl}/sellers`;

    // **1. Ambil `user_id` dari token JWT**
    function getUserIdFromToken() {
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
          return decoded.user_id || null;
      } catch (error) {
          console.error("Error decoding token:", error);
          return null;
      }
  }

    userId = getUserIdFromToken();
    if (!userId) return;

    // **2. Ambil data kategori & subkategori dari API**
    async function fetchCategories() {
        try {
            const response = await fetch(categoryApi);
            const result = await response.json();
            categories = result.data || [];

            subCategories = categories.flatMap(cat =>
                cat.sub_categories.map(sub => ({ ...sub, category_id: cat.id }))
            );
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    // **3. Ambil daftar produk berdasarkan user_id**
    async function fetchProducts() {
        try {
            const response = await fetch(`${productsApi}?user_id=${userId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch products");

            const result = await response.json();
            const products = result.data || [];

            productTableBody.innerHTML = products
                .map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>Rp ${product.price.toLocaleString()}</td>
                        <td>${product.stock}</td>
                        <td>${product.discount}%</td>
                        <td>
                            <img src="${product.image ? `${apiBaseUrl}/${product.image.replace("./", "")}` : "https://tefae-commerce-2c0fdca4d608.herokuapp.com/uploads/no-image.jpg"}" 
                            alt="Product Image" style="width: 50px;">
                        </td>
                        <td>${getCategoryName(product.category_id)}</td>
                        <td>${getSubCategoryName(product.sub_category_id)}</td>
                        <td>
                            <button class="edit-btn" data-id="${product.id}">Edit</button>
                            <button class="delete-btn" data-id="${product.id}">Delete</button>
                        </td>
                    </tr>
                `).join("");

            attachEventListeners();
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // **4. Fungsi mendapatkan nama kategori & subkategori berdasarkan ID**
    function getCategoryName(categoryId) {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : "Unknown Category";
    }

    function getSubCategoryName(subCategoryId) {
        const subCategory = subCategories.find(sub => sub.id === subCategoryId);
        return subCategory ? subCategory.name : "Unknown Sub-Category";
    }

    // **5. Tambahkan event listener untuk tombol Add Product**
    addProductButton.addEventListener("click", () => {
        openModal("Add Product", {}, createProduct);
    });

    // **6. Membuka modal untuk tambah atau edit produk**
    function openModal(title, product = {}, onSave) {
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
          <div class="modal-content">
              <h2>${title}</h2>
              <form id="modal-form">
                  <label>Name:</label>
                  <input type="text" id="product-name" value="${product.name || ""}" required>
  
                  <label>Price:</label>
                  <input type="number" id="product-price" value="${product.price || ""}" required>
  
                  <label>Stock:</label>
                  <input type="number" id="product-stock" value="${product.stock || ""}" required>
  
                  <label>Discount (%):</label>
                  <input type="number" id="product-discount" value="${product.discount || "0"}" required>
  
                  <label>Image:</label>
                  <input type="file" id="product-image">
  
                  <label>Category:</label>
                  <select id="product-category" required>
                      <option value="">Select Category</option>
                      ${categories.map(cat => `<option value="${cat.id}" ${cat.id === product.category_id ? "selected" : ""}>${cat.name}</option>`).join("")}
                  </select>
  
                  <label>Sub-Category:</label>
                  <select id="product-sub-category" required>
                      <option value="">Select Sub-Category</option>
                  </select>
  
                  <label>Description:</label>
                  <textarea id="product-description" required>${product.description || ""}</textarea>
  
                  <div class="modal-actions">
                      <button type="submit">Save</button>
                      <button type="button" id="close-modal">Cancel</button>
                  </div>
              </form>
          </div>
      `;

        document.body.appendChild(modal);

        const categoryDropdown = modal.querySelector("#product-category");
        const subCategoryDropdown = modal.querySelector("#product-sub-category");

        function populateSubCategories() {
            const selectedCategoryId = categoryDropdown.value;
            const filteredSubCategories = subCategories.filter(sub => sub.category_id === selectedCategoryId);
            subCategoryDropdown.innerHTML = `
                <option value="">Select Sub-Category</option>
                ${filteredSubCategories.map(sub => `<option value="${sub.id}" ${sub.id === product.sub_category_id ? "selected" : ""}>${sub.name}</option>`).join("")}
            `;
        }

        categoryDropdown.addEventListener("change", populateSubCategories);
        populateSubCategories(product.category_id);

        modal.querySelector("#close-modal").addEventListener("click", () => modal.remove());

        modal.querySelector("#modal-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData();
        formData.append("name", modal.querySelector("#product-name").value);
        formData.append("price", modal.querySelector("#product-price").value);
        formData.append("stock", modal.querySelector("#product-stock").value);
        formData.append("discount", modal.querySelector("#product-discount").value);
        formData.append("category_id", modal.querySelector("#product-category").value);
        formData.append("sub_category_id", modal.querySelector("#product-sub-category").value);
        formData.append("description", modal.querySelector("#product-description").value);

        const imageFile = modal.querySelector("#product-image").files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        await onSave(formData, product.id);
        modal.remove();
        });
    }

    // **7. Fungsi Tambah Produk**
    async function createProduct(formData) {
      formData.append("seller_id", userId);
  
      try {
          const response = await fetch(productsApi, {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
              body: formData,
          });
  
          if (!response.ok) throw new Error("Failed to create product");
  
          const result = await response.json();
          Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Product created successfully!',
          });
          fetchProducts();
      } catch (error) {
          console.error("Error adding product:", error);
      }
  }

       // **8. Fungsi Update Produk**
       async function updateProduct(formData, productId) {
        try {
            const response = await fetch(`${productsApi}/${productId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData,
            });
    
            if (!response.ok) throw new Error("Failed to update product");
    
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Product updated successfully!',
            });
            fetchProducts();
        } catch (error) {
            console.error("Error updating product:", error);
        }
    }

  // **9. Fungsi Delete Produk**
  async function deleteProduct(productId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`${productsApi}/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Failed to delete product");

        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Product deleted successfully!',
        });
        fetchProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

    // **10. Event Listener untuk Edit dan Delete**
    function attachEventListeners() {
      document.querySelectorAll(".edit-btn").forEach(btn => {
          btn.addEventListener("click", async () => {
              const productId = btn.dataset.id;
              try {
                  // Fetch produk berdasarkan ID
                  const response = await fetch(`${productsApi}?user_id=${userId}`);
                  if (!response.ok) throw new Error("Failed to fetch product data");
  
                  const result = await response.json();
                  const products = result.data || [];
                  const product = products.find(p => p.id === productId);
  
                  if (!product) {
                      Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: 'Product not found!',
                      });
                      return;
                  }
  
                  // Buka modal edit dengan data produk
                  openModal("Edit Product", product, updateProduct);
              } catch (error) {
                  console.error("Error fetching product for editing:", error);
              }
          });
      });
  
      // **2. Tambahkan event listener untuk tombol Delete**
      document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", async () => {
              deleteProduct(btn.dataset.id);
          });
      });
  }

  await fetchCategories();
  fetchProducts();
});
