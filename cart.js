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
        displayCart();
    }
}

// حذف منتج من السلة
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    
    // إشعار الحذف
    const notification = document.createElement('div');
    notification.className = 'alert alert-info position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = '<i class="bi bi-info-circle me-2"></i>Item removed from cart';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// تحميل السلة عند فتح الصفحة
document.addEventListener('DOMContentLoaded', displayCart);