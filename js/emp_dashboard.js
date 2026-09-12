// ==========================================
// EMPLOYEE DASHBOARD & PRAYOSHA SITE MGT LOGIC
// ==========================================

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEnXpxacfhZvdW7cbOmR3Mu90moQQ0bOdyGBsDlUU1mRml737nK57tqog2mzg7Bs5wbw/exec"; // IMPORTANT: Update this!

const MODULE_CONFIG = {
    'SiteMgt': { name: 'Site Mgt', icon: 'fa-hard-hat', title: 'Site Management' },
    'ExtAgencies': { name: 'Agencies', icon: 'fa-handshake', title: 'External Agencies' },
    'InvLog': { name: 'Inventory', icon: 'fa-boxes', title: 'Inventory & Logistics' }
};

document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem('prayosha_employee_user');
    if (userData) {
        const user = JSON.parse(userData);
        activateDashboard(user);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// --- CORE API BRIDGE (Replaces google.script.run) ---
function apiCall(action, payload = {}) {
    return fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: action, payload: payload })
    }).then(res => res.json());
}

// --- DASHBOARD ROUTING ---
function activateDashboard(user) {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';
    document.getElementById('displayFullName').innerText = user.name;
    document.getElementById('displayRole').innerText = user.role;
    
    const nameParts = user.name.split(' ');
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) initials += nameParts[1].charAt(0).toUpperCase();
    document.getElementById('userAvatar').innerText = initials;

    buildBottomNavOnly(user.access);
}

function buildBottomNavOnly(accessString) {
    const navContainer = document.getElementById('dynamicBottomNav');
    navContainer.innerHTML = `<div class="bottom-nav-item active" id="nav-home" onclick="switchView('view-home', 'nav-home')"><i class="fas fa-home"></i>Home</div>`;

    let authorizedTags = accessString.trim().toLowerCase() === 'all' ? Object.keys(MODULE_CONFIG) : accessString.split(',').map(tag => tag.trim());

    authorizedTags.forEach(tag => {
        const moduleData = MODULE_CONFIG[tag];
        if (moduleData) {
            const navBtn = document.createElement('div');
            navBtn.className = 'bottom-nav-item';
            navBtn.id = `nav-${tag}`;
            navBtn.onclick = () => switchView(`view-${tag}`, `nav-${tag}`);
            navBtn.innerHTML = `<i class="fas ${moduleData.icon}"></i>${moduleData.name}`;
            navContainer.appendChild(navBtn);
        }
    });
}

function switchView(viewId, navId) {
    document.querySelectorAll('.module-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.bottom-nav-item').forEach(nav => nav.classList.remove('active'));
    
    const selectedView = document.getElementById(viewId);
    if (selectedView) selectedView.style.display = 'block';

    const selectedNav = document.getElementById(navId);
    if (selectedNav) {
        selectedNav.classList.add('active');
        selectedNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (viewId === 'view-SiteMgt' && Object.keys(siteHierarchy).length === 0) {
        initTaskModule(); 
    }
}

function toggleProfileMenu() { document.getElementById('profileMenu').classList.toggle('show'); }
function performLogout() {
    localStorage.removeItem('prayosha_employee_user');
    location.reload();
}

// ==========================================
// SITE MANAGEMENT ENGINE
// ==========================================
let siteHierarchy = {}; 
let globalChecklists = {}; 

function switchTskTab(activeIndex) {
    const tskTabs = ['tabLog', 'tabActive', 'tabPending'];
    const tskSections = ['sectionLog', 'sectionActive', 'sectionPending'];

    tskTabs.forEach((id, i) => {
        const btn = document.getElementById(id); 
        const sec = document.getElementById(tskSections[i]);
        if(btn && sec) {
            if(i === activeIndex) { 
                btn.className = 'tsk-tab px-5 py-2.5 rounded-xl text-sm font-bold transition bg-[#1E3A5F] text-white shadow-md'; 
                sec.style.display = 'block'; 
            } else { 
                btn.className = 'tsk-tab px-5 py-2.5 rounded-xl text-sm font-bold transition text-slate-500 hover:bg-white/50'; 
                sec.style.display = 'none'; 
            }
        }
    });
    
    if (activeIndex > 0) fetchTasksOverview(); 
}

function attachTaskListeners() {
    document.getElementById('tabLog').onclick = () => switchTskTab(0);
    document.getElementById('tabActive').onclick = () => switchTskTab(1);
    document.getElementById('tabPending').onclick = () => switchTskTab(2);

    document.getElementById('taskTower').onchange = function() {
        const tower = this.value; 
        const floorSelect = document.getElementById('taskFloor'); 
        document.getElementById('taskZones').innerHTML = '<div class="text-sm font-bold text-slate-400 text-center p-4">Select Floor and Category to view units.</div>';
        floorSelect.innerHTML = '<option value="">-- Select --</option>'; 
        if (tower && siteHierarchy[tower]) { 
            for (let floor in siteHierarchy[tower]) floorSelect.innerHTML += `<option value="${floor}">${floor}</option>`; 
        }
    };

    document.getElementById('taskFloor').onchange = function() {
        const tower = document.getElementById('taskTower').value; 
        const floor = this.value; 
        const catSelect = document.getElementById('taskCategory');
        catSelect.innerHTML = '<option value="">-- Select --</option>';
        if (tower && floor && siteHierarchy[tower][floor]) { 
            for (let cat in siteHierarchy[tower][floor]) catSelect.innerHTML += `<option value="${cat}">${cat}</option>`; 
        }
    };

    document.getElementById('taskCategory').onchange = function() {
        const tower = document.getElementById('taskTower').value; 
        const floor = document.getElementById('taskFloor').value; 
        const category = this.value;
        const zoneContainer = document.getElementById('taskZones'); 
        const taskDropdown = document.getElementById('taskChecklist');
        
        zoneContainer.innerHTML = ''; 
        taskDropdown.innerHTML = '<option value="">-- Select Task --</option>';
        
        if (tower && floor && category && siteHierarchy[tower][floor][category]) {
            const zones = siteHierarchy[tower][floor][category]; // These are the Sub-Categories (e.g., Shop 101)
            
            // Add a "Select All" button
            zoneContainer.innerHTML += `<button type="button" class="mb-4 bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition shadow-sm" onclick="toggleSelectAllZones()">Select All</button>`;

            zones.forEach(zone => {
                zoneContainer.innerHTML += `
                    <div class="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200/50">
                        <input type="checkbox" id="chk_${zone.id}" name="taskZoneSelection" value="${zone.id}" class="w-4 h-4 text-[#F59E0B]">
                        <label for="chk_${zone.id}" class="text-sm font-bold text-[#1E3A5F]">${zone.label}</label>
                    </div>`;
            });

            let availableTasks = globalChecklists[category] || [];
            availableTasks.forEach(t => taskDropdown.innerHTML += `<option value="${t}">${t}</option>`);
        }
    };

    document.getElementById('submitTaskBtn').onclick = function() {
        const btn = this; 
        const msgDiv = document.getElementById('taskStatusMsg');
        const checkedBoxes = Array.from(document.querySelectorAll('input[name="taskZoneSelection"]:checked')).map(cb => cb.value);
        
        const data = {
            zoneIds: checkedBoxes,
            description: document.getElementById('taskChecklist').value, 
            agency: document.getElementById('taskAgency').value, 
            status: document.getElementById('taskStatus').value,
            user: JSON.parse(localStorage.getItem('prayosha_employee_user')).name
        };
        
        if (data.zoneIds.length === 0 || !data.description || !data.agency) { 
            msgDiv.innerText = 'Please select a unit, a task, and an agency.'; 
            msgDiv.className = 'font-bold text-sm text-rose-500'; return; 
        }
        
        btn.disabled = true; msgDiv.innerText = 'Assigning...'; msgDiv.className = 'font-bold text-sm text-slate-500';
        
        apiCall('addCivilTask', data).then(res => {
            btn.disabled = false;
            msgDiv.className = res.success ? 'font-bold text-sm text-emerald-600' : 'font-bold text-sm text-rose-500'; 
            msgDiv.innerText = res.message;
            
            if (res.success) {
                document.querySelectorAll('input[name="taskZoneSelection"]').forEach(cb => cb.checked = false);
                document.getElementById('taskChecklist').value = ''; 
                setTimeout(() => msgDiv.innerText = '', 3000);
            }
        });
    };
}

function toggleSelectAllZones() {
    const checkboxes = document.querySelectorAll('input[name="taskZoneSelection"]');
    let allChecked = true; 
    checkboxes.forEach(cb => { if (!cb.checked) allChecked = false; });
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

function initTaskModule() {
    attachTaskListeners();
    
    apiCall('getZoneHierarchy').then(res => {
        if (res.success) {
            siteHierarchy = res.data; 
            const towerSelect = document.getElementById('taskTower');
            for (let tower in siteHierarchy) towerSelect.innerHTML += `<option value="${tower}">${tower}</option>`; 
        }
    });

    apiCall('getTaskAgencies').then(res => {
        if (res.success) {
            const agencySelect = document.getElementById('taskAgency');
            res.data.forEach(ag => agencySelect.innerHTML += `<option value="${ag}">${ag}</option>`);
        }
    });

    apiCall('getChecklists').then(res => {
        if (res.success) globalChecklists = res.data;
    });
}

function fetchTasksOverview() {
    document.getElementById('activeTasksBody').innerHTML = 'Loading tasks...';
    document.getElementById('pendingTasksBody').innerHTML = 'Loading zones...';
    
    apiCall('getCategorizedTasksData').then(res => {
        if (res.success) {
            renderActiveTasks(res.data.active);
            renderPendingZones(res.data.pending);
        }
    });
}

function renderActiveTasks(data) {
    const container = document.getElementById('activeTasksBody');
    if (!data.length) return container.innerHTML = '<div class="text-center p-4 bg-white rounded-xl shadow-sm font-bold text-slate-400">No active tasks found.</div>';
    
    let html = '<table class="w-full text-left bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"><thead class="bg-slate-50 border-b text-[10px] text-slate-500 font-extrabold uppercase tracking-widest"><tr><th class="p-4">UNIT / SUB-CAT</th><th class="p-4">TASK</th><th class="p-4">AGENCY</th><th class="p-4">STATUS</th></tr></thead><tbody class="divide-y divide-slate-100">';
    data.forEach(task => {
        html += `<tr><td class="p-4 font-bold text-[#1E3A5F]">${task.subCat}<br><span class="text-[10px] text-slate-400 font-mono">${task.zone}</span></td><td class="p-4 text-sm">${task.desc}</td><td class="p-4 text-[#F59E0B] font-bold text-sm">${task.agency}</td><td class="p-4"><span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">${task.status}</span></td></tr>`;
    });
    container.innerHTML = html + '</tbody></table>';
}

function renderPendingZones(data) {
    const container = document.getElementById('pendingTasksBody');
    if (!data.length) return container.innerHTML = '<div class="text-center p-4 bg-white rounded-xl shadow-sm font-bold text-emerald-500">All available units are currently assigned!</div>';
    
    let html = '<table class="w-full text-left bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"><thead class="bg-slate-50 border-b text-[10px] text-slate-500 font-extrabold uppercase tracking-widest"><tr><th class="p-4">UNASSIGNED UNIT</th><th class="p-4">TOWER</th><th class="p-4">CATEGORY</th></tr></thead><tbody class="divide-y divide-slate-100">';
    data.forEach(zone => {
        html += `<tr><td class="p-4 font-bold text-amber-700">${zone.subCat}<br><span class="text-[10px] text-slate-400 font-mono">${zone.zoneId}</span></td><td class="p-4 text-slate-500 text-sm font-bold">${zone.tower}</td><td class="p-4 text-slate-500 text-sm font-bold">${zone.category}</td></tr>`;
    });
    container.innerHTML = html + '</tbody></table>';
}
