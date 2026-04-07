// Database & Core State
let returnsDatabase = [
    {
        id: "RET-1042",
        productName: "iPhone 15 Pro - Graphite",
        category: "Electronics",
        customerName: "Sarah Jenkins", // The logged-in customer mock
        contact: "sarah.j@example.com",
        reason: "Screen scratched on arrival",
        image: "images/iphone.png",
        originalPrice: "$999.00",
        dateOfPurchase: "2026-03-15",
        dateOfReturnRequest: "2026-03-20",
        refundAmount: "$999.00",
        serialNumber: "IP15P-84729-XX",
        shippingCarrier: "FedEx",
        trackingNumber: "FX-993821038",
        status: "Pending" // Core state management
    },
    {
        id: "RET-1043",
        productName: "Nike Air Zoom Pegasus",
        category: "Apparel",
        customerName: "Marcus Thorne",
        contact: "+1 (555) 293-1923",
        reason: "Wrong size, worn once",
        image: "images/shoes.png",
        originalPrice: "$120.00",
        dateOfPurchase: "2026-04-01",
        dateOfReturnRequest: "2026-04-05",
        refundAmount: "$120.00",
        serialNumber: "N/A",
        shippingCarrier: "UPS",
        trackingNumber: "1Z9999999999999999",
        status: "Pending"
    },
    {
        id: "RET-1044",
        productName: "Breville Bambino Plus",
        category: "Home Appliances",
        customerName: "Emily Chen",
        contact: "emily.c@example.com",
        reason: "Arrived with broken portafilter",
        image: "images/coffeemaker.png",
        originalPrice: "$499.95",
        dateOfPurchase: "2026-03-28",
        dateOfReturnRequest: "2026-04-06",
        refundAmount: "$499.95",
        serialNumber: "BRV-002-88X2",
        shippingCarrier: "DHL",
        trackingNumber: "DHL-84729112",
        status: "Pending"
    }
];

// Sustainability & Process Metrics State
let metrics = {
    recycled: 142,
    reused: 89,
    disposed: 34,
    repaired: 12
};

let inventoryDatabase = [
    {
        id: "INV-1001",
        productName: "iPhone 15 Pro - Graphite",
        category: "Electronics",
        condition: "New",
        quantity: 5,
        source: "Supplier"
    },
    {
        id: "INV-1002",
        productName: "Breville Bambino Plus",
        category: "Home Appliances",
        condition: "Refurbished",
        quantity: 2,
        source: "Return - Repair"
    }
];

let currentSelectedId = null;

// Routing DOM Elements
const viewLogin = document.getElementById('login-view');
const viewStaff = document.getElementById('staff-view');
const viewCustomer = document.getElementById('customer-view');

// Staff specific DOM
const requestsListEl = document.getElementById('requests-list');
const inspectionPanelEl = document.getElementById('inspection-panel');
const emptyStateEl = document.getElementById('empty-state');
const inspectionFormEl = document.getElementById('inspection-form');
const decisionForm = document.getElementById('decision-form');

// Customer specific DOM
const customerPortalContent = document.getElementById('customer-portal-content');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Setup login events
    document.getElementById('btn-login-staff').addEventListener('click', () => switchView('staff'));
    document.getElementById('btn-login-customer').addEventListener('click', () => switchView('customer'));
    
    // Setup logout events
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', () => switchView('login'));
    });

    // Setup staff navigation events
    document.getElementById('nav-returns').addEventListener('click', () => switchStaffTab('returns'));
    document.getElementById('nav-inventory').addEventListener('click', () => switchStaffTab('inventory'));

    // Run initial renders without showing specific views yet
    updateStaffMetrics();
    renderStaffPendingList();
    renderCustomerPortal();
    
    const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    document.getElementById('inspection-date').textContent = `Inspection Date: ${dateStr}`;
});

// --- ROUTER & VIEW LOGIC ---
function switchView(target) {
    viewLogin.classList.add('util-hidden');
    viewStaff.classList.add('util-hidden');
    viewCustomer.classList.add('util-hidden');

    if (target === 'login') {
        viewLogin.classList.remove('util-hidden');
    } else if (target === 'staff') {
        viewStaff.classList.remove('util-hidden');
        switchStaffTab('returns'); // Ensure correct tab layout is visible
        renderStaffPendingList();
        updateStaffMetrics();
    } else if (target === 'customer') {
        viewCustomer.classList.remove('util-hidden');
        renderCustomerPortal();
    }
}

function switchStaffTab(tab) {
    document.getElementById('nav-returns').classList.remove('active');
    document.getElementById('nav-inventory').classList.remove('active');
    document.getElementById('returns-module').classList.add('util-hidden');
    document.getElementById('inventory-module').classList.add('util-hidden');

    if (tab === 'returns') {
        document.getElementById('nav-returns').classList.add('active');
        document.getElementById('returns-module').classList.remove('util-hidden');
    } else if (tab === 'inventory') {
        document.getElementById('nav-inventory').classList.add('active');
        document.getElementById('inventory-module').classList.remove('util-hidden');
        renderInventoryList();
    }
}

function renderInventoryList() {
    const listEl = document.getElementById('inventory-list');
    listEl.innerHTML = '';
    inventoryDatabase.forEach(item => {
        const card = document.createElement('div');
        card.className = 'info-card inventory-card';
        card.innerHTML = `
            <h3>${item.productName}</h3>
            <span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--brand); display: inline-block; margin-bottom: 12px;">${item.category}</span>
            <p style="color: var(--text-main); font-weight: 500;">ID: ${item.id}</p>
            <p class="meta" style="margin-bottom: 4px;">Condition: ${item.condition}</p>
            <p class="meta">Source: ${item.source}</p>
            <h2 style="margin-top: 16px;">Qty: ${item.quantity}</h2>
        `;
        listEl.appendChild(card);
    });
}


// --- WAREHOUSE STAFF LOGIC ---
function updateStaffMetrics() {
    const pendingCount = returnsDatabase.filter(r => r.status === 'Pending').length;
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('recycled-count').textContent = metrics.recycled;
    document.getElementById('reused-count').textContent = metrics.reused;
}

function renderStaffPendingList() {
    requestsListEl.innerHTML = '';
    const pendingItems = returnsDatabase.filter(r => r.status === 'Pending');
    
    if (pendingItems.length === 0) {
        requestsListEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">🎉 No pending returns! Great job.</div>`;
        return;
    }

    pendingItems.forEach(req => {
        const item = document.createElement('div');
        item.className = 'request-item';
        if (req.id === currentSelectedId) item.classList.add('selected');
        item.dataset.id = req.id;
        
        item.innerHTML = `
            <img src="${req.image}" alt="${req.productName}" class="request-img-sm">
            <div class="request-brief">
                <h4>${req.id} • ${req.productName}</h4>
                <p>${req.customerName}</p>
            </div>
            <div class="status-dot"></div>
        `;
        item.addEventListener('click', () => selectStaffRequest(req.id));
        requestsListEl.appendChild(item);
    });
}

function selectStaffRequest(id) {
    currentSelectedId = id;
    renderStaffPendingList(); 
    
    const req = returnsDatabase.find(r => r.id === id);
    if (!req) return;
    
    emptyStateEl.classList.add('util-hidden');
    inspectionFormEl.classList.remove('util-hidden');
    
    // Bind data to DOM
    document.getElementById('current-status').textContent = 'Pending Inspection';
    document.getElementById('detail-image').src = req.image;
    document.getElementById('detail-product-name').textContent = `${req.id} - ${req.productName}`;
    document.getElementById('detail-return-reason').textContent = `Reason: ${req.reason}`;
    document.getElementById('detail-serial').textContent = req.serialNumber;
    document.getElementById('detail-price').textContent = req.originalPrice;
    document.getElementById('detail-customer-name').textContent = req.customerName;
    document.getElementById('detail-customer-contact').textContent = req.contact;
    document.getElementById('detail-purchase-date').textContent = req.dateOfPurchase;
    document.getElementById('detail-request-date').textContent = req.dateOfReturnRequest;
    document.getElementById('detail-carrier').textContent = req.shippingCarrier;
    document.getElementById('detail-tracking').textContent = req.trackingNumber;
    document.getElementById('detail-refund').textContent = `${req.refundAmount} (Full)`;
    
    decisionForm.reset();
}

decisionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentSelectedId) return;
    
    const formData = new FormData(decisionForm);
    const selectedAction = formData.get('action'); // "Reuse", "Repair", etc.
    
    if (selectedAction === 'Reuse') metrics.reused++;
    if (selectedAction === 'Recycle') metrics.recycled++;
    if (selectedAction === 'Repair') metrics.repaired++;
    if (selectedAction === 'Dispose') metrics.disposed++;
    
    // Process core state update
    const reqIndex = returnsDatabase.findIndex(r => r.id === currentSelectedId);
    if (reqIndex > -1) {
        const req = returnsDatabase[reqIndex];
        // Change status from pending to processed format
        req.status = `Processed - Action: ${selectedAction}`;
        
        // Update Inventory if item is reused or repaired
        if (selectedAction === 'Reuse' || selectedAction === 'Repair') {
            const conditionMap = {
                'Reuse': 'Open Box',
                'Repair': 'Refurbished'
            };
            const updateCondition = conditionMap[selectedAction];
            
            const existingItem = inventoryDatabase.find(i => i.productName === req.productName && i.condition === updateCondition);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                inventoryDatabase.push({
                    id: `INV-${Date.now().toString().slice(-4)}`,
                    productName: req.productName,
                    category: req.category,
                    condition: updateCondition,
                    quantity: 1,
                    source: `Return - ${selectedAction}`
                });
            }
        }
    }
    
    // Refresh GUI smoothly
    inspectionFormEl.classList.add('fade-out');
    setTimeout(() => {
        inspectionFormEl.classList.remove('fade-out');
        inspectionFormEl.classList.add('util-hidden');
        emptyStateEl.classList.remove('util-hidden');
        currentSelectedId = null;
        
        renderStaffPendingList();
        updateStaffMetrics();
        alert(`Status updated! Customer has been notified.`);
    }, 300);
});

// --- CUSTOMER PORTAL LOGIC ---
function renderCustomerPortal() {
    customerPortalContent.innerHTML = '';
    
    // Simulate login query for "Sarah Jenkins" specifically
    const myReturns = returnsDatabase.filter(r => r.customerName === "Sarah Jenkins");
    document.getElementById('customer-total-returns').textContent = myReturns.length;
    
    if(myReturns.length === 0){
        customerPortalContent.innerHTML = `<p style="color: var(--text-muted);">You have no return history.</p>`;
        return;
    }

    myReturns.forEach(req => {
        // Compute if it's pending vs processed for styling
        const isPending = req.status === "Pending";
        const bannerClass = isPending ? "pending" : "processed";
        const refundStatus = isPending ? "Waiting for Inspection" : `Approved - Originating to Payment Method (${req.refundAmount})`;

        // Build elegant customer card
        const card = document.createElement('div');
        card.className = 'my-return-card';
        card.innerHTML = `
            <img src="${req.image}" alt="Product" class="my-return-img">
            <div class="my-return-info">
                <h3>${req.productName}</h3>
                <span class="status-badge status-banner ${bannerClass}">${req.status}</span>
                <p style="color: var(--text-muted);">Return ID: ${req.id} • Reason: ${req.reason}</p>
                
                <div class="return-meta">
                    <div>
                        <p><strong>Logistics tracking</strong></p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Carrier: ${req.shippingCarrier}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Tracking: ${req.trackingNumber}</p>
                    </div>
                    <div>
                        <p><strong>Refund Status</strong></p>
                        <p style="color: var(--success); font-size: 0.9rem; font-weight: 500;">${refundStatus}</p>
                    </div>
                </div>
            </div>
        `;
        customerPortalContent.appendChild(card);
    });
}
