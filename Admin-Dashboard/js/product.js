document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/products";
  const sellersUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/sellers";
  const categoriesUrl = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/categories";
  const productTable = document.querySelector("#product-table tbody");
  const productForm = document.getElementById("product-form");
  const storeSelect = document.getElementById("store-select");
  const categorySelect = document.getElementById("category-select");
  const subCategorySelect = document.getElementById(
    "sub-category-select"
  );
  const productImageInput = document.getElementById("product-image");
  const productImagePreview = document.getElementById("image-preview");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const editImageInput = document.getElementById("edit-image");
  const editImagePreview = document.getElementById("edit-image-preview");
  const editCategorySelect = document.getElementById("edit-category");
  const editSubCategorySelect =
    document.getElementById("edit-sub-category");
  const closeModalButton = document.getElementById("close-modal");

  let sellersMap = {};
  let categoriesMap = {};

  // Fetch sellers and populate dropdown
  async function fetchSellers() {
    try {
      const response = await fetch(sellersUrl);
      const { data: sellers } = await response.json();

      const approvedStores = sellers.filter(
        (seller) =>
          seller.store_status === "approved" &&
          seller.store_info?.store_name
      );

      approvedStores.forEach((store) => {
        sellersMap[store.id] = store.store_info.store_name;
        const option = document.createElement("option");
        option.value = store.id;
        option.textContent = store.store_info.store_name;
        storeSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  }

  // Fetch categories and populate dropdown
  async function fetchCategories() {
    try {
      const response = await fetch(categoriesUrl);
      const { data: categories } = await response.json();

      // Tambahkan kategori ke dropdown
      categories.forEach((category) => {
        categoriesMap[category.id] = category;
        const option = document.createElement("option");
        option.value = category.id; // Gunakan kunci 'id'
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

      // Event listener untuk memperbarui sub-kategori saat kategori dipilih
      categorySelect.addEventListener("change", () => {
        const selectedCategoryId = categorySelect.value;

        // Bersihkan sub-kategori sebelumnya
        subCategorySelect.innerHTML =
          '<option value="" disabled selected>Select Sub Category</option>';

        const selectedCategory = categoriesMap[selectedCategoryId];
        if (selectedCategory && selectedCategory.sub_categories) {
          selectedCategory.sub_categories.forEach((subCategory) => {
            const option = document.createElement("option");
            option.value = subCategory.id; // Gunakan kunci 'id' untuk sub-kategori
            option.textContent = subCategory.name;
            subCategorySelect.appendChild(option);
          });
        }
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Fetch and display products
  async function fetchProducts() {
    try {
      const response = await fetch(apiUrl);
      const { data: products } = await response.json();

      productTable.innerHTML = products
        .map((product) => {
          const storeName =
            sellersMap[product.seller_id] || "Unknown Store";

          const categoryName =
            categoriesMap[product.category_id]?.name ||
            "Unknown Category";

          const subCategoryName =
            categoriesMap[product.category_id]?.sub_categories?.find(
              (sub) => sub.id === product.sub_category_id
            )?.name || "Unknown Sub-Category";

          const imageUrl = product.image
            ? `https://tefae-commerce-2c0fdca4d608.herokuapp.com/${product.image.replace("./", "")}`
            : "./images/default-product.png";

          return `
            <tr>
              <td>${product.name}</td>
              <td>Rp.${product.price.toLocaleString()}</td>
              <td>${product.discount || "None"}%</td>
              <td>${storeName}</td>
              <td><img src="${imageUrl}" alt="Product Image" style="width: 50px; height: 50px; object-fit: cover;"></td>
              <td>${product.description || "No description"}</td>
              <td>${categoryName}</td>
              <td>${subCategoryName}</td>
              <td>
                <button class="edit-btn" data-id="${
                  product._id
                }">Edit</button>
                <button class="delete-btn" data-id="${
                  product._id
                }">Delete</button>
              </td>
            </tr>`;
        })
        .join("");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // Add new product
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("product-name").value;
    const price = document.getElementById("product-price").value;
    const discount = document.getElementById("product-discount").value || 0;
    const storeId = storeSelect.value;
    const categoryId = categorySelect.value;
    const subCategoryId = subCategorySelect.value;
    const description = document.getElementById("product-description").value;

    const imageFile = productImageInput.files[0];

    if (!name || !price || !storeId || !categoryId || !subCategoryId) {
        // Mengganti alert dengan SweetAlert
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please fill out all required fields.',
        });
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("discount", discount);
    formData.append("seller_id", storeId);
    formData.append("category_id", categoryId);
    formData.append("sub_category_id", subCategoryId);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response: ", errorData);
            // Mengganti alert dengan SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to add product: ${errorData.message || "Unknown error"}`,
            });
            return;
        }

        productForm.reset();
        productImagePreview.classList.add("hidden");
        // Mengganti alert dengan SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Product added successfully!',
        });
        fetchProducts();
    } catch (error) {
        console.error("Error adding product:", error);
        // Menampilkan SweetAlert untuk kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
});

  // Preview image for add product
  productImageInput.addEventListener("change", () => {
    const file = productImageInput.files[0];
    if (file) {
      productImagePreview.src = URL.createObjectURL(file);
      productImagePreview.classList.remove("hidden");
    }
  });

  // Edit product
  productTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const productId = e.target.dataset.id;

      try {
        // Fetch product details
        const response = await fetch(
          `https://tefae-commerce-2c0fdca4d608.herokuapp.com/products/${productId}`
        );
        const { product, store } = await response.json();

        // Populate form fields
        document.getElementById("edit-name").value = product.name;
        document.getElementById("edit-price").value = product.price;
        document.getElementById("edit-discount").value =
          product.discount || 0;
        document.getElementById("edit-description").value =
          product.description;

        // Set store info
        document.getElementById("edit-store-info").textContent =
          store.store_name;

        // Set category and sub-category
        await populateCategoryDropdown(
          product.category_id,
          product.sub_category_id
        );

        // Set image preview
        if (product.image) {
          editImagePreview.src = `https://tefae-commerce-2c0fdca4d608.herokuapp.com/${product.image.replace("./", "")}`;
          editImagePreview.classList.remove("hidden");
        }

        // Set product ID in modal for updates
        editModal.dataset.productId = productId;
        editModal.classList.remove("hidden");
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    }
  });

  // Populate categories and sub-categories
  async function populateCategoryDropdown(selectedCategoryId, selectedSubCategoryId) {
    try {
      const categoryResponse = await fetch(
        "https://tefae-commerce-2c0fdca4d608.herokuapp.com/categories"
      );
      const { data: categories } = await categoryResponse.json();

      categoriesMap = categories.reduce((map, category) => {
        map[category.id] = category;
        return map;
      }, {});

      // Populate category dropdown
      editCategorySelect.innerHTML =
        '<option value="" disabled>Select Category</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id; // Use ID instead of name
        option.textContent = category.name;
        if (category.id === selectedCategoryId) option.selected = true;
        editCategorySelect.appendChild(option);
      });

      // Populate sub-category dropdown based on selected category
      editCategorySelect.addEventListener("change", () => {
        const selectedCategoryId = editCategorySelect.value;
        const selectedCategory = categoriesMap[selectedCategoryId];

        editSubCategorySelect.innerHTML =
          '<option value="" disabled>Select Sub Category</option>';
        if (selectedCategory && selectedCategory.sub_categories) {
          selectedCategory.sub_categories.forEach((sub) => {
            const option = document.createElement("option");
            option.value = sub.id; // Use ID instead of name
            option.textContent = sub.name;
            if (sub.id === selectedSubCategoryId) option.selected = true;
            editSubCategorySelect.appendChild(option);
          });
        }
      });

      // Trigger sub-category population for the initial selection
      editCategorySelect.dispatchEvent(new Event("change"));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Close modal
  closeModalButton.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  // Save edited product
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = editModal.dataset.productId;
    const name = document.getElementById("edit-name").value;
    const price = document.getElementById("edit-price").value;
    const discount = document.getElementById("edit-discount").value || 0;
    const description = document.getElementById("edit-description").value;
    const categoryId = editCategorySelect.value;
    const subCategoryId = editSubCategorySelect.value;

    const imageFile = document.getElementById("edit-image").files[0];
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("discount", discount);
    formData.append("description", description);
    formData.append("category_id", categoryId); // Use category ID
    formData.append("sub_category_id", subCategoryId); // Use sub-category ID

    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const response = await fetch(
            `https://tefae-commerce-2c0fdca4d608.herokuapp.com/products/${productId}`,
            {
                method: "PUT",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response: ", errorData);
            // Mengganti alert dengan SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to update product: ${errorData.message || "Unknown error"}`,
            });
            return;
        }

        editModal.classList.add("hidden");
        // Mengganti alert dengan SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Product updated successfully!',
        });
        fetchProducts();
    } catch (error) {
        console.error("Error updating product:", error);
        // Menampilkan SweetAlert untuk kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
});

  // Delete product
  productTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const productId = e.target.dataset.id;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this product?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${apiUrl}/${productId}`, {
                    method: "DELETE",
                });

                // Mengganti alert dengan SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Product deleted successfully!',
                });
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                // Menampilkan SweetAlert untuk kesalahan
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete product. Please try again.',
                });
            }
        }
    }
});

  async function initialize() {
    await fetchSellers();
    await fetchCategories();
    fetchProducts();
  }

  initialize();
});