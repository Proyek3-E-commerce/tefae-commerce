// manage_product.js

const addProductButton = document.getElementById('add-product');
const productTable = document.querySelector('.product-table tbody');

// Function to dynamically add a new product row
function addProductRow(id, name, price, stock) {
  const newRow = document.createElement('tr');

  newRow.innerHTML = `
    <td>${id}</td>
    <td>${name}</td>
    <td>Rp ${price.toLocaleString()}</td>
    <td>${stock}</td>
    <td>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </td>
  `;

  productTable.appendChild(newRow);
}

// Handle Add Product button
addProductButton.addEventListener('click', () => {
  const id = prompt('Enter Product ID:');
  const name = prompt('Enter Product Name:');
  const price = parseFloat(prompt('Enter Product Price (numeric):'));
  const stock = parseInt(prompt('Enter Product Stock (numeric):'), 10);

  if (id && name && !isNaN(price) && !isNaN(stock)) {
    addProductRow(id, name, price, stock);
    alert('Product added successfully!');
  } else {
    alert('Invalid input. Please try again.');
  }
});

// Handle Edit and Delete buttons
productTable.addEventListener('click', (event) => {
  const target = event.target;

  if (target.classList.contains('edit-btn')) {
    const row = target.closest('tr');
    const productId = row.children[0].textContent;
    const productName = prompt('Edit Product Name:', row.children[1].textContent);
    const productPrice = parseFloat(prompt('Edit Product Price:', row.children[2].textContent.replace('Rp ', '').replace(/,/g, '')));
    const productStock = parseInt(prompt('Edit Product Stock:', row.children[3].textContent), 10);

    if (productName && !isNaN(productPrice) && !isNaN(productStock)) {
      row.children[1].textContent = productName;
      row.children[2].textContent = `Rp ${productPrice.toLocaleString()}`;
      row.children[3].textContent = productStock;
      alert('Product updated successfully!');
    } else {
      alert('Invalid input. Please try again.');
    }
  }

  if (target.classList.contains('delete-btn')) {
    const row = target.closest('tr');
    const productId = row.children[0].textContent;
    const productName = row.children[1].textContent;

    const confirmDelete = confirm(`Are you sure you want to delete Product ID: ${productId} - ${productName}?`);
    if (confirmDelete) {
      row.remove();
      alert('Product has been deleted.');
    }
  }
});
