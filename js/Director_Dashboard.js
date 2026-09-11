// ==========================================
// DIRECTOR DASHBOARD CORE CONTROLLER
// Handles UI state, profiles, and navigation for Management
// ==========================================

// --- INIT: Check session on page load ---
document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem('prayosha_user');
    if (userData) {
        // If already logged in, skip login screen
        const user = JSON.parse(userData);
        activateDashboard(user);
    }
});

// --- DASHBOARD ACTIVATION LOGIC ---
function activateDashboard(user) {
    // Hide Login, Show Dashboard
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';

    // Populate Profile Info
    document.getElementById('displayFullName').innerText = user.name;
    document.getElementById('displayRole').innerText = user.role;
    
    // Generate Initials
    const nameParts = user.name.split(' ');
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[1].charAt(0).toUpperCase();
    }
    document.getElementById('userAvatar').innerText = initials;
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
    // Clear memory and reset views
    localStorage.removeItem('prayosha_user');
    document.getElementById('pinInput').value = '';
    document.getElementById('statusMessage').innerText = '';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
}

// --- NETWORK STATUS EVENT LISTENERS ---
window.addEventListener('online', () => updateNetworkStatus(true));
window.addEventListener('offline', () => updateNetworkStatus(false));

function updateNetworkStatus(isOnline) {
    const badge = document.getElementById('networkStatus');
    if (isOnline) {
        badge.className = 'sync-badge online';
        badge.innerHTML = '<i class="fas fa-wifi"></i> Online';
    } else {
        badge.className = 'sync-badge offline';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Offline';
    }
}