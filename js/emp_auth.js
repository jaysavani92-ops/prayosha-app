// ==========================================
// EMPLOYEE AUTHENTICATION LOGIC (emp_auth.js)
// Connects to the Unified API Gateway
// ==========================================

const AUTH_API_URL = "https://script.google.com/macros/s/AKfycbxEnXpxacfhZvdW7cbOmR3Mu90moQQ0bOdyGBsDlUU1mRml737nK57tqog2mzg7Bs5wbw/exec"; 

function attemptLogin() {
    const pin = document.getElementById('pinInput').value;
    const statusMsg = document.getElementById('statusMessage');
    const btn = document.getElementById('loginBtn');

    if (pin.length < 4) {
        statusMsg.innerText = "Please enter your 4-digit PIN.";
        statusMsg.style.color = "#ef4444";
        return;
    }

    statusMsg.innerText = "Authenticating...";
    statusMsg.style.color = "#F59E0B";
    btn.disabled = true;

    fetch(AUTH_API_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'authenticateUser',
            payload: { pin: pin }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            statusMsg.innerText = "Login Successful!";
            statusMsg.style.color = "#10b981";
            
            // Save user data securely to local storage
            localStorage.setItem('prayosha_employee_user', JSON.stringify(data.user));
            
            // Trigger the dashboard generation logic located in emp_dashboard.js
            setTimeout(() => {
                activateDashboard(data.user);
            }, 500);
        } else {
            statusMsg.innerText = data.message;
            statusMsg.style.color = "#ef4444";
            btn.disabled = false;
        }
    })
    .catch(error => {
        statusMsg.innerText = "Connection error. Please try again.";
        statusMsg.style.color = "#ef4444";
        btn.disabled = false;
        console.error("Login Error:", error);
    });
}

// Allow pressing "Enter" on the keyboard to login
document.getElementById('pinInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        attemptLogin();
    }
});
