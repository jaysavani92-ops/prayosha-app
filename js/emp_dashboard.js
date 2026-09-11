// ==========================================
// EMPLOYEE DASHBOARD LOGIC (emp_dashboard.js)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Note: We use a different local storage key so Employee and Director logins don't conflict
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
}

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
