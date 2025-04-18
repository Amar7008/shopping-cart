document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize cart count
        updateCartCount();

        // Add event listener for "Add to Cart" buttons
        document.addEventListener('click', function(e) {
            if (e.target && e.target.matches('.add-to-cart')) {
                try {
                    const productCard = e.target.closest('.product-card');
                    if (!productCard) {
                        throw new Error('Product card not found');
                    }

                    const product = {
                        id: productCard.dataset.productId,
                        name: productCard.querySelector('.product-name').textContent,
                        price: productCard.querySelector('.product-price').textContent.replace('$', ''),
                        image: productCard.querySelector('.product-image').src
                    };

                    if (!product.id || !product.name || !product.price || !product.image) {
                        throw new Error('Missing product data');
                    }

                    addToCart(product);
                } catch (error) {
                    console.error('Error adding product to cart:', error);
                    alert('Error adding product to cart. Please try again.');
                }
            }
        });
    } catch (error) {
        console.error('Error initializing product listener:', error);
    }
}); 