const cart = [];
const cartCountEl = document.querySelector('.cart-count');
const cartIcon = document.getElementById('cart-icon');

document.querySelectorAll('.card').forEach((card) => {
    const addButton = card.querySelector('.add-btn');
    const select = card.querySelector('select');
    const title = card.querySelector('h3').innerText;
    const priceText = card.querySelector('.price').innerText;
    const price = parseFloat(priceText.replace('$', ''));
    const shippingText = card.querySelector('.shipping')?.innerText;
    const shipping = shippingText ? parseFloat(shippingText.replace(/[^\d.]/g, '')) : 0;

    addButton.addEventListener('click', () => {
        const quantity = parseInt(select.value);

        // Add item to cart
        cart.push({
            title,
            price,
            shipping,
            quantity
        });

        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;

        // Trigger animation
        cartIcon.classList.add('animate');
        setTimeout(() => cartIcon.classList.remove('animate'), 300);
    });
});

// Navigate to checkout with cart data
cartIcon.addEventListener('click', () => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cart))));
    window.location.href = `checkout.html?cart=${encoded}`;
});
