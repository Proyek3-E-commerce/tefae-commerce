// Ambil token dari localStorage atau sessionStorage
const authToken = localStorage.getItem('authToken'); 

// Fetch produk dari API
fetch('https://glowing-02bd61cbeff9.herokuapp.com/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})
.then(response => response.json())
.then(data => {
  const products = data.data;
  const productList = document.getElementById('product-list');

  // Menambahkan produk ke halaman
  products.forEach(product => {
    const productItem = document.createElement('li');
    productItem.classList.add('product-item');

    const productCard = document.createElement('div');
    productCard.classList.add('product-card');

    const productImage = document.createElement('img');
    productImage.classList.add('product-image');
    productImage.src = product.image ? product.image : './assets/images/default-product.jpg';  // Default image jika image kosong
    productImage.alt = product.name;

    const productTitle = document.createElement('h2');
    productTitle.classList.add('product-title');
    productTitle.innerText = product.name;

    const productPrice = document.createElement('p');
    productPrice.classList.add('product-price');
    const discountedPrice = product.price * (1 - (product.discount / 100));
    productPrice.innerText = `Rp. ${discountedPrice.toLocaleString()}`;

    const addToCartButton = document.createElement('button');
    addToCartButton.classList.add('btn');
    addToCartButton.innerText = 'Add to Cart';

    // Menambahkan elemen ke dalam produk item
    productCard.appendChild(productImage);
    productCard.appendChild(productTitle);
    productCard.appendChild(productPrice);
    productCard.appendChild(addToCartButton);
    productItem.appendChild(productCard);

    productList.appendChild(productItem);
  });
})
.catch(error => {
  console.error('Error fetching products:', error);
});
