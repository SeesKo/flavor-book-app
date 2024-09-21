// Open Modal
function openModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "flex"; // Use flex to center modal
}

// Close Modal
function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Close Modal when clicking outside the modal content
function clickOutsideModal(event, modalId) {
    var modal = document.getElementById(modalId);
    var modalContent = modal.querySelector('.modal-content');

    // If the click is outside the modal content, close the modal
    if (event.target === modal) {
        closeModal(modalId);
    }
}

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


// Send updated name to the server
function updateName() {
    var nameInput = document.getElementById('nameInput').value;
    fetch('/update_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `name=${encodeURIComponent(nameInput)}`,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            closeModal('nameModal');
            location.reload(); // Reload to reflect changes
        } else {
            console.error('Error:', result.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Send updated email to the server
function updateEmail() {
    var emailInput = document.getElementById('emailInput').value;

    // Simple email format validation
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput)) {
        alert('Please enter a valid email address.');
        return;
    }

    fetch('/update_email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `email=${encodeURIComponent(emailInput)}`,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            closeModal('emailModal');
            location.reload(); // Reload to reflect changes
        } else {
            alert(result.message); // Display error message from server
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the email. Please try again.');
    });
}

// Send updated password to server
function updatePassword() {
    var currentPassword = document.getElementById('currentPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var passwordError = document.getElementById('passwordError');

    // Clear previous error message
    passwordError.style.display = 'none';

    // Validate new password length
    if (newPassword.length < 8) {
        passwordError.textContent = "New password must be at least 8 characters long.";
        passwordError.style.display = 'block';
        return;
    }

    // Validate new password matches confirm password
    if (newPassword !== confirmPassword) {
        passwordError.textContent = "Passwords do not match.";
        passwordError.style.display = 'block';
        return;
    }

    fetch('/update_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `currentPassword=${encodeURIComponent(currentPassword)}&` +
              `newPassword=${encodeURIComponent(newPassword)}&` +
              `confirmPassword=${encodeURIComponent(confirmPassword)}`,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            closeModal('passwordModal');
            location.reload(); // Reload to reflect password change
        } else {
            passwordError.textContent = result.message;
            passwordError.style.display = 'block';
        }
    })
    .catch(error => {
        passwordError.textContent = 'An error occurred. Please try again.';
        passwordError.style.display = 'block';
        console.error('Error:', error);
    });
}

// Function to handle the account deletion
function confirmDeletion() {
    // Show a confirmation dialog
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        // Submit the form if the user confirms
        document.getElementById('deleteAccountForm').submit();
    } else {
        // Close the modal if the user cancels
        closeModal('deleteModal');
    }
}

// Logout User
function logoutUser() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'  // Send cookies with the request
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;  // Redirect to login page
        } else {
            console.error('Logout failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Set the current year in the footer
const currentYear = new Date().getFullYear();
document.getElementById('year').textContent = currentYear;
