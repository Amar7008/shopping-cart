class Cart {
    static async addItem(productData) {
        try {
            console.log('Adding product:', productData); // Debug log
            
            const response = await fetch('add-to-cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(productData)
            });
    
            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Response data:', data); // Debug log
            
            // ... rest of the method
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    static async updateItem(productId, quantity) {
        try {
            const response = await fetch('update-cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    product_id: productId,
                    quantity: quantity,
                    action: 'update_quantity'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateCartDisplay(data);
                this.showNotification(data.message || 'Cart updated');
                return true;
            } else {
                throw new Error(data.message || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    static async removeItem(productId) {
        try {
            const response = await fetch('update-cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    product_id: productId,
                    action: 'remove_item'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateCartDisplay(data);
                this.showNotification(data.message || 'Item removed from cart');
                return true;
            } else {
                throw new Error(data.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    static updateCartDisplay(data) {
        this.updateCartCount(data.cart_count);

        const cartContainer = document.getElementById('cart-items-container');
        const checkoutBtn = document.getElementById('checkout-btn');
        const subtotal = document.getElementById('subtotal');
        const tax = document.getElementById('tax');
        const total = document.getElementById('total');

        if (cartContainer) {
            if (data.cart_count === 0) {
                cartContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                        <p class="text-lg text-gray-600 mb-4">Your cart is empty</p>
                        <a href="index.php" class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                            Continue Shopping
                        </a>
                    </div>
                `;
                if (checkoutBtn) checkoutBtn.disabled = true;
            }

            if (data.cart_total) {
                const calculatedTax = (parseFloat(data.cart_total) * 0.08).toFixed(2);
                if (subtotal) subtotal.textContent = `$${data.cart_total}`;
                if (tax) tax.textContent = `$${calculatedTax}`;
                if (total) total.textContent = `$${(parseFloat(data.cart_total) + parseFloat(calculatedTax)).toFixed(2)}`;
            }
        }
    }

    static updateCartCount(count) {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    // Add to cart buttons
    document.addEventListener('click', function (e) {
        if (e.target.closest('.add-to-cart')) {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            const productData = {
                product_id: productCard.dataset.productId,
                product_name: productCard.querySelector('.product-name').textContent,
                product_price: productCard.querySelector('.product-price').textContent.replace('$', ''),
                product_image: productCard.querySelector('.product-image')?.src || ''
            };
            Cart.addItem(productData);
        }
    });

    // Cart page specific events
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        // Quantity buttons
        document.addEventListener('click', function (e) {
            const itemElement = e.target.closest('.cart-item');
            if (!itemElement) return;

            const productId = itemElement.dataset.productId;
            const quantityInput = itemElement.querySelector('.quantity-input');

            if (e.target.closest('.increase-quantity')) {
                quantityInput.value = parseInt(quantityInput.value) + 1;
                Cart.updateItem(productId, quantityInput.value);
            } else if (e.target.closest('.decrease-quantity')) {
                const newQuantity = parseInt(quantityInput.value) - 1;
                if (newQuantity > 0) {
                    quantityInput.value = newQuantity;
                    Cart.updateItem(productId, newQuantity);
                } else {
                    Cart.removeItem(productId);
                    itemElement.classList.add('cart-item-removed');
                    setTimeout(() => itemElement.remove(), 300);
                }
            } else if (e.target.closest('.remove-item')) {
                Cart.removeItem(productId);
                itemElement.classList.add('cart-item-removed');
                setTimeout(() => itemElement.remove(), 300);
            }
        });

        // Manual input
        document.addEventListener('change', function (e) {
            if (e.target.classList.contains('quantity-input')) {
                const itemElement = e.target.closest('.cart-item');
                const productId = itemElement?.dataset.productId;
                const newQuantity = parseInt(e.target.value);

                if (newQuantity > 0) {
                    Cart.updateItem(productId, newQuantity);
                } else {
                    Cart.removeItem(productId);
                    itemElement.classList.add('cart-item-removed');
                    setTimeout(() => itemElement.remove(), 300);
                }
            }
        });
    }

    // Update cart count on page load
    if (window.cartCount != null) {
        Cart.updateCartCount(cartCount);
    }
});
