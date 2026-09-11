// ==========================================
// AUTHENTICATION MODULE
// Handles secure login and API connection
// ==========================================

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
            // Save to memory
            localStorage.setItem('prayosha_user', JSON.stringify(data.user));
            // Transition to Dashboard (Function lives in dashboard.js)
            activateDashboard(data.user);
        } else {
            showMessage(data.message, "error");
        }
    } catch (error) {
        showMessage("Network error. Please try again.", "error");
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