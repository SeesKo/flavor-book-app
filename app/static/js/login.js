document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('signupModal');
    var btn = document.getElementById('signupButton');
    var span = document.getElementsByClassName('close')[0];

    btn.onclick = function() {
        modal.style.display = 'block';
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});

// Set the current year in the footer
const currentYear = new Date().getFullYear();
document.getElementById('year').textContent = currentYear;

// Login form validation
document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();  // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Reset error messages visibility
    document.getElementById('email-error-msg').style.display = 'none';
    document.getElementById('password-error-msg').style.display = 'none';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Redirect on success
            window.location.href = result.redirect;
        } else {
            // Show the error message next to both email and password labels
            const errorMessage = result.message || 'Invalid email or password';

            document.getElementById('email-error-msg').innerText = errorMessage;
            document.getElementById('email-error-msg').style.display = 'inline';

            document.getElementById('password-error-msg').innerText = errorMessage;
            document.getElementById('password-error-msg').style.display = 'inline';
        }
    } catch (error) {
        console.error('Error:', error);

        // Fallback error message if the request fails unexpectedly
        document.getElementById('email-error-msg').innerText = 'An unexpected error occurred.';
        document.getElementById('email-error-msg').style.display = 'inline';

        document.getElementById('password-error-msg').innerText = 'An unexpected error occurred.';
        document.getElementById('password-error-msg').style.display = 'inline';
    }
});


// Email and Password Validation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();  // Prevent the default form submission

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const emailErrorMsg = document.getElementById('signup-email-error-msg');
        const passwordErrorMsg = document.getElementById('signup-password-error-msg');
        const confirmPasswordErrorMsg = document.getElementById('signup-confirm-error-msg');

        // Reset error messages
        emailErrorMsg.style.display = 'none';
        passwordErrorMsg.style.display = 'none';
        confirmPasswordErrorMsg.style.display = 'none';

        let formIsValid = true;  // Flag to track form validity

        // Check if passwords match
        if (password !== confirmPassword) {
            const errorMsg = "- Passwords do not match";
            passwordErrorMsg.textContent = errorMsg;
            confirmPasswordErrorMsg.textContent = errorMsg;

            passwordErrorMsg.style.display = 'inline';
            confirmPasswordErrorMsg.style.display = 'inline';

            formIsValid = false;
        }

        try {
            // Check if the email already exists
            const emailResponse = await fetch('/check_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const emailResult = await emailResponse.json();

            if (emailResult.exists) {
                emailErrorMsg.innerText = '- Sorry. Email already in use';
                emailErrorMsg.style.display = 'inline';
                formIsValid = false;
            }

        } catch (error) {
            console.error('Error:', error);
            // Handle unexpected errors
            emailErrorMsg.innerText = 'An unexpected error occurred.';
            emailErrorMsg.style.display = 'inline';
            formIsValid = false;
        }

        // If no errors, submit the form
        if (formIsValid) {
            this.submit();  // Proceed with form submission
        }
    });
});


// Toggle Password Visibility
function togglePassword(inputId, iconElement) {
    var inputField = document.getElementById(inputId);
    var icon = iconElement.querySelector('i');

    // Toggle password field visibility
    if (inputField.type === "password") {
        inputField.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash'); // Switch to 'eye-slash' icon
    } else {
        inputField.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye'); // Switch back to 'eye' icon
    }
}