// ==========================================
// EMPLOYEE DASHBOARD LOGIC (emp_dashboard.js)
// Bottom-Nav-Only Navigation System & Module Logic
// ==========================================

// MASTER MODULE DICTIONARY
const MODULE_CONFIG = {
    'SiteMgt': { name: 'Site Mgt', icon: 'fa-hard-hat', title: 'Site Management' },
    'ExtAgencies': { name: 'Agencies', icon: 'fa-handshake', title: 'External Agencies' },
    'InvLog': { name: 'Inventory', icon: 'fa-boxes', title: 'Inventory & Logistics' },
    'SafetyQC': { name: 'Safety & QC', icon: 'fa-shield-alt', title: 'Safety & Quality Control' },
    'Sales': { name: 'Sales', icon: 'fa-chart-line', title: 'Sales Management' },
    'HR': { name: 'HR', icon: 'fa-users-cog', title: 'Human Resources' },
    'Social': { name: 'Social', icon: 'fa-comments', title: 'Internal Communications' },
    'PettyCash': { name: 'Petty Cash', icon: 'fa-wallet', title: 'Petty Cash Management' },
    'Reports': { name: 'Reports', icon: 'fa-chart-pie', title: 'Report Generation' },
    'PreDev': { name: 'Pre-Dev', icon: 'fa-file-signature', title: 'Pre-Development' },
    'Calc': { name: 'Calculators', icon: 'fa-calculator', title: 'Construction Calculators' },
    'DigitalTwin': { name: 'Digital Twin', icon: 'fa-cubes', title: 'Digital Twin 3D' },
    'Compliance': { name: 'Compliance', icon: 'fa-file-contract', title: 'Compliance & RERA' },
    'AssetMaint': { name: 'Assets', icon: 'fa-tools', title: 'Asset Maintenance' },
    'Accounts': { name: 'Accounts', icon: 'fa-file-invoice-dollar', title: 'Accounts & Expenses' }
};

document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem('prayosha_employee_user');
    if (userData) {
        const user = JSON.parse(userData);
        activateDashboard(user);
    }
});

function activateDashboard(user) {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';

    document.getElementById('displayFullName').innerText = user.name;
    document.getElementById('displayRole').innerText = user.role;
    
    const nameParts = user.name.split(' ');
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[1].charAt(0).toUpperCase();
    }
    document.getElementById('userAvatar').innerText = initials;

    // Generate bottom navigation exclusively
    buildBottomNavOnly(user.access);
}

function buildBottomNavOnly(accessString) {
    const navContainer = document.getElementById('dynamicBottomNav');
    const workspace = document.getElementById('mainWorkspace');

    // Remove any previously generated placeholder module screens to prevent duplicates
    const oldScreens = document.querySelectorAll('.dynamic-screen');
    oldScreens.forEach(screen => screen.remove());

    // Reset bottom navigation with Home icon
    navContainer.innerHTML = `
        <div class="bottom-nav-item active" id="nav-home" onclick="switchView('view-home', 'nav-home')">
            <i class="fas fa-home"></i>Home
        </div>
    `;

    // Determine authorized modules
    let authorizedTags = [];
    if (accessString && accessString.trim().toLowerCase() === 'all') {
        authorizedTags = Object.keys(MODULE_CONFIG);
    } else if (accessString) {
        authorizedTags = accessString.split(',').map(tag => tag.trim());
    }

    // Build navigation items and screen containers
    authorizedTags.forEach(tag => {
        const moduleData = MODULE_CONFIG[tag];
        if (moduleData) {
            // 1. Add item to bottom navigation bar
            const navBtn = document.createElement('div');
            navBtn.className = 'bottom-nav-item';
            navBtn.id = `nav-${tag}`;
            navBtn.onclick = () => switchView(`view-${tag}`, `nav-${tag}`);
            navBtn.innerHTML = `<i class="fas ${moduleData.icon}"></i>${moduleData.name}`;
            navContainer.appendChild(navBtn);

            // 2. Add placeholder module screen ONLY if it doesn't already exist in our HTML (like view-SiteMgt)
            if (!document.getElementById(`view-${tag}`)) {
                const screenDiv = document.createElement('div');
                screenDiv.id = `view-${tag}`;
                screenDiv.className = 'module-view dynamic-screen';
                screenDiv.innerHTML = `
                    <div class="dashboard-card" style="border-top: 4px solid var(--primary-color);">
                        <h2 style="margin-top: 0; color: #333;">${moduleData.title}</h2>
                        <p style="color: #666;">Ready for module implementation.</p>
                    </div>
                `;
                workspace.appendChild(screenDiv);
            }
        }
    });
}

// --- SPA VIEW SWITCHER ---
function switchView(viewId, navId) {
    // Hide all views
    const allViews = document.querySelectorAll('.module-view');
    allViews.forEach(view => view.style.display = 'none');

    // Deactivate all nav buttons
    const allNavs = document.querySelectorAll('.bottom-nav-item');
    allNavs.forEach(nav => nav.classList.remove('active'));

    // Show target view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.style.display = 'block';
    }

    // Activate target nav button and auto-scroll horizontally on mobile
    const selectedNav = document.getElementById(navId);
    if (selectedNav) {
        selectedNav.classList.add('active');
        selectedNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// --- TOP BAR & PROFILE ---
function toggleProfileMenu() {
    document.getElementById('profileMenu').classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.matches('.avatar-circle')) {
        const menu = document.getElementById('profileMenu');
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
}

function performLogout() {
    localStorage.removeItem('prayosha_employee_user');
    document.getElementById('pinInput').value = '';
    document.getElementById('statusMessage').innerText = '';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
}

// ==========================================
// SITE MANAGEMENT MODULE LOGIC
// ==========================================

// Dummy Data structure (Will be replaced with API call to Zones tab)
const ZONE_DATA = {
    "Tower A": {
        "Basement": ["Basement Parking", "Lift Area", "Staircase"],
        "Ground Floor": ["Commercial Shop", "Foyer", "Security Cabin"],
        "First Floor": ["Commercial Shop", "Passage", "Washroom"]
    },
    "Tower B": {
        "Ground Floor": ["Foyer", "Clubhouse", "Garden"],
        "First Floor": ["Residential Flat", "Passage", "Lift Area"]
    }
};

function smUpdateFloors() {
    const towerSel = document.getElementById('sm-tower').value;
    const floorSel = document.getElementById('sm-floor');
    const catSel = document.getElementById('sm-category');
    const btn = document.getElementById('sm-load-btn');

    // Reset downstream inputs
    floorSel.innerHTML = '<option value="">-- Select Floor --</option>';
    catSel.innerHTML = '<option value="">-- Select Category --</option>';
    floorSel.disabled = true;
    catSel.disabled = true;
    btn.disabled = true;
    document.getElementById('sm-checklist-container').style.display = 'none';

    if (towerSel && ZONE_DATA[towerSel]) {
        const floors = Object.keys(ZONE_DATA[towerSel]);
        floors.forEach(floor => {
            floorSel.innerHTML += `<option value="${floor}">${floor}</option>`;
        });
        floorSel.disabled = false;
    }
}

function smUpdateCategories() {
    const towerSel = document.getElementById('sm-tower').value;
    const floorSel = document.getElementById('sm-floor').value;
    const catSel = document.getElementById('sm-category');
    const btn = document.getElementById('sm-load-btn');

    // Reset downstream inputs
    catSel.innerHTML = '<option value="">-- Select Category --</option>';
    catSel.disabled = true;
    btn.disabled = true;
    document.getElementById('sm-checklist-container').style.display = 'none';

    if (floorSel && ZONE_DATA[towerSel][floorSel]) {
        const categories = ZONE_DATA[towerSel][floorSel];
        categories.forEach(cat => {
            catSel.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        catSel.disabled = false;
    }
}

function smEnableChecklistBtn() {
    const catSel = document.getElementById('sm-category').value;
    const btn = document.getElementById('sm-load-btn');
    btn.disabled = catSel === "";
}

function smLoadChecklist() {
    const category = document.getElementById('sm-category').value;
    const container = document.getElementById('sm-checklist-container');
    const taskList = document.getElementById('sm-task-list');

    // Show the container
    container.style.display = 'block';
    
    // Generate dummy task UI based on the category selection
    taskList.innerHTML = `
        <div class="dashboard-card" style="padding: 15px; border-left: 4px solid #ff9800; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: #333; font-size: 14px;">Brickwork & Plaster</strong>
                <span style="font-size: 11px; color: #888;">TSK-1001</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button style="flex: 1; padding: 8px; background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-check"></i> Complete
                </button>
                <button style="flex: 1; padding: 8px; background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-camera"></i> Photo
                </button>
            </div>
        </div>
    `;
}
