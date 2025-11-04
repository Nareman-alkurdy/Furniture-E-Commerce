// Fixed shop page with filters
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Load all products
async function loadAllProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=100');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = allProducts;
        loadCategories();
        displayCurrentPage();
        updatePaginationControls();
    } catch (error) {
        document.getElementById('product-list').innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading products</div></div>';
    }
}

// Display current page products
function displayCurrentPage() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    currentProducts.forEach(product => {
        const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
        const isInWishlist = wishlist.some(item => item.id === product.id);
        
        container.innerHTML += `
            <div class="col-lg-${12/currentGridCols} col-md-6 col-sm-6">
                <div class="card h-100 border-0 shadow-sm product-card">
                    <div class="position-relative overflow-hidden">
                        <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 250px; object-fit: cover;">
                        ${product.discountPercentage > 0 ? `
                            <span class="badge bg-danger position-absolute top-0 start-0 m-2">-${Math.round(product.discountPercentage)}%</span>
                        ` : ''}
                        <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s;">
                            <a href="product.html?id=${product.id}" class="btn btn-warning btn-lg px-4">
                                <i class="bi bi-eye me-2"></i>View Details
                            </a>
                        </div>
                    </div>
                    
                    <div class="card-body p-3">
                        <div class="mb-2">
                            <span class="badge bg-light text-dark text-uppercase small">${product.category}</span>
                        </div>
                        <h6 class="card-title fw-bold">${product.title}</h6>
                        <p class="text-muted small mb-3">${product.description.substring(0, 50)}...</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="price-section">
                                ${product.discountPercentage > 0 ? `
                                    <span class="h6 text-warning fw-bold mb-0">$${discountedPrice}</span>
                                    <small class="text-muted text-decoration-line-through ms-1">$${product.price}</small>
                                ` : `
                                    <span class="h6 text-warning fw-bold mb-0">$${product.price}</span>
                                `}
                            </div>
                            <div class="rating">
                                <small class="text-muted">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    ${product.rating}
                                </small>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-warning flex-grow-1 btn-sm" onclick="addToCart(${product.id}, '${product.title}', ${product.discountPercentage > 0 ? discountedPrice : product.price}, '${product.thumbnail}')">
                                <i class="bi bi-cart-plus me-1"></i>Add to Cart
                            </button>
                            <button class="btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'} btn-sm" onclick="toggleWishlist(${product.id}, '${product.title}', ${product.price}, '${product.thumbnail}')">
                                <i class="bi bi-heart${isInWishlist ? '-fill' : ''}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    updateProductCount();
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('https://dummyjson.com/products/categories');
        const categories = await response.json();
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Filter and sort products
function filterAndSortProducts() {
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    // Filter by category
    if (category) {
        filteredProducts = allProducts.filter(p => p.category === category);
    } else {
        filteredProducts = [...allProducts];
    }
    
    // Sort products
    if (sort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    
    currentPage = 1;
    displayCurrentPage();
    updatePaginationControls();
}

// Set grid view
function setGridView(cols) {
    currentGridCols = cols;
    document.querySelectorAll('.btn-group button').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    displayCurrentPage();
}

// Update product count
function updateProductCount() {
    const startIndex = (currentPage - 1) * productsPerPage + 1;
    const endIndex = Math.min(currentPage * productsPerPage, filteredProducts.length);
    document.getElementById('productCount').textContent = 
        `Showing ${startIndex}-${endIndex} of ${filteredProducts.length} products`;
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    updateProductCount();
}

// Next page function
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPage();
        updatePaginationControls();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Previous page function
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayCurrentPage();
        updatePaginationControls();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Show notification
function showCartNotification(title, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'wishlist' ? 'info' : 'warning'} position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    
    let message = '';
    if (type === 'success') message = `${title} added to cart!`;
    else if (type === 'wishlist') message = `${title} added to wishlist!`;
    else message = `${title} removed from wishlist!`;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-check-circle me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Cart functions
function addToCart(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, image, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartNotification(title, 'success');
}

// Wishlist functions
function toggleWishlist(id, title, price, image) {
    const existingIndex = wishlist.findIndex(item => item.id === id);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showCartNotification(title, 'info');
    } else {
        wishlist.push({ id, title, price, image });
        showCartNotification(title, 'wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayCurrentPage(); // Refresh to update heart icons
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
        document.getElementById('langBtn').textContent = 'AR';
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
        langBtn.textContent = savedLang === 'ar' ? 'English' : 'AR';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    loadAllProducts();
    
    // Event listeners
    document.getElementById('categoryFilter').addEventListener('change', filterAndSortProducts);
    document.getElementById('sortFilter').addEventListener('change', filterAndSortProducts);
});