let cart = [];
let customers = [];
let products = [];
let orders = [];
let selectedCustomer = null;
let editingItem = null;
let modalType = '';

function loadData() {
    customers = JSON.parse(localStorage.getItem('grillmaster_customers')) || [];
    products = JSON.parse(localStorage.getItem('grillmaster_products')) || defaultProducts;
    orders = JSON.parse(localStorage.getItem('grillmaster_orders')) || [];
    saveData();
}

function saveData() {
    localStorage.setItem('grillmaster_customers', JSON.stringify(customers));
    localStorage.setItem('grillmaster_products', JSON.stringify(products));
    localStorage.setItem('grillmaster_orders', JSON.stringify(orders));
}

function init() {
    loadData();           // products now has defaultProducts if localStorage empty
    setupEventListeners();
    renderProducts();     // now products exist
    renderCustomers();
    renderProductsManagement();
    renderOrders();
    updateCustomerSelect();
    updateCart();
}
function setupEventListeners() {
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mainNav').classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    document.getElementById('customerSelect').addEventListener('change', (e) => {
        const customerId = parseInt(e.target.value);
        selectedCustomer = customers.find(c => c.id === customerId) || null;
    });

    document.getElementById('addCustomerBtn').addEventListener('click', () => openModal('customer'));
    document.getElementById('addProductBtn').addEventListener('click', () => openModal('product'));

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}
function switchTab(tabName) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');

    document.getElementById('mainNav').classList.remove('active');
}
function renderProductsManagement() {
    const grid = document.getElementById('productsManagementGrid');
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-orders-message">No products yet</p>';
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="item-card product-management-card">
            <div class="product-management-image-wrapper">
                <img src="${p.image}" alt="${p.name}" class="product-management-image">
            </div>
            <h3 class="item-name">${p.name}</h3>
            <p class="product-category">${p.category}</p>
            <p class="product-management-price">$${p.price.toFixed(2)}</p>
            <div class="product-management-actions">
                <button class="icon-btn" onclick="openModal('product', ${p.id})">✏️</button>
                <button class="icon-btn" onclick="deleteProduct(${p.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const imagePath = document.getElementById('productImagePath').value.trim();
    const imageData = document.getElementById('productImageData').value;
    if (!name || !category || !price) return alert('Please fill all required fields');

    const product = {
        id: editingItem?.id || Date.now(),
        name,
        category,
        price,
        image: imageData || imagePath
    };

    if (editingItem) {
        const index = products.findIndex(p => p.id === editingItem.id);
        products[index] = product;
    } else products.push(product);

    saveData();
    renderProducts();
    renderProductsManagement();
    closeModal();
}

function deleteProduct(id) {
    if (!confirm('Are you sure?')) return;
    products = products.filter(p => p.id !== id);
    saveData();
    renderProducts();
    renderProductsManagement();
}
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) item.quantity = newQuantity;
    }
    updateCart();
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const totalAmountSpan = document.getElementById('totalAmount');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart-message">Cart is empty</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="updateQuantity(${item.id}, 0)">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmountSpan.textContent = `$${total.toFixed(2)}`;
}

function clearCart() {
    cart = [];
    updateCart();
}

function placeOrder() {
    if (cart.length === 0) return alert('Cart is empty!');
    if (!selectedCustomer) return alert('Please select a customer!');

    const order = {
        id: Date.now(),
        customer: selectedCustomer,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
        date: new Date().toISOString(),
    };

    orders.unshift(order);
    saveData();
    cart = [];
    selectedCustomer = null;
    document.getElementById('customerSelect').value = '';
    updateCart();
    renderOrders();
    alert('Order placed successfully!');
}

function updateCustomerSelect() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = '<option value="">-- Choose Customer --</option>' +
        customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderCustomers() {
    const grid = document.getElementById('customersGrid');
    if (customers.length === 0) {
        grid.innerHTML = '<p class="empty-orders-message">No customers yet</p>';
        return;
    }

    grid.innerHTML = customers.map(c => `
        <div class="item-card">
            <div class="item-header">
                <h3 class="item-name">${c.name}</h3>
                <div class="item-actions">
                    <button class="icon-btn" onclick="openModal('customer', ${c.id})">✏️</button>
                    <button class="icon-btn" onclick="deleteCustomer(${c.id})">🗑️</button>
                </div>
            </div>
            <div class="item-details">
                <p>📞 ${c.phone}</p>
                <p>✉️ ${c.email}</p>
            </div>
        </div>
    `).join('');
}

function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    if (!name || !phone || !email) return alert('Please fill all fields');

    const customer = { id: editingItem?.id || Date.now(), name, phone, email };
    if (editingItem) {
        const index = customers.findIndex(c => c.id === editingItem.id);
        customers[index] = customer;
    } else customers.push(customer);

    saveData();
    renderCustomers();
    updateCustomerSelect();
    closeModal();
}

function deleteCustomer(id) {
    if (!confirm('Are you sure?')) return;
    customers = customers.filter(c => c.id !== id);
    saveData();
    renderCustomers();
    updateCustomerSelect();
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-orders-message">No orders yet</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p>Customer: ${order.customer.name}</p>
                    <p>${new Date(order.date).toLocaleString()}</p>
                </div>
                <div class="order-total-section">
                    <p class="order-total">$${order.total}</p>
                    <button onclick="deleteOrder(${order.id})">Delete Order</button>
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `<div class="order-item">${item.name} x${item.quantity} - $${(item.price*item.quantity).toFixed(2)}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function deleteOrder(id) {
    if (!confirm('Are you sure?')) return;
    orders = orders.filter(o => o.id !== id);
    saveData();
    renderOrders();
}

function handleImageSelect(input) {
    const preview = document.getElementById('imagePreview');
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" class="image-preview">`;
        document.getElementById('productImageData').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

function openModal(type, itemId = null) {
    modalType = type;
    editingItem = null;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (type === 'customer') {
        editingItem = customers.find(c => c.id === itemId);
        title.textContent = editingItem ? 'Edit Customer' : 'Add Customer';
        body.innerHTML = `
            <input type="text" id="customerName" placeholder="Name" value="${editingItem?.name || ''}">
            <input type="tel" id="customerPhone" placeholder="Phone" value="${editingItem?.phone || ''}">
            <input type="email" id="customerEmail" placeholder="Email" value="${editingItem?.email || ''}">
            <div class="form-actions">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveCustomer()">${editingItem ? 'Update' : 'Create'}</button>
            </div>`;
    } else if (type === 'product') {
        editingItem = products.find(p => p.id === itemId);
        title.textContent = editingItem ? 'Edit Product' : 'Add Product';
        const imagePreview = editingItem?.image ? `<img src="${editingItem.image}" class="image-preview">` : '<p>No image</p>';
        body.innerHTML = `
            <input type="text" id="productName" placeholder="Name" value="${editingItem?.name || ''}">
            <select id="productCategory">
                <option value="">Select</option>
                <option value="Burgers" ${editingItem?.category === 'Burgers' ? 'selected' : ''}>Burgers</option>
                <option value="Fries" ${editingItem?.category === 'Fries' ? 'selected' : ''}>Fries</option>
                <option value="Drinks" ${editingItem?.category === 'Drinks' ? 'selected' : ''}>Drinks</option>
            </select>
            <input type="number" id="productPrice" placeholder="Price" value="${editingItem?.price || ''}">
            <input type="text" id="productImagePath" placeholder="Image Path" value="${editingItem?.image || ''}">
            <input type="file" id="productImageFile" onchange="handleImageSelect(this)">
            <div id="imagePreview">${imagePreview}</div>
            <input type="hidden" id="productImageData">
            <div class="form-actions">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveProduct()">${editingItem ? 'Update' : 'Create'}</button>
            </div>`;
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    editingItem = null;
}

function loadData() {
    const savedProducts = localStorage.getItem('grillmaster_products');
    products = savedProducts ? JSON.parse(savedProducts) : [...defaultProducts]; // <-- important
}

document.addEventListener('DOMContentLoaded', init);
