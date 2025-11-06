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
    const item = wishlist.find(item => item.id === id);
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
    updateCounters();
    
    // إشعار الحذف المحسن
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center p-3">
            <i class="bi bi-heart-break-fill me-3 fs-4" style="color: #dc3545;"></i>
            <div class="flex-grow-1">
                <strong>${item ? item.title : 'Product'}</strong>
                <div class="small mt-1">Removed from wishlist!</div>
            </div>
        </div>
        <div class="progress">
            <div class="progress-bar bg-danger" role="progressbar" style="width: 100%"></div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // عرض الإشعار مع تأثير الاهتزاز
    setTimeout(() => {
        notification.classList.add('show', 'delete');
    }, 100);
    
    // شريط التقدم
    const progressBar = notification.querySelector('.progress-bar');
    progressBar.style.transition = 'width 3s linear';
    setTimeout(() => progressBar.style.width = '0%', 200);
    
    // إزالة الإشعار
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
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
    updateCounters();
    
    // إشعار الإضافة المحسن
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center p-3">
            <i class="bi bi-cart-plus-fill me-3 fs-4" style="color: #28a745;"></i>
            <div class="flex-grow-1">
                <strong>${title}</strong>
                <div class="small mt-1">تم إضافة المنتج للسلة!</div>
            </div>
        </div>
        <div class="progress">
            <div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // عرض الإشعار
    setTimeout(() => notification.classList.add('show'), 100);
    
    // شريط التقدم
    const progressBar = notification.querySelector('.progress-bar');
    progressBar.style.transition = 'width 3s linear';
    setTimeout(() => progressBar.style.width = '0%', 200);
    
    // إزالة الإشعار
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// تحديث العدادات
function updateCounters() {
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'inline' : 'none';
    }
    
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'inline' : 'none';
    }
}

// Initialize wishlist display
document.addEventListener('DOMContentLoaded', () => {
    displayWishlist();
    updateCounters();
});