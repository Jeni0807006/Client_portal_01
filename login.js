
const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('errorMessage');
const guestBtn = document.getElementById('guestBtn');

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block'; 
}

// 1. STANDARD USER LOGIN

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorDiv.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please enter your email and password!');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

       if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); 
    localStorage.setItem('userStatus', 'user'); 
    
    window.location.href = 'dashboard.html';
} else {
            
            showError(data.message || 'Login failed. Please verify your email and password.');
        }

    } catch (error) {
        console.error('Error during login:', error);
        showError('Connection to the server failed. Kindly verify that the server is online and accessible.');
    }
});


// 2. GUEST ACCESS 

if (guestBtn) {
    guestBtn.addEventListener('click', () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem('userStatus', 'guest');

        window.location.href = 'dashboard.html';
    });
}
