// Ambil elemen-elemen yang relevan
const relatedProducts = document.querySelectorAll('.related-product-card');
const productDetail = document.querySelector('.product-detail');
const productImage = productDetail.querySelector('.product-image');
const productTitle = productDetail.querySelector('.product-title');
const productPrice = productDetail.querySelector('.product-price');
const productDescription = productDetail.querySelector('p:nth-of-type(1)');

// Data produk (bisa diambil dari API, di sini hardcoded sebagai contoh)
const products = [
  {
    image: 'images/product-02.jpg',
    title: 'Serum',
    price: 'Rp 149.000',
    description: 'Mengatasi masalah kulit tertentu seperti jerawat, penuaan, atau kulit kusam.'
  },
  {
    image: 'images/product-03.jpg',
    title: 'Facial Wash',
    price: 'Rp 52.900',
    description: 'Membersihkan kotoran, minyak, dan sisa makeup dari kulit.'
  },
  {
    image: 'images/product-04.jpg',
    title: 'Eye Mask',
    price: 'Rp 79.000',
    description: 'Mengurangi kantung mata, lingkaran hitam, dan garis halus.'
  }
];

// Fungsi untuk menampilkan detail produk
function showProductDetail(product) {
  productImage.src = product.image;
  productTitle.textContent = product.title;
  productPrice.textContent = product.price;
  productDescription.textContent = product.description;

  // Scroll ke atas untuk menampilkan detail produk
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tambahkan event listener ke setiap produk terkait
relatedProducts.forEach((productCard, index) => {
  productCard.addEventListener('click', () => {
    showProductDetail(products[index]);
  });
});
