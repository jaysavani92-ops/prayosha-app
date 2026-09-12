// ==========================================
// EMPLOYEE DASHBOARD LOGIC (emp_dashboard.js)
// Handles Dynamic UI & Bottom Navigation routing
// ==========================================

// MASTER MODULE DICTIONARY
const MODULE_CONFIG = {
    'SiteMgt': { name: 'Site Mgt', icon: 'fa-hard-hat' },
    'ExtAgencies': { name: 'Agencies', icon: 'fa-handshake' },
    'InvLog': { name: 'Inventory', icon: 'fa-boxes' },
    'SafetyQC': { name: 'Safety & QC', icon: 'fa-shield-alt' },
    'Sales': { name: 'Sales', icon: 'fa-chart-line' },
    'HR': { name: 'HR', icon: 'fa-users-cog' },
    'Social': { name: 'Social', icon: 'fa-comments' },
    'PettyCash': { name: 'Petty Cash', icon: 'fa-wallet' },
    'Reports': { name: 'Reports', icon: 'fa-chart-pie' },
    'PreDev': { name: 'Pre-Dev', icon: 'fa-file-signature' },
    'Calc': { name: 'Calculators', icon: 'fa-calculator' },
    'DigitalTwin': { name: '3D Twin', icon: 'fa-cubes' },
    'Compliance': { name: 'Compliance', icon: 'fa-file-contract' },
    'AssetMaint': { name: 'Assets', icon: 'fa-tools' },
    'Accounts': { name: 'Accounts', icon: 'fa-file-invoice-dollar' }
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

    // Trigger the dual UI generation (Grid + Nav Bar)
    buildAuthorizedUI(user.access);
}

function buildAuthorizedUI(accessString) {
    const gridContainer = document.getElementById('dynamicModuleGrid');
    const navContainer = document.getElementById('dynamicBottomNav');
    const workspace = document.getElementById('mainWorkspace');
    
    gridContainer.innerHTML = ''; 

    // Always start the Bottom Nav with the "Home" button
    let navHTML = `
        <div class="bottom-nav-item active" id="nav-home" onclick="switchView('view-home', 'nav-home')">
            <i class="fas fa-home"></i>Home
        </div>
    `;

    let authorizedTags = [];
    if (accessString.trim().toLowerCase() === 'all') {
        authorizedTags = Object.keys(MODULE_CONFIG);
    } else {
        authorizedTags = accessString.split(',').map(tag => tag.trim());
    }

    authorizedTags.forEach(tag => {
        const moduleData = MODULE_CONFIG[tag];
        if (moduleData) {
            // 1. Build the Home Grid Button
            gridContainer.innerHTML += `
                <div class="module-btn" onclick="switchView('view-${tag}', 'nav-${tag}')">
                    <i class="fas ${moduleData.icon}"></i>
                    <span>${moduleData.name}</span>
                </div>
            `;
            
            // 2. Build the Bottom Nav Item
            navHTML += `
                <div class="bottom-nav-item" id="nav-${tag}" onclick="switchView('view-${tag}', 'nav-${tag}')">
                    <i class="fas ${moduleData.icon}"></i>${moduleData.name}
                </div>
            `;

            // 3. Auto-generate the invisible screen (view) for this module
            if (!document.getElementById(`view-${tag}`)) {
                workspace.innerHTML += `
                    <div id="view-${tag}" class="module-view">
                        <div class="dashboard-card">
                            <h2>${moduleData.name} Module</h2>
                            <p>This workspace is ready for development.</p>
                        </div>
                    </div>
                `;
            }
        }
    });

    // Inject the final Nav Bar HTML
    navContainer.innerHTML = navHTML;

    if (gridContainer.innerHTML === '') {
        gridContainer.innerHTML = '<p style="color: red; grid-column: span 2; text-align: center;">No authorized modules found.</p>';
    }
}

// --- SPA VIEW SWITCHER ---
function switchView(viewId, navId) {
    // Hide all screens
    const allViews = document.querySelectorAll('.module-view');
    allViews.forEach(view => view.style.display = 'none');

    // Remove 'active' highlight from all bottom nav icons
    const allNavs = document.querySelectorAll('.bottom-nav-item');
    allNavs.forEach(nav => nav.classList.remove('active'));

    // Show selected screen and highlight selected nav icon
    const selectedView = document.getElementById(viewId);
    if (selectedView) selectedView.style.display = 'block';

    const selectedNav = document.getElementById(navId);
    if (selectedNav) {
        selectedNav.classList.add('active');
        // Auto-scroll the nav bar so the clicked icon is centered (great for mobile)
        selectedNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// --- TOP BAR INTERACTIONS ---
function toggleProfileMenu() {
    document.getElementById('profileMenu').classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.matches('.avatar-circle')) {
        const menu = document.getElementById('profileMenu');
        if (menu && menu.classList.contains('show')) menu.classList.remove('show');
    }
}

function performLogout() {
    localStorage.removeItem('prayosha_employee_user');
    document.getElementById('pinInput').value = '';
    document.getElementById('statusMessage').innerText = '';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
}
