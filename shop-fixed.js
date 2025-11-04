// Fixed shop page with filters
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;

// Load all products
async function loadAllProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=100');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = allProducts;
        loadCategories();
        showCurrentPage();
        updatePagination();
    } catch (error) {
        document.getElementById('product-list').innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading products</div></div>';
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('https://dummyjson.com/products/categories');
        const categories = await response.json();
        const select = document.getElementById('categoryFilter');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Show current page products
function showCurrentPage() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const products = filteredProducts.slice(start, end);
    
    const html = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100">
                <img src="${product.thumbnail}" class="card-img-top" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <span class="badge bg-light text-dark mb-2">${product.category}</span>
                    <h6 class="card-title">${product.title}</h6>
                    <p class="text-warning fw-bold">$${product.price}</p>
                    <div class="d-flex gap-2">
                        <a href="product.html?id=${product.id}" class="btn btn-warning btn-sm flex-grow-1">View</a>
                        <button class="btn btn-outline-danger btn-sm" onclick="addToWishlist(${product.id})">
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('product-list').innerHTML = html;
    updateProductCount();
}

// Filter products
function filterProducts() {
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
    showCurrentPage();
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

// Update product count
function updateProductCount() {
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, filteredProducts.length);
    document.getElementById('productCount').textContent = `Showing ${start}-${end} of ${filteredProducts.length} products`;
}

// Next page
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        showCurrentPage();
        updatePagination();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

// Previous page
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        showCurrentPage();
        updatePagination();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

// Add to wishlist (simple)
function addToWishlist(id) {
    alert('Added to wishlist!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    
    // Add event listeners
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('sortFilter').addEventListener('change', filterProducts);
});