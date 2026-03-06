const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const mainDashboard = document.getElementById('main-dashboard');
const logoutBtn = document.getElementById('logout-btn');

const DEMO_CRED = {
    username: 'admin',
    password: 'admin123'
};

// Check if already logged in (persistence)
if (localStorage.getItem('isLoggedIn') === 'true') {
    showDashboard();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === DEMO_CRED.username && pass === DEMO_CRED.password) {
        localStorage.setItem('isLoggedIn', 'true');
        showDashboard();
    } else {
        alert('Invalid credentials! Use the demo info below the button.');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    location.reload();
});

function showDashboard() {
    loginPage.classList.add('hidden');
    mainDashboard.classList.remove('hidden');
    // Trigger data load from script.js
    if (typeof fetchIssues === 'function') fetchIssues();
}