// جلب السلة من التخزين المحلي
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// عرض محتويات السلة
function displayCart() {
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    
    if (cart.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }
    
    cartContent.style.display = 'block';
    emptyCart.style.display = 'none';
    
    let total = 0;
    
    cartContent.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Cart Items</h5>
                    </div>
                    <div class="card-body">
                        ${cart.map(item => {
                            const itemTotal = (item.price * item.quantity);
                            total += itemTotal;
                            
                            return `
                                <div class="row align-items-center border-bottom py-3" id="item-${item.id}">
                                    <div class="col-md-2">
                                        <img src="${item.image}" class="img-fluid rounded" alt="${item.title}">
                                    </div>
                                    <div class="col-md-4">
                                        <h6 class="mb-1">${item.title}</h6>
                                        <small class="text-muted">$${item.price}</small>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="input-group">
                                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                            <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <strong>$${itemTotal.toFixed(2)}</strong>
                                    </div>
                                    <div class="col-md-1">
                                        <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${item.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Order Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping:</span>
                            <span>$10.00</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong>Total:</strong>
                            <strong>$${(total + 10).toFixed(2)}</strong>
                        </div>
                        <button class="btn btn-warning w-100 mb-2">Proceed to Checkout</button>
                        <a href="index.html" class="btn btn-outline-secondary w-100">Continue Shopping</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// تحديث الكمية
function updateQuantity(id, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(id);
        return;
    }
    
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateItemDisplay(id);
        updateOrderSummary();
    }
}

// تحديث عرض منتج واحد
function updateItemDisplay(id) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    const itemElement = document.getElementById(`item-${id}`);
    if (itemElement) {
        const quantityInput = itemElement.querySelector('input[type="text"]');
        const totalElement = itemElement.querySelector('.col-md-2 strong');
        const minusBtn = itemElement.querySelector('button[onclick*="-"]');
        const plusBtn = itemElement.querySelector('button[onclick*="+"]');
        
        quantityInput.value = item.quantity;
        totalElement.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
        
        minusBtn.setAttribute('onclick', `updateQuantity(${id}, ${item.quantity - 1})`);
        plusBtn.setAttribute('onclick', `updateQuantity(${id}, ${item.quantity + 1})`);
    }
}

// تحديث ملخص الطلب
function updateOrderSummary() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalElement = document.querySelector('.card-body .d-flex:nth-child(1) span:last-child');
    const totalElement = document.querySelector('.card-body .d-flex:nth-child(3) strong:last-child');
    
    if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${(total + 10).toFixed(2)}`;
}

// حذف منتج من السلة
function removeFromCart(id) {
    const item = cart.find(item => item.id === id);
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // إزالة العنصر من العرض بدلاً من إعادة تحميل الصفحة
    const itemElement = document.getElementById(`item-${id}`);
    if (itemElement) {
        itemElement.remove();
    }
    
    // تحديث ملخص الطلب
    updateOrderSummary();
    updateCounters();
    
    // فحص إذا كانت السلة فارغة
    if (cart.length === 0) {
        document.getElementById('cart-content').style.display = 'none';
        document.getElementById('empty-cart').style.display = 'block';
    }
    
    // إشعار الحذف المحسن
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center p-3">
            <i class="bi bi-trash-fill me-3 fs-4" style="color: #dc3545;"></i>
            <div class="flex-grow-1">
                <strong>${item ? item.title : 'Product'}</strong>
                <div class="small mt-1">Removed from cart!</div>
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

// تحديث العدادات
function updateCounters() {
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'inline' : 'none';
    }
    
    if (wishlistCount) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'inline' : 'none';
    }
}

// تحميل السلة عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    updateCounters();
});