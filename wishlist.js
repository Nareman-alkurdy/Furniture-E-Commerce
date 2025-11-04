// Get wishlist from localStorage
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Display wishlist items
function displayWishlist() {
    const wishlistContent = document.getElementById('wishlist-content');
    const emptyWishlist = document.getElementById('empty-wishlist');
    
    if (wishlist.length === 0) {
        wishlistContent.style.display = 'none';
        emptyWishlist.style.display = 'block';
        return;
    }
    
    wishlistContent.style.display = 'block';
    emptyWishlist.style.display = 'none';
    
    wishlistContent.innerHTML = `
        <div class="row g-4">
            ${wishlist.map(item => `
                <div class="col-lg-3 col-md-4 col-sm-6" id="wishlist-item-${item.id}">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="position-relative">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">
                            <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="removeFromWishlist(${item.id})">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                        <div class="card-body text-center">
                            <h6 class="card-title fw-bold mb-2">${item.title}</h6>
                            <p class="text-warning fw-bold mb-3">$${item.price}</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-warning" onclick="addToCartFromWishlist(${item.id}, '${item.title}', ${item.price}, '${item.image}')">
                                    <i class="bi bi-cart-plus me-2"></i>Add to Cart
                                </button>
                                <a href="product.html?id=${item.id}" class="btn btn-outline-secondary">
                                    <i class="bi bi-eye me-2"></i>View Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Remove from wishlist
function removeFromWishlist(id) {
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = '<i class="bi bi-info-circle me-2"></i>Item removed from wishlist';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Add to cart from wishlist
function addToCartFromWishlist(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, image, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `<i class="bi bi-check-circle me-2"></i>${title} added to cart!`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize wishlist display
document.addEventListener('DOMContentLoaded', displayWishlist);