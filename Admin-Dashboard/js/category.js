document.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector(".accordion");
  const addCategoryBtn = document.getElementById("add-category-btn");
  const addSubCategoryBtn = document.getElementById(
    "add-sub-category-btn"
  );
  const categoryModal = document.getElementById("category-modal");
  const subCategoryModal = document.getElementById("sub-category-modal");
  const editCategoryModal = document.getElementById(
    "edit-category-modal"
  );
  const editSubCategoryModal = document.getElementById(
    "edit-sub-category-modal"
  );
  const closeCategoryModalBtn = document.getElementById(
    "close-category-modal"
  );
  const closeSubCategoryModalBtn = document.getElementById(
    "close-sub-category-modal"
  );
  const closeEditCategoryModalBtn = document.getElementById(
    "close-edit-category-modal"
  );
  const closeEditSubCategoryModalBtn = document.getElementById(
    "close-edit-sub-category-modal"
  );
  const categoryForm = document.getElementById("category-form");
  const subCategoryForm = document.getElementById("sub-category-form");
  const editCategoryForm = document.getElementById("edit-category-form");
  const editSubCategoryForm = document.getElementById(
    "edit-sub-category-form"
  );
  const categoryNameInput = document.getElementById("category-name");
  const subCategoryNameInput =
    document.getElementById("sub-category-name");
  const categoryDropdown = document.getElementById("category-dropdown");
  const editCategoryNameInput =
    document.getElementById("edit-category-name");
  const editSubCategoryCategoryNameInput = document.getElementById(
    "edit-sub-category-category-name"
  );
  const editSubCategoryNameInput = document.getElementById(
    "edit-sub-category-name"
  );
  const searchInput = document.getElementById("search-input");

  const API_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/categories";
  const API_SUBCATEGORY_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/categories/sub";
  let categories = [];

  const openModal = (modal) => {
    modal.classList.remove("hidden");
  };

  const closeModal = (modal) => {
    modal.classList.add("hidden");
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL);
      const { data } = await response.json();
      categories = data;
      renderCategories();
      populateCategoryDropdown();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const renderCategories = () => {
    accordion.innerHTML = categories
      .map((category) => {
        const subCategories = Array.isArray(category.sub_categories)
          ? category.sub_categories
              .map(
                (sub) => `
                      <li>
                        ${sub.name}
                        <button class="icon-btn edit-sub" data-id="${sub.id}" data-category-id="${category.id}">✏️</button>
                        <button class="icon-btn delete-sub" data-id="${sub.id}" data-category-id="${category.id}">🗑️</button>
                      </li>
                    `
              )
              .join("")
          : "<li>None</li>";

        return `
              <div class="accordion-item">
                <div class="accordion-header">
                  <h3>${category.name}</h3>
                  <div>
                    <button class="icon-btn edit-category" data-id="${category.id}">✏️</button>
                    <button class="icon-btn delete-category" data-id="${category.id}">🗑️</button>
                  </div>
                </div>
                <div class="accordion-content">
                  <ul>${subCategories}</ul>
                </div>
              </div>
            `;
      })
      .join("");

    addAccordionListeners();
  };

  const populateCategoryDropdown = () => {
    categoryDropdown.innerHTML =
      '<option value="" disabled selected>Select Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryDropdown.appendChild(option);
    });
  };

  const addAccordionListeners = () => {
    document.querySelectorAll(".accordion-header").forEach((header) => {
      header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const isOpen = content.style.display === "block";

        document
          .querySelectorAll(".accordion-content")
          .forEach((content) => {
            content.style.display = "none";
          });

        if (!isOpen) content.style.display = "block";
      });
    });

    accordion.querySelectorAll(".edit-category").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openEditCategoryModal(id);
      })
    );

    accordion.querySelectorAll(".edit-sub").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const categoryId = btn.dataset.categoryId;
        openEditSubCategoryModal(id, categoryId);
      })
    );

    accordion.querySelectorAll(".delete-category").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
      
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
            await deleteCategory(id);
          }
        })
      );

    accordion.querySelectorAll(".delete-sub").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const categoryId = btn.dataset.categoryId;
        if (
          confirm("Are you sure you want to delete this sub-category?")
        ) {
          await deleteSubCategory(id, categoryId);
        }
      })
    );
  };

  const openEditCategoryModal = (id) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    editCategoryNameInput.value = category.name;
    editCategoryForm.dataset.id = id;

    openModal(editCategoryModal);
  };

  const openEditSubCategoryModal = (subId, categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    const subCategory = category.sub_categories.find(
      (sub) => sub.id === subId
    );
    if (!subCategory) return;

    editSubCategoryCategoryNameInput.value = category.name;
    editSubCategoryNameInput.value = subCategory.name;
    editSubCategoryForm.dataset.categoryId = categoryId;
    editSubCategoryForm.dataset.subId = subId;

    openModal(editSubCategoryModal);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const name = categoryNameInput.value;

    if (
        categories.some(
            (cat) => cat.name.toLowerCase() === name.toLowerCase()
        )
    ) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Category already exists!',
        });
        return;
    }

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        // Menampilkan SweetAlert setelah kategori berhasil disimpan
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category saved successfully!',
        });

        closeModal(categoryModal);
        fetchCategories();
    } catch (error) {
        console.error("Error saving category:", error);
        // Menampilkan SweetAlert jika terjadi kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save category. Please try again.',
        });
    }
};

const saveSubCategory = async (e) => {
    e.preventDefault();
    const categoryId = categoryDropdown.value;
    const name = subCategoryNameInput.value;

    try {
        await fetch(API_SUBCATEGORY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: categoryId, name }),
        });

        // Menampilkan SweetAlert setelah subkategori berhasil disimpan
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Subcategory saved successfully!',
        });

        closeModal(subCategoryModal);
        fetchCategories();
    } catch (error) {
        console.error("Error saving subcategory:", error);
        // Menampilkan SweetAlert jika terjadi kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save subcategory. Please try again.',
        });
    }
};

const updateCategory = async (e) => {
    e.preventDefault();
    const id = editCategoryForm.dataset.id;
    const name = editCategoryNameInput.value;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        // Menampilkan SweetAlert setelah kategori berhasil diperbarui
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category updated successfully!',
        });

        closeModal(editCategoryModal);
        fetchCategories();
    } catch (error) {
        console.error("Error updating category:", error);
        // Menampilkan SweetAlert jika terjadi kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update category. Please try again.',
        });
    }
};

const updateSubCategory = async (e) => {
    e.preventDefault();
    const categoryId = editSubCategoryForm.dataset.categoryId;
    const subId = editSubCategoryForm.dataset.subId;
    const name = editSubCategoryNameInput.value;

    try {
        await fetch(`${API_SUBCATEGORY_URL}/${subId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: categoryId, name }),
        });

        // Menampilkan SweetAlert setelah subkategori berhasil diperbarui
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Subcategory updated successfully!',
        });

        closeModal(editSubCategoryModal);
        fetchCategories();
    } catch (error) {
        console.error("Error updating subcategory:", error);
        // Menampilkan SweetAlert jika terjadi kesalahan
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update subcategory. Please try again.',
        });
    }
};

  const deleteCategory = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const deleteSubCategory = async (subId, categoryId) => {
    await fetch(`${API_SUBCATEGORY_URL}/${subId}`, { method: "DELETE" });
    fetchCategories();
  };

  addCategoryBtn.addEventListener("click", () =>
    openModal(categoryModal)
  );
  addSubCategoryBtn.addEventListener("click", () =>
    openModal(subCategoryModal)
  );
  closeCategoryModalBtn.addEventListener("click", () =>
    closeModal(categoryModal)
  );
  closeSubCategoryModalBtn.addEventListener("click", () =>
    closeModal(subCategoryModal)
  );
  closeEditCategoryModalBtn.addEventListener("click", () =>
    closeModal(editCategoryModal)
  );
  closeEditSubCategoryModalBtn.addEventListener("click", () =>
    closeModal(editSubCategoryModal)
  );
  categoryForm.addEventListener("submit", saveCategory);
  subCategoryForm.addEventListener("submit", saveSubCategory);
  editCategoryForm.addEventListener("submit", updateCategory);
  editSubCategoryForm.addEventListener("submit", updateSubCategory);

  fetchCategories();
});
