document.getElementById('paymentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const grossAmount = document.getElementById('grossAmount').value;
    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const paymentData = {
        gross_amount: parseInt(grossAmount),
        customer_details: {
            first_name: firstName,
            email: email,
            phone: phone
        }
    };

    console.log('Payment Data:', paymentData);

    // Kirim data ke server menggunakan fetch atau AJAX
    fetch('https://glowing-02bd61cbeff9.herokuapp.com/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        // Mengganti alert dengan SweetAlert
        Swal.fire({
            title: 'Success!',
            text: 'Payment successful!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    })
    .catch(error => {
        console.error('Error:', error);
        // Mengganti alert dengan SweetAlert
        Swal.fire({
            title: 'Error!',
            text: 'Payment failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
});