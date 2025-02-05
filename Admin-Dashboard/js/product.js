// product.js
const productForm = document.getElementById('product-form');
const productTable = document.getElementById('product-table').getElementsByTagName('tbody')[0];
let editingRow = null;

// Handle form submission to add or update product
productForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;

    if (editingRow) {
        // Update the existing row
        editingRow.cells[0].innerText = name;
        editingRow.cells[1].innerText = formatCurrency(price);
        editingRow.cells[2].innerText = category;

        // Reset editing mode
        editingRow = null;
        productForm.reset();
        document.querySelector('button').innerText = 'Add Product';
    } else {
        // Create new row
        const newRow = productTable.insertRow();
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${formatCurrency(price)}</td>
            <td>${category}</td>
            <td>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </td>
        `;

        // Add event listeners for editing and deleting
        addEventListeners(newRow);
        productForm.reset();
    }
});

// Add event listeners to edit and delete buttons
function addEventListeners(row) {
    const editBtn = row.querySelector('.edit');
    const deleteBtn = row.querySelector('.delete');

    // Edit functionality
    editBtn.addEventListener('click', function() {
        const cells = row.getElementsByTagName('td');
        document.getElementById('product-name').value = cells[0].innerText;
        document.getElementById('product-price').value = cells[1].innerText;
        document.getElementById('product-category').value = cells[2].innerText;

        // Set the row being edited
        editingRow = row;
        document.querySelector('button').innerText = 'Update Product';
    });

    // Delete functionality
    deleteBtn.addEventListener('click', function() {
        row.remove();
    });
}

// Function to format price as currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}
