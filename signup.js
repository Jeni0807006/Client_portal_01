document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    const formSummary = document.getElementById('formSummaryMessage');
    formSummary.textContent = '';
    formSummary.className = 'form-summary';

    // Grab values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let hasError = false;

    // 1. Username Verification
    if (!username) {
        document.getElementById('usernameError').textContent = 'Username is required.';
        hasError = true;
    }

    // 2. Email Verification
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required.';
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        hasError = true;
    }

    // 3. Password Requirement Validations (8 chars, 1 upper, 1 lower, 1 number)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required.';
        hasError = true;
    } else if (!passwordRegex.test(password)) {
        document.getElementById('passwordError').textContent = 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.';
        hasError = true;
    }

    // 4. Match Confirm Password
    if (password !== confirmPassword) {
        document.getElementById('confirmError').textContent = 'Passwords do not match.';
        hasError = true;
    }

    // Break early if client validation fails
    if (hasError) return;

    try {
        // Updated URL route context matching backend specs (/api/auth/register)
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

       if (response.ok) {
            formSummary.textContent = 'Account created successfully! Redirecting to login...';
            formSummary.classList.add('success');
            
            const tempUser = {
                username: username,
                email: email
            };
            
            localStorage.setItem('user', JSON.stringify(tempUser));
            localStorage.setItem('userStatus', 'user'); 
            setTimeout(() => {
                window.location.href = 'login.html'; 
            }, 2000);
        
        } else {
            // Handle server validation conflicts (e.g., email or username already taken)
            if (data.field && document.getElementById(`${data.field}Error`)) {
                document.getElementById(`${data.field}Error`).textContent = data.message;
            } else {
                formSummary.textContent = data.message || 'Signup failed.';
                formSummary.classList.add('error');
            }
        }

    } catch (error) {
        console.error('Error during signup:', error);
        formSummary.textContent = 'Cannot connect to the server. Please check your backend connections.';
        formSummary.classList.add('error');
    }
});