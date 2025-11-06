// متغيرات عامة
let currentProduct = null;
let currentQuantity = 1;

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(productId);
    } else {
        showError('Product ID not found');
    }
    
    updateCartCount();
    updateWishlistCount();
});

// جلب بيانات المنتج
async function loadProduct(productId) {
    try {
        showLoading(true);
        
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();
        
        currentProduct = product;
        displayProduct(product);
        loadRelatedProducts(product.category);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details');
        showLoading(false);
    }
}

// عرض بيانات المنتج
function displayProduct(product) {
    // تحديث العنوان والـ breadcrumb
    document.title = `${product.title} - Furniro`;
    document.getElementById('breadcrumb-product').textContent = product.title;
    
    // الصور
    displayProductImages(product.images);
    
    // المعلومات الأساسية
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('full-description').textContent = product.description;
    
    // التقييم
    displayRating(product.rating);
    
    // السعر
    displayPrice(product);
    
    // تفاصيل المنتج
    document.getElementById('product-brand').textContent = product.brand || 'No Brand';
    document.getElementById('product-stock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
    document.getElementById('product-sku').textContent = product.sku || 'N/A';
    document.getElementById('product-weight').textContent = product.weight ? `${product.weight}g` : 'N/A';
    
    // تحديث حالة wishlist
    updateWishlistButton();
    
    // إظهار المحتوى
    document.getElementById('product-details').style.display = 'block';
}

// عرض صور المنتج
function displayProductImages(images) {
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    
    if (images && images.length > 0) {
        mainImage.src = images[0];
        
        thumbnailContainer.innerHTML = images.map((image, index) => `
            <div class="col-3">
                <img src="${image}" 
                     class="img-fluid rounded thumbnail-img ${index === 0 ? 'border border-warning' : ''}" 
                     style="height: 80px; object-fit: cover; cursor: pointer;"
                     onclick="changeMainImage('${image}', this)">
            </div>
        `).join('');
    }
}

// تغيير الصورة الرئيسية
function changeMainImage(imageSrc, thumbnail) {
    document.getElementById('main-image').src = imageSrc;
    
    // إزالة الحدود من جميع الصور المصغرة
    document.querySelectorAll('.thumbnail-img').forEach(img => {
        img.classList.remove('border', 'border-warning');
    });
    
    // إضافة الحدود للصورة المحددة
    thumbnail.classList.add('border', 'border-warning');
}

// عرض التقييم
function displayRating(rating) {
    const ratingContainer = document.getElementById('product-rating');
    const ratingText = document.getElementById('rating-text');
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star"></i>';
    }
    
    ratingContainer.innerHTML = stars;
    ratingText.textContent = `(${rating} rating)`;
}

// عرض السعر
function displayPrice(product) {
    const priceElement = document.getElementById('product-price');
    const originalPriceElement = document.getElementById('original-price');
    const discountBadge = document.getElementById('discount-badge');
    
    priceElement.textContent = `$${product.price}`;
    
    if (product.discountPercentage > 0) {
        const originalPrice = (product.price / (1 - product.discountPercentage/100)).toFixed(2);
        originalPriceElement.textContent = `$${originalPrice}`;
        originalPriceElement.style.display = 'inline';
        
        discountBadge.textContent = `${Math.round(product.discountPercentage)}% OFF`;
        discountBadge.style.display = 'inline';
    }
}

// تغيير الكمية
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let newQuantity = parseInt(quantityInput.value) + change;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > currentProduct.stock) newQuantity = currentProduct.stock;
    if (newQuantity > 10) newQuantity = 10;
    
    quantityInput.value = newQuantity;
    currentQuantity = newQuantity;
}

// إضافة للسلة
function addToCart() {
    if (!currentProduct) return;
    
    if (currentProduct.stock <= 0) {
        showNotification('Sorry, this product is out of stock!', 'error', currentProduct.title);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + currentQuantity;
        if (newQuantity > currentProduct.stock) {
            showNotification('Cannot add more items. Stock limit reached!', 'warning', currentProduct.title);
            return;
        }
        existingItem.quantity = newQuantity;
    } else {
        cart.push({
            id: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            image: currentProduct.thumbnail,
            quantity: currentQuantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Added to cart!', 'success', currentProduct.title);
}

// تبديل wishlist
function toggleWishlist() {
    if (!currentProduct) return;
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingIndex = wishlist.findIndex(item => item.id === currentProduct.id);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Removed from wishlist!', 'info', currentProduct.title);
    } else {
        wishlist.push({
            id: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            image: currentProduct.thumbnail
        });
        showNotification('Added to wishlist!', 'wishlist', currentProduct.title);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateWishlistButton();
}

// تحديث زر wishlist
function updateWishlistButton() {
    if (!currentProduct) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.some(item => item.id === currentProduct.id);
    
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistIcon = document.getElementById('wishlist-icon');
    
    if (isInWishlist) {
        wishlistBtn.classList.remove('btn-outline-danger');
        wishlistBtn.classList.add('btn-danger');
        wishlistIcon.className = 'bi bi-heart-fill';
    } else {
        wishlistBtn.classList.remove('btn-danger');
        wishlistBtn.classList.add('btn-outline-danger');
        wishlistIcon.className = 'bi bi-heart';
    }
}

// نسخ الرابط
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    });
}

// جلب المنتجات ذات الصلة
async function loadRelatedProducts(category) {
    try {
        const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=4`);
        const data = await response.json();
        
        const relatedProducts = data.products.filter(p => p.id !== currentProduct.id).slice(0, 4);
        displayRelatedProducts(relatedProducts);
        
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// عرض المنتجات ذات الصلة
function displayRelatedProducts(products) {
    const container = document.getElementById('related-products');
    
    container.innerHTML = products.map(product => `
        <div class="col-lg-3 col-md-6">
            <div class="card product-card h-100 border-0 shadow-sm">
                <div class="position-relative overflow-hidden">
                    <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.7); opacity: 0; transition: all 0.3s;">
                        <a href="product.html?id=${product.id}" class="btn btn-warning btn-sm">
                            <i class="bi bi-eye me-1"></i>View Details
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <h6 class="card-title">${product.title}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h6 text-warning mb-0">$${product.price}</span>
                        <div class="text-warning">
                            ${generateStars(product.rating)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// إنشاء النجوم
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill"></i>';
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star"></i>';
    }
    
    return stars;
}

// تحديث عداد السلة
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// تحديث عداد wishlist
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'inline' : 'none';
    }
}

// إظهار/إخفاء التحميل
function showLoading(show) {
    const loading = document.getElementById('loading');
    const productDetails = document.getElementById('product-details');
    
    if (show) {
        loading.style.display = 'block';
        productDetails.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// إظهار خطأ
function showError(message) {
    const container = document.querySelector('.container.py-5');
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
            <h4 class="text-muted">${message}</h4>
            <a href="shop.html" class="btn btn-warning mt-3">Back to Shop</a>
        </div>
    `;
}

// إظهار الإشعار
function showNotification(message, type = 'success', productTitle = '') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon, displayMessage;
    if (type === 'success') {
        icon = 'check-circle-fill';
        displayMessage = message || 'Added to cart!';
    } else if (type === 'wishlist') {
        icon = 'heart-fill';
        displayMessage = message || 'Added to wishlist!';
    } else if (type === 'info') {
        icon = 'info-circle-fill';
        displayMessage = message || 'Removed from wishlist!';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle-fill';
        displayMessage = message;
    } else if (type === 'error') {
        icon = 'x-circle-fill';
        displayMessage = message;
    } else {
        icon = 'check-circle-fill';
        displayMessage = message;
    }
    
    notification.innerHTML = `
        <div class="d-flex align-items-center p-3">
            <i class="bi bi-${icon} me-3 fs-4"></i>
            <div class="flex-grow-1">
                ${productTitle ? `<strong>${productTitle}</strong>` : ''}
                <div class="small mt-1">${displayMessage}</div>
            </div>
        </div>
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: 100%"></div>
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

// تبديل الوضع المظلم
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// تحميل الثيم المحفوظ
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
});