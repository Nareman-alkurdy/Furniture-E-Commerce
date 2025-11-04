// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Wishlist management
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch and display product details
async function fetchProductDetails() {
    console.log('Product ID:', productId);
    
    if (!productId) {
        document.getElementById('loading').innerHTML = '<div class="alert alert-danger">Product not found</div>';
        return;
    }

    try {
        console.log('Fetching product:', `https://dummyjson.com/products/${productId}`);
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product data:', product);
        
        displayProduct(product);
        loadRelatedProducts(product.category);
    } catch (error) {
        console.error('Error fetching product:', error);
        document.getElementById('loading').innerHTML = '<div class="alert alert-danger">Error loading product: ' + error.message + '</div>';
    }
}

// Display product details
function displayProduct(product) {
    console.log('Displaying product:', product.title);
    
    const loadingElement = document.getElementById('loading');
    const detailsElement = document.getElementById('product-details');
    const breadcrumbElement = document.getElementById('breadcrumb-product');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (detailsElement) detailsElement.style.display = 'block';
    if (breadcrumbElement) breadcrumbElement.textContent = product.title;
    
    const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    document.getElementById('product-details').innerHTML = `
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="product-gallery">
                    <img src="${product.thumbnail}" class="img-fluid rounded shadow main-image mb-3" alt="${product.title}">
                    <div class="row g-2">
                        ${(product.images && product.images.length > 0 ? product.images.slice(0, 4) : [product.thumbnail]).map(img => `
                            <div class="col-3">
                                <img src="${img}" class="img-fluid rounded thumbnail-img" alt="${product.title}" onclick="changeMainImage('${img}')">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6">
                <div class="product-info">
                    <nav aria-label="breadcrumb" class="mb-3">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                            <li class="breadcrumb-item"><a href="#">${product.category}</a></li>
                            <li class="breadcrumb-item active">${product.title}</li>
                        </ol>
                    </nav>
                    
                    <h1 class="mb-3">${product.title}</h1>
                    
                    <div class="rating mb-3">
                        ${generateStars(product.rating)}
                        <span class="ms-2 text-muted">(${product.rating}/5)</span>
                    </div>
                    
                    <div class="price-section mb-4">
                        ${product.discountPercentage > 0 ? `
                            <span class="h3 text-warning fw-bold">$${discountedPrice}</span>
                            <span class="text-decoration-line-through text-muted ms-2 h5">$${product.price}</span>
                            <span class="badge bg-danger ms-2">${Math.round(product.discountPercentage)}% OFF</span>
                        ` : `
                            <span class="h3 text-warning fw-bold">$${product.price}</span>
                        `}
                    </div>
                    
                    <p class="product-description mb-4">${product.description}</p>
                    
                    <div class="product-meta mb-4">
                        <div class="row">
                            <div class="col-6">
                                <strong>Category:</strong> <span class="badge bg-light text-dark">${product.category || 'N/A'}</span>
                            </div>
                            <div class="col-6">
                                <strong>Brand:</strong> ${product.brand || 'N/A'}
                            </div>
                            <div class="col-6 mt-2">
                                <strong>Stock:</strong> 
                                <span class="${(product.stock || 0) > 10 ? 'text-success' : 'text-warning'}">${product.stock || 0} items</span>
                            </div>
                            <div class="col-6 mt-2">
                                <strong>SKU:</strong> ${product.sku || product.id || 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="quantity-section mb-4">
                        <label class="form-label fw-semibold">Quantity:</label>
                        <div class="input-group" style="width: 150px;">
                            <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(-1)">-</button>
                            <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="${product.stock || 99}">
                            <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(1)">+</button>
                        </div>
                    </div>
                    
                    <div class="action-buttons mb-4">
                        <button class="btn btn-warning btn-lg me-3" onclick="addToCart(${product.id}, '${product.title}', ${product.discountPercentage > 0 ? discountedPrice : product.price}, '${product.thumbnail}')">
                            <i class="bi bi-cart-plus me-2"></i>Add to Cart
                        </button>
                        <button class="btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleWishlist(${product.id}, '${product.title}', ${product.price}, '${product.thumbnail}')">
                            <i class="bi bi-heart${isInWishlist ? '-fill' : ''} me-2"></i>${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </button>
                    </div>
                    
                    <div class="product-tabs">
                        <ul class="nav nav-tabs" id="productTabs">
                            <li class="nav-item">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#description">Description</button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#reviews">Reviews</button>
                            </li>
                        </ul>
                        <div class="tab-content mt-3">
                            <div class="tab-pane fade show active" id="description">
                                <p>${product.description}</p>
                                <p>This premium ${product.category} item features excellent craftsmanship and modern design.</p>
                            </div>
                            <div class="tab-pane fade" id="reviews">
                                <div class="review-summary mb-3">
                                    <h6>Customer Reviews (${product.rating}/5)</h6>
                                    ${generateStars(product.rating)}
                                </div>
                                <div class="review-item border-bottom pb-3 mb-3">
                                    <div class="d-flex justify-content-between">
                                        <strong>John D.</strong>
                                        <div>${generateStars(5)}</div>
                                    </div>
                                    <p class="mt-2 mb-0">Excellent quality and fast delivery. Highly recommended!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Change main image
function changeMainImage(imageSrc) {
    document.querySelector('.main-image').src = imageSrc;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half text-warning"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star text-warning"></i>';
    }
    
    return stars;
}

// Change quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const newValue = currentValue + change;
    
    if (newValue >= 1 && newValue <= parseInt(quantityInput.max)) {
        quantityInput.value = newValue;
    }
}

// Add to cart
function addToCart(id, title, price, image) {
    const quantity = parseInt(document.getElementById('quantity').value);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, title, price, image, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${title} added to cart!`, 'success');
}

// Toggle wishlist
function toggleWishlist(id, title, price, image) {
    const existingIndex = wishlist.findIndex(item => item.id === id);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification(`${title} removed from wishlist!`, 'info');
    } else {
        wishlist.push({ id, title, price, image });
        showNotification(`${title} added to wishlist!`, 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    fetchProductDetails(); // Refresh to update button
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `<i class="bi bi-check-circle me-2"></i>${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Search functionality
function toggleSearch() {
    const popup = document.getElementById('searchPopup');
    popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
    if (popup.style.display === 'flex') {
        document.getElementById('searchInput').focus();
    }
}

async function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    try {
        const response = await fetch(`https://dummyjson.com/products/search?q=${query}`);
        const data = await response.json();
        displaySearchResults(data.products);
    } catch (error) {
        document.getElementById('searchResults').innerHTML = '<div class="alert alert-danger">Search failed</div>';
    }
}

function displaySearchResults(products) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (products.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-info">No products found</div>';
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-list">
            ${products.slice(0, 5).map(product => `
                <div class="search-result-item d-flex align-items-center p-2 border-bottom">
                    <img src="${product.thumbnail}" class="me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${product.title}</h6>
                        <small class="text-muted">$${product.price}</small>
                    </div>
                    <a href="product.html?id=${product.id}" class="btn btn-sm btn-outline-warning">View</a>
                </div>
            `).join('')}
        </div>
    `;
}

// Load related products
async function loadRelatedProducts(category) {
    try {
        const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=4`);
        const data = await response.json();
        displayRelatedProducts(data.products.filter(p => p.id != productId));
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products
function displayRelatedProducts(products) {
    const container = document.getElementById('related-products');
    container.innerHTML = products.slice(0, 4).map(product => `
        <div class="col-lg-3 col-md-6">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body text-center">
                    <h6 class="card-title">${product.title}</h6>
                    <p class="text-warning fw-bold">$${product.price}</p>
                    <a href="product.html?id=${product.id}" class="btn btn-outline-warning btn-sm">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Dark Mode & Language Toggle
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const darkModeBtn = document.getElementById('darkModeBtn');
    darkModeBtn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
}

function toggleLanguage() {
    const currentLang = document.documentElement.getAttribute('lang');
    
    if (currentLang === 'en') {
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
        document.getElementById('langBtn').textContent = 'English';
    } else {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
        document.getElementById('langBtn').textContent = 'عربي';
    }
    
    localStorage.setItem('language', document.documentElement.getAttribute('lang'));
    localStorage.setItem('direction', document.documentElement.getAttribute('dir'));
}

// Load saved preferences
function loadPreferences() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLang = localStorage.getItem('language') || 'en';
    const savedDir = localStorage.getItem('direction') || 'ltr';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('lang', savedLang);
    document.documentElement.setAttribute('dir', savedDir);
    
    const darkModeBtn = document.getElementById('darkModeBtn');
    const langBtn = document.getElementById('langBtn');
    
    if (darkModeBtn) {
        darkModeBtn.innerHTML = savedTheme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
    }
    
    if (langBtn) {
        langBtn.textContent = savedLang === 'ar' ? 'English' : 'عربي';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    fetchProductDetails();
});