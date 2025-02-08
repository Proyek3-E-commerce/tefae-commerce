let cartItems = [];

const fetchCartItems = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User is not authenticated");

        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.user_id;

        const response = await fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/cart?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();
        cartItems = data.products;

        renderCartItems(cartItems);
        updateTotal();
    } catch (error) {
        console.error("Error fetching cart items:", error.message);
        document.getElementById("product-list").innerHTML = "<p>Failed to load cart items.</p>";
    }
};

const renderCartItems = (items) => {
    const productList = document.getElementById("product-list");
    if (items.length === 0) {
        productList.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    productList.innerHTML = items
        .map((item) => {
            const discount = item.discount || 0; // Pastikan diskon ada
            const discountedPrice = item.price * (1 - discount / 100);
            return `
                <div class="product-item">
                    <img src="https://tefae-commerce-2c0fdca4d608.herokuapp.com/${item.image.replace("./", "")}" alt="${item.name}">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p>Price: <del>Rp.${item.price.toLocaleString()}</del> Rp.${discountedPrice.toLocaleString()}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Total: Rp.${(discountedPrice * item.quantity).toLocaleString()}</p>
                    </div>
                </div>
            `;
        })
        .join("");
};


const updateTotal = () => {
    const shippingCost = parseInt(document.getElementById("shipping").value);
    const total = cartItems.reduce((sum, item) => {
        const discount = item.discount || 0; // Pastikan diskon ada
        const discountedPrice = item.price * (1 - discount / 100);
        return sum + discountedPrice * item.quantity;
    }, 0) + shippingCost;

    document.getElementById("total-price").textContent = total.toLocaleString();
};


const processPayment = async () => {
    const token = localStorage.getItem("token"); 
    if (!token) {
        alert("Please log in to proceed with payment.");
        return;
    }

    const shippingAddress = document.getElementById("shipping-address").value;
    const shippingCost = parseInt(document.getElementById("shipping").value);
    const totalAmount = cartItems.reduce((sum, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return sum + discountedPrice * item.quantity;
    }, 0) + shippingCost;

    if (!shippingAddress) {
        alert("Please enter your shipping address.");
        return;
    }

    const userId = JSON.parse(atob(token.split(".")[1])).user_id;

    try {
        const response = await fetch(`https://tefae-commerce-2c0fdca4d608.herokuapp.com/payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
            body: JSON.stringify({
                user_id: userId,
                shipping: shippingAddress,
                amount: totalAmount,
                shipping_cost: shippingCost,
                items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    product_id: item.product_id,  // ✅ Fix! Pastikan `product_id` dikirim
                })),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to process payment");
        }

        const result = await response.json();
        window.location.href = result.redirect_url; // ✅ Redirect ke Midtrans
    } catch (error) {
        alert("Payment failed: " + error.message);
    }
};

document.addEventListener("DOMContentLoaded", fetchCartItems);
