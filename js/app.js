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
