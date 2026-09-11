// ==========================================
// EMPLOYEE AUTHENTICATION (emp_auth.js)
// ==========================================

// --- PASTE YOUR API URL HERE ---
const API_URL = 'https://script.google.com/macros/s/AKfycbxEnXpxacfhZvdW7cbOmR3Mu90moQQ0bOdyGBsDlUU1mRml737nK57tqog2mzg7Bs5wbw/exec'; 

async function attemptLogin() {
    const pin = document.getElementById('pinInput').value;
    const btn = document.getElementById('loginBtn');
    
    if (pin.length !== 4) { 
        showMessage("Please enter a 4-digit PIN.", "error"); 
        return; 
    }

    btn.disabled = true; 
    btn.innerText = "Verifying..."; 
    showMessage("", "");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', pin: pin })
        });
        const data = await response.json();

        if (data.status === 'success') {
            // Check if the user actually has permission to view the employee app
            // In the future, we can add logic here to reject Directors from the Employee portal if desired
            localStorage.setItem('prayosha_employee_user', JSON.stringify(data.user));
            activateDashboard(data.user);
        } else {
            showMessage(data.message, "error");
        }
    } catch (error) {
        showMessage("Network error. Checking local offline cache...", "error");
        console.error("Login Error:", error);
    } finally {
        btn.disabled = false; 
        btn.innerText = "Login";
    }
}

function showMessage(text, type) {
    const msgDiv = document.getElementById('statusMessage');
    msgDiv.innerText = text; 
    msgDiv.className = `message ${type}`;
}
