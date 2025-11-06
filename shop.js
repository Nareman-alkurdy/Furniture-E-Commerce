// متغيرات عامة
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentView = 'grid';

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromAPI();
    updateCartCount();
    updateWishlistCount();
});

// جلب المنتجات من API
async function loadProductsFromAPI() {
    try {
        showLoading(true);
        const response = await fetch('https://dummyjson.com/products?limit=100');
        const data = await response.json();
        
        // تحويل بيانات API لتناسب التطبيق
        allProducts = data.products.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.thumbnail,
            images: product.images,
            category: product.category,
            rating: product.rating,
            description: product.description,
            brand: product.brand,
            stock: product.stock,
            discountPercentage: product.discountPercentage
        }));
        
        filteredProducts = [...allProducts];
        
        loadCategories();
        displayProducts();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.');
        showLoading(false);
    }
}

// إظهار/إخفاء حالة التحميل
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
}

// إظهار رسالة خطأ
function showError(message) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
            <h4 class="text-muted">${message}</h4>
            <button class="btn btn-warning mt-3" onclick="loadProductsFromAPI()">Try Again</button>
        </div>
    `;
}

// تحميل الفئات
function loadCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// عرض المنتجات
function displayProducts() {
    const productsContainer = document.getElementById('products');
    const loadingState = document.getElementById('loadingState');
    const noResults = document.getElementById('noResults');
    
    // إخفاء حالة التحميل
    if (loadingState) loadingState.style.display = 'none';
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '';
        noResults.classList.remove('d-none');
        return;
    }
    
    noResults.classList.add('d-none');
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    productsContainer.innerHTML = productsToShow.map(product => `
        <div class="col-lg-4 col-md-6">
            <div class="card product-card h-100 border-0 shadow-sm">
                <div class="position-relative overflow-hidden">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 250px; object-fit: cover;">
                    ${product.discountPercentage > 0 ? 
                        `<span class="badge bg-danger position-absolute top-0 end-0 m-2">${Math.round(product.discountPercentage)}% OFF</span>` : ''}
                    <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.7); opacity: 0; transition: all 0.3s;">
                        <div class="text-center">
                            <button class="btn btn-warning btn-sm me-1" onclick="addToCart(${product.id})">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                            <button class="btn btn-outline-light btn-sm me-1" onclick="toggleWishlist(${product.id})">
                                <i class="bi ${isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                            </button>
                            <button class="btn btn-outline-light btn-sm" onclick="viewProduct(${product.id})">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <span class="badge bg-light text-dark small">${product.category}</span>
                    </div>
                    <h5 class="card-title mb-2">${product.title}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="h5 text-warning mb-0">$${product.price}</span>
                        </div>
                        <div class="text-warning">
                            ${generateStars(product.rating)}
                            <small class="text-muted">(${product.rating})</small>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-warning btn-sm flex-grow-1" onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus me-1"></i>Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="toggleWishlist(${product.id})">
                            <i class="bi ${isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    updatePagination();
}

// إنشاء النجوم
function generateStars(rating) {
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
    
    return stars;
}

// تصفية المنتجات
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
        const matchesSearch = !searchTerm || 
            product.title.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm));
        
        let matchesPrice = true;
        if (priceRange) {
            if (priceRange === '0-100') matchesPrice = product.price <= 100;
            else if (priceRange === '100-500') matchesPrice = product.price > 100 && product.price <= 500;
            else if (priceRange === '500-1000') matchesPrice = product.price > 500 && product.price <= 1000;
            else if (priceRange === '1000+') matchesPrice = product.price > 1000;
        }
        
        return matchesCategory && matchesSearch && matchesPrice;
    });
    
    currentPage = 1;
    displayProducts();
}

// ترتيب المنتجات
function sortProducts() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    displayProducts();
}

// البحث
function searchProducts() {
    filterProducts();
}

// مسح الفلاتر
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
}



// تحديث الصفحات
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const totalPagesSpan = document.getElementById('totalPages');
    
    pageInfo.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// الصفحة السابقة
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// الصفحة التالية
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// إضافة للسلة
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showNotification('Sorry, this product is out of stock!', 'error', product.title);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification('Cannot add more items. Stock limit reached!', 'warning', product.title);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Added to cart!', 'success', product.title);
}

// إضافة/إزالة من الـ wishlist
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Removed from wishlist!', 'success', product.title);
    } else {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            wishlist.push(product);
            showNotification('Added to wishlist!', 'wishlist', product.title);
        }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    displayProducts(); // إعادة عرض المنتجات لتحديث أيقونة القلب
}

// فحص إذا كان المنتج في الـ wishlist
function isInWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.some(item => item.id === productId);
}

// تحديث عداد الـ wishlist
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'inline' : 'none';
    }
}

// عرض المنتج
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
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

// إظهار الإشعار المحسن
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

// تبديل البحث السريع
function toggleSearch() {
    const searchPopup = document.getElementById('searchPopup');
    if (searchPopup.style.display === 'flex') {
        searchPopup.style.display = 'none';
    } else {
        searchPopup.style.display = 'flex';
        document.getElementById('quickSearchInput').focus();
    }
}

// البحث السريع
function quickSearch() {
    const searchTerm = document.getElementById('quickSearchInput').value.toLowerCase();
    const results = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    const resultsContainer = document.getElementById('quickSearchResults');
    
    if (searchTerm === '') {
        resultsContainer.innerHTML = '';
        return;
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted text-center py-3">No products found</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.slice(0, 5).map(product => `
        <div class="search-result-item p-3 border-bottom" onclick="viewProduct(${product.id})">
            <div class="d-flex align-items-center">
                <img src="${product.image}" class="me-3 rounded" style="width: 50px; height: 50px; object-fit: cover;">
                <div>
                    <h6 class="mb-1">${product.title}</h6>
                    <small class="text-muted">$${product.price}</small>
                </div>
            </div>
        </div>
    `).join('');
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

// تبديل عرض الشبكة/القائمة
function toggleView(viewType) {
    currentView = viewType;
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    if (viewType === 'grid') {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    }
    
    displayProducts();
}

// تحميل الثيم المحفوظ
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
});