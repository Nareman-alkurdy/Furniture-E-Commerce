
function displayProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  
  products.forEach(product => {
    const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
    
    container.innerHTML += `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="card h-100 border-0 shadow-sm product-card">
          <div class="position-relative overflow-hidden">
            <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 250px; object-fit: cover; transition: transform 0.3s;">
            ${product.discountPercentage > 0 ? `
              <span class="badge bg-gradient bg-danger position-absolute top-0 start-0 m-3 px-3 py-2">
                -${Math.round(product.discountPercentage)}%
              </span>
            ` : ''}
            <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s;">
              <a href="product.html?id=${product.id}" class="btn btn-warning btn-lg px-4">
                <i class="bi bi-eye me-2"></i>View Details
              </a>
            </div>
          </div>
          
          <div class="card-body p-4">
            <div class="mb-2">
              <span class="badge bg-light text-dark text-uppercase small">${product.category}</span>
            </div>
            <h5 class="card-title fw-bold mb-3">${product.title}</h5>
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="price-section">
                ${product.discountPercentage > 0 ? `
                  <span class="h5 text-warning fw-bold mb-0">$${discountedPrice}</span>
                  <small class="text-muted text-decoration-line-through ms-2">$${product.price}</small>
                ` : `
                  <span class="h5 text-warning fw-bold mb-0">$${product.price}</span>
                `}
              </div>
              <div class="rating">
                <small class="text-muted">
                  <i class="bi bi-star-fill text-warning"></i>
                  ${product.rating || '4.5'}
                </small>
              </div>
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-outline-warning flex-grow-1" onclick="addToCart(${product.id}, '${product.title}', ${product.discountPercentage > 0 ? discountedPrice : product.price}, '${product.thumbnail}')">
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
              <button class="btn btn-outline-danger" onclick="toggleWishlistFromHome(${product.id}, '${product.title}', ${product.price}, '${product.thumbnail}')">
                <i class="bi bi-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}


// Load only 8 products for home page
fetch('https://dummyjson.com/products?limit=8')
  .then(res => res.json())
  .then(data => {
    displayProducts(data.products);
    setTimeout(updateWishlistButtons, 100);
  })
  .catch(error => console.error('خطأ في جلب المنتجات:', error));


// جلب وعرض الأقسام
fetch('https://dummyjson.com/products/categories')
  .then(res => res.json())
  .then(categories => {
    displayCategories(categories);
  })
  .catch(error => console.error('خطأ في جلب الأقسام:', error));

// عرض الأقسام في كاروسيل
function displayCategories(categories) {
  const container = document.getElementById('categories-list');
  const itemsPerSlide = 6;
  const slides = [];
  
  for (let i = 0; i < categories.length; i += itemsPerSlide) {
    const slideCategories = categories.slice(i, i + itemsPerSlide);
    const slideHTML = `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="row g-4">
          ${slideCategories.map(category => `
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="category-card text-center p-4 border rounded shadow-sm h-100" onclick="filterByCategory('${category.slug}')">
                <div class="category-icon mb-3">
                  <i class="bi bi-house-door fs-1 text-warning"></i>
                </div>
                <h6 class="fw-bold">${category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h6>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    slides.push(slideHTML);
  }
  
  container.innerHTML = slides.join('');
}

// فلترة حسب القسم
function filterByCategory(categorySlug) {
  const url = `https://dummyjson.com/products/category/${categorySlug}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      displayProducts(data.products);
      setTimeout(updateWishlistButtons, 100);
    })
    .catch(error => console.error('خطأ في الفلترة:', error));
}



// نظام السلة
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// إضافة منتج للسلة
function addToCart(id, title, price, image) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      title: title,
      price: price,
      image: image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showCartNotification(title, 'success');
}

// تحديث عدد المنتجات في السلة
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartLink = document.querySelector('a[href="cart.html"]');
  
  if (!cartLink) return;
  
  // إزالة العداد القديم إن وجد
  const oldBadge = cartLink.querySelector('.cart-badge');
  if (oldBadge) oldBadge.remove();
  
  // إضافة العداد الجديد
  if (totalItems > 0) {
    const badge = document.createElement('span');
    badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge';
    badge.textContent = totalItems;
    badge.style.fontSize = '0.7rem';
    cartLink.appendChild(badge);
  }
}

// إشعار محسن مع شريط تقدم
function showCartNotification(productTitle, type = 'success') {
  const notification = document.createElement('div');
  notification.className = 'notification';
  
  let icon, message;
  if (type === 'success') {
    icon = 'check-circle-fill';
    message = 'Added to cart!';
  } else if (type === 'wishlist') {
    icon = 'heart-fill';
    message = 'Added to wishlist!';
  } else if (type === 'remove') {
    icon = 'check-circle-fill';
    message = 'Removed from wishlist!';
  } else {
    icon = 'exclamation-circle-fill';
    message = 'Action completed';
  }
  
  notification.innerHTML = `
    <div class="d-flex align-items-center p-3">
      <i class="bi bi-${icon} me-3 fs-4"></i>
      <div class="flex-grow-1">
        <strong>${productTitle}</strong>
        <div class="small mt-1">${message}</div>
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

// Wishlist management for home page
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlistFromHome(id, title, price, image) {
  const existingIndex = wishlist.findIndex(item => item.id === id);
  
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    showCartNotification(title, 'remove');
  } else {
    wishlist.push({ id, title, price, image });
    showCartNotification(title, 'wishlist');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistButtons();
  updateWishlistCount();
}

// Update wishlist count
function updateWishlistCount() {
  const totalItems = wishlist.length;
  const wishlistLink = document.querySelector('a[href="wishlist.html"]');
  
  if (!wishlistLink) return;
  
  // Remove old badge
  const oldBadge = wishlistLink.querySelector('.wishlist-badge');
  if (oldBadge) oldBadge.remove();
  
  // Add new badge
  if (totalItems > 0) {
    const badge = document.createElement('span');
    badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger wishlist-badge';
    badge.textContent = totalItems;
    badge.style.fontSize = '0.7rem';
    wishlistLink.appendChild(badge);
  }
}

function updateWishlistButtons() {
  // Update heart icons based on wishlist status
  document.querySelectorAll('[onclick*="toggleWishlistFromHome"]').forEach(button => {
    const productId = parseInt(button.getAttribute('onclick').match(/\d+/)[0]);
    const heartIcon = button.querySelector('i');
    
    if (wishlist.some(item => item.id === productId)) {
      heartIcon.className = 'bi bi-heart-fill';
      button.classList.remove('btn-outline-danger');
      button.classList.add('btn-danger');
    } else {
      heartIcon.className = 'bi bi-heart';
      button.classList.remove('btn-danger');
      button.classList.add('btn-outline-danger');
    }
  });
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
  const currentDir = document.documentElement.getAttribute('dir');
  
  if (currentLang === 'en') {
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
    document.getElementById('langBtn').textContent = 'EN';
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
    langBtn.textContent = savedLang === 'ar' ? 'EN' : 'AR';
  }
}

// تحديث العداد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
  updateCartCount();
  updateWishlistButtons();
  updateWishlistCount();
});