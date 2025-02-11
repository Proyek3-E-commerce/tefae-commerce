document.addEventListener("DOMContentLoaded", () => {
    // Menangani klik pada tombol "Beli Sekarang"
    const buyButtons = document.querySelectorAll(".product-button");
    buyButtons.forEach(button => {
      button.addEventListener("click", () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Produk telah ditambahkan ke keranjang!',
        });
      });
    });
  
    // Menangani klik pada tombol "Tambah Produk"
    const addProductButton = document.querySelector(".btn");
    addProductButton.addEventListener("click", () => {
      Swal.fire({
        title: 'Tambah Produk',
        html: `
          <input type="text" id="product-name" class="swal2-input" placeholder="Nama Produk">
          <input type="number" id="product-price" class="swal2-input" placeholder="Harga Produk">
          <input type="number" id="product-quantity" class="swal2-input" placeholder="Jumlah Produk">
        `,
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById('product-name').value;
          const price = document.getElementById('product-price').value;
          const quantity = document.getElementById('product-quantity').value;
  
          if (!name || !price || !quantity) {
            Swal.showValidationMessage('Semua field harus diisi!');
          }
  
          return { name, price, quantity };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Simulasi menambahkan produk
          Swal.fire({
            icon: 'success',
            title: 'Produk Ditambahkan!',
            text: `Nama: ${result.value.name}, Harga: Rp ${result.value.price}, Jumlah: ${result.value.quantity}`,
          });
        }
      });
    });
  });