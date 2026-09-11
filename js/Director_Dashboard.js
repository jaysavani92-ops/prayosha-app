// ==========================================
// DIRECTOR DASHBOARD CORE CONTROLLER
// Handles UI state, profiles, navigation, and Data Fetching
// ==========================================

// --- INIT: Check session on page load ---
document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem('prayosha_user');
    if (userData) {
        const user = JSON.parse(userData);
        activateDashboard(user);
    }
});

// --- DASHBOARD ACTIVATION LOGIC ---
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
}

// --- VIEW SWITCHER (SPA ROUTING) ---
function switchView(viewId, navElement) {
    // 1. Hide all views
    const allViews = document.querySelectorAll('.module-view');
    allViews.forEach(view => view.style.display = 'none');

    // 2. Remove 'active' class from all sidebar links
    const allLinks = document.querySelectorAll('.nav-links li, .bottom-nav-item');
    allLinks.forEach(link => link.classList.remove('active'));

    // 3. Show selected view and highlight nav
    document.getElementById(viewId).style.display = 'block';
    navElement.classList.add('active');

    // 4. Trigger specific data loads based on view
    if (viewId === 'view-projects') {
        loadProjectsData();
    }
}

// --- DATA FETCHING: PROJECTS MODULE ---
async function loadProjectsData() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = `<div class="dashboard-card" style="text-align: center; color: #888;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <p>Syncing with Prayosha Database...</p>
                      </div>`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getProjects' })
        });
        
        const result = await response.json();

        if (result.status === 'success') {
            renderProjects(result.data);
        } else {
            grid.innerHTML = `<div class="dashboard-card" style="color: red;">Error: ${result.message}</div>`;
        }
    } catch (error) {
        grid.innerHTML = `<div class="dashboard-card" style="color: red;">Network Error: Ensure you are online.</div>`;
    }
}

function renderProjects(projectsData) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = ''; // Clear loading spinner

    if (projectsData.length === 0) {
        grid.innerHTML = `<div class="dashboard-card">No active projects found in database.</div>`;
        return;
    }

    projectsData.forEach(proj => {
        // Determine color based on status
        const statusColor = proj.Status === 'Active' ? '#4CAF50' : '#FBB03B';

        // Build a sleek card for each project
        const cardHTML = `
            <div class="dashboard-card" style="border-top: 4px solid var(--primary-color); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <h3 style="margin: 0; color: #333;">${proj.Project_Name}</h3>
                        <span style="background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${proj.Status}</span>
                    </div>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 13px;"><i class="fas fa-map-marker-alt" style="color: var(--primary-color);"></i> ${proj.Location}</p>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span style="color: #888;">Type:</span>
                        <strong style="color: #333;">${proj.Project_Type}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span style="color: #888;">Budget:</span>
                        <strong style="color: #333;">${proj.Total_Budget}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
                        <span style="color: #888;">Deadline:</span>
                        <strong style="color: #333;">${proj.Expected_Completion}</strong>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; color: #555;">
                        <span>Progress</span>
                        <strong>${proj.Progress_Percent}%</strong>
                    </div>
                    <div style="background-color: #eee; border-radius: 10px; height: 8px; width: 100%; overflow: hidden;">
                        <div style="background-color: var(--primary-color); height: 100%; width: ${proj.Progress_Percent}%;"></div>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
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
