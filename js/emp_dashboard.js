// ==========================================
// EMPLOYEE DASHBOARD LOGIC (emp_dashboard.js)
// Bottom-Nav-Only Navigation System
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

    // Remove any previously generated module screens
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

            // 2. Add module screen container into workspace
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
