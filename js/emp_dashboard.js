// ==========================================
// EMPLOYEE DASHBOARD LOGIC (emp_dashboard.js)
// Handles Dynamic UI generation based on App_Access tags
// ==========================================

// MASTER MODULE DICTIONARY
const MODULE_CONFIG = {
    'SiteMgt': { name: 'Site Management', icon: 'fa-hard-hat' },
    'ExtAgencies': { name: 'Agencies', icon: 'fa-handshake' },
    'InvLog': { name: 'Inventory', icon: 'fa-boxes' },
    'SafetyQC': { name: 'Safety & QC', icon: 'fa-shield-alt' },
    'Sales': { name: 'Sales', icon: 'fa-chart-line' },
    'HR': { name: 'HR', icon: 'fa-users-cog' },
    'Social': { name: 'Social', icon: 'fa-comments' },
    'PettyCash': { name: 'Petty Cash', icon: 'fa-wallet' },
    'Reports': { name: 'Reports', icon: 'fa-chart-pie' },
    'PreDev': { name: 'Pre-Development', icon: 'fa-file-signature' },
    'Calc': { name: 'Calculators', icon: 'fa-calculator' },
    'DigitalTwin': { name: 'Digital Twin', icon: 'fa-cubes' },
    'Compliance': { name: 'Compliance', icon: 'fa-file-contract' },
    'AssetMaint': { name: 'Asset Maint.', icon: 'fa-tools' },
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
    // 1. Hide Login, Show Dashboard
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';

    // 2. Set Header Data
    document.getElementById('displayFullName').innerText = user.name;
    document.getElementById('displayRole').innerText = user.role;
    
    const nameParts = user.name.split(' ');
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[1].charAt(0).toUpperCase();
    }
    document.getElementById('userAvatar').innerText = initials;

    // 3. GENERATE DYNAMIC MODULE GRID
    buildAuthorizedUI(user.access);
}

function buildAuthorizedUI(accessString) {
    const gridContainer = document.getElementById('dynamicModuleGrid');
    gridContainer.innerHTML = ''; // Clear previous data

    // Handle the Director's "All" override
    let authorizedTags = [];
    if (accessString.trim().toLowerCase() === 'all') {
        authorizedTags = Object.keys(MODULE_CONFIG);
    } else {
        authorizedTags = accessString.split(',').map(tag => tag.trim());
    }

    // Build buttons for each authorized tag
    authorizedTags.forEach(tag => {
        const moduleData = MODULE_CONFIG[tag];
        
        // If the tag exists in our master dictionary, render it
        if (moduleData) {
            const btnHTML = `
                <div class="module-btn" onclick="openModule('${tag}')">
                    <i class="fas ${moduleData.icon}"></i>
                    <span>${moduleData.name}</span>
                </div>
            `;
            gridContainer.innerHTML += btnHTML;
        }
    });

    // Fallback if no tags match
    if (gridContainer.innerHTML === '') {
        gridContainer.innerHTML = '<p style="color: red; grid-column: span 2; text-align: center;">No authorized modules found. Contact Administrator.</p>';
    }
}

function openModule(moduleTag) {
    // Placeholder function for future module routing
    alert(`Navigating to: ${MODULE_CONFIG[moduleTag].name} module...`);
}

// --- TOP BAR INTERACTIONS ---
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
