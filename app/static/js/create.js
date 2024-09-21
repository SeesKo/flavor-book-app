document.getElementById('image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const errorContainer = document.getElementById('errorContainer');
    previewContainer.innerHTML = ''; // Clear any previous preview
    errorContainer.textContent = ''; // Clear any previous error message

    if (file) {
        // Check if the file is an image and has the correct extension
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            errorContainer.textContent = '- Please upload an image file (JPG or PNG).';
            document.getElementById('image').value = ''; // Clear the file input
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px'; // Optional: limit the image size
            img.style.maxHeight = '140px'; // Optional: limit the image size
            previewContainer.appendChild(img);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '\u2716'; // Unicode for 'X'
            removeBtn.className = 'remove-btn'; // Optional: add class for styling
            removeBtn.addEventListener('click', () => {
                document.getElementById('image').value = ''; // Clear the file input
                previewContainer.innerHTML = ''; // Remove the preview
                errorContainer.textContent = ''; // Clear the error message
            });
            previewContainer.appendChild(removeBtn);
        }
        reader.readAsDataURL(file);
    }

    if (file && file.size > 4 * 1024 * 1024) {  // 4MB limit
        errorContainer.textContent = '- Image must be 4MB or smaller.';
        document.getElementById('image').value = ''; // Clear the file input
        return;
    }
});

// Function to handle real-time feedback based on character count
function setupFeedback(inputElement, feedbackElement, minLength, maxLength) {
    inputElement.addEventListener('input', function() {
        const inputLength = inputElement.value.length;

        if (inputLength < minLength) {
            feedbackElement.innerHTML = '- Too short <i class="bi bi-x-circle-fill"></i>';
            feedbackElement.style.color = 'red';
            inputElement.style.borderColor = 'red';
        } else if (inputLength >= minLength && inputLength < maxLength) {
            feedbackElement.innerHTML = '- OK <i class="bi bi-check-circle-fill"></i>';
            feedbackElement.style.color = 'green';
            inputElement.style.borderColor = 'green';
        } else {
            feedbackElement.innerHTML = '- Limit reached <i class="bi bi-dash-circle-fill"></i>';
            feedbackElement.style.color = 'grey';
            inputElement.style.borderColor = 'grey';
            inputElement.value = inputElement.value.substring(0, maxLength); // Trim the input to maxLength
        }
    });
}

// Function to handle real-time feedback based on word count with minimum word length
function setupWordFeedback(inputElement, feedbackElement, minWords, maxWords, minWordLength) {
    inputElement.addEventListener('input', function() {
        // Split input value by whitespace and filter out short words
        let words = inputElement.value.trim().split(/\s+/).filter(word => word.length >= minWordLength);
        let wordCount = words.length;

        if (wordCount > maxWords) {
            // If there are more words than allowed, truncate the list of words
            words = words.slice(0, maxWords);
            inputElement.value = words.join(' '); // Update the input value to the truncated list
            wordCount = words.length; // Update wordCount after truncation
        }

        // Update feedback based on the current word count
        if (wordCount < minWords) {
            feedbackElement.textContent = '- Too few words';
            feedbackElement.style.color = 'red';
            inputElement.style.borderColor = 'red';
        } else if (wordCount >= minWords && wordCount <= maxWords) {
            feedbackElement.textContent = '- OK';
            feedbackElement.style.color = 'green';
            inputElement.style.borderColor = 'green';
        } else {
            feedbackElement.textContent = '- Limit reached';
            feedbackElement.style.color = 'grey';
            inputElement.style.borderColor = 'grey';
        }
    });
}

// Initialize feedback for Title
const titleInput = document.getElementById('title');
const titleFeedback = document.getElementById('titleFeedback');
setupFeedback(titleInput, titleFeedback, 7, 70);

// Initialize feedback for Description
const descriptionInput = document.getElementById('description');
const descriptionFeedback = document.getElementById('descriptionFeedback');
setupFeedback(descriptionInput, descriptionFeedback, 75, 300);

// Initialize feedback for Ingredients
const ingredientsInput = document.getElementById('ingredients');
const ingredientsFeedback = document.getElementById('ingredientsFeedback');
setupFeedback(ingredientsInput, ingredientsFeedback, 5, 300);

// Initialize feedback for Preparation
const prepInput = document.getElementById('prep');
const prepFeedback = document.getElementById('prepFeedback');
setupFeedback(prepInput, prepFeedback, 70, 2500);

// Initialize feedback for Tags based on word count with minimum word length
const tagsInput = document.getElementById('tags');
const tagsFeedback = document.getElementById('tagsFeedback');
setupWordFeedback(tagsInput, tagsFeedback, 1, 10, 3);


// Function to validate the title field
function validateTitle() {
    const titleInput = document.getElementById('title');
    const titleFeedback = document.getElementById('titleFeedback');
    const minLength = 7;
    const maxLength = 50;

    const titleLength = titleInput.value.length;

    if (titleLength < minLength) {
        titleFeedback.textContent = '- Too short';
        titleFeedback.style.color = 'red';
        titleInput.style.borderColor = 'red';
        return false;
    } else if (titleLength > maxLength) {
        titleFeedback.textContent = '- Limit reached';
        titleFeedback.style.color = 'grey';
        titleInput.style.borderColor = 'grey';
        titleInput.value = titleInput.value.substring(0, maxLength); // Trim the input to maxLength
        return false;
    } else {
        titleFeedback.textContent = '- OK';
        titleFeedback.style.color = 'green';
        titleInput.style.borderColor = 'green';
        return true;
    }
}

// Function to validate the description field
function validateDescription() {
    const descriptionInput = document.getElementById('description');
    const descriptionFeedback = document.getElementById('descriptionFeedback');
    const minLength = 75;
    const maxLength = 300;

    const descriptionLength = descriptionInput.value.length;

    if (descriptionLength < minLength) {
        descriptionFeedback.textContent = '- Too short';
        descriptionFeedback.style.color = 'red';
        descriptionInput.style.borderColor = 'red';
        return false;
    } else if (descriptionLength > maxLength) {
        descriptionFeedback.textContent = '- Limit reached';
        descriptionFeedback.style.color = 'grey';
        descriptionInput.style.borderColor = 'grey';
        descriptionInput.value = descriptionInput.value.substring(0, maxLength); // Trim the input to maxLength
        return false;
    } else {
        descriptionFeedback.textContent = '- OK';
        descriptionFeedback.style.color = 'green';
        descriptionInput.style.borderColor = 'green';
        return true;
    }
}

// Function to validate the image field
function validateImage() {
    const imageInput = document.getElementById('image');
    const errorContainer = document.getElementById('errorContainer');

    if (imageInput.files.length === 0) {
        errorContainer.textContent = '- Please upload an image file (JPG or PNG).';
        return false;
    } else {
        errorContainer.textContent = ''; // Clear any previous error message
        return true;
    }
}

// Function to validate the ingredients field
function validateIngredients() {
    const ingredientsInput = document.getElementById('ingredients');
    const ingredientsFeedback = document.getElementById('ingredientsFeedback');
    const minLength = 5;
    const maxLength = 300;

    const ingredientsLength = ingredientsInput.value.length;

    if (ingredientsLength < minLength) {
        ingredientsFeedback.textContent = '- Too short';
        ingredientsFeedback.style.color = 'red';
        ingredientsInput.style.borderColor = 'red';
        return false;
    } else if (ingredientsLength > maxLength) {
        ingredientsFeedback.textContent = '- Limit reached';
        ingredientsFeedback.style.color = 'grey';
        ingredientsInput.style.borderColor = 'grey';
        ingredientsInput.value = ingredientsInput.value.substring(0, maxLength); // Trim the input to maxLength
        return false;
    } else {
        ingredientsFeedback.textContent = '- OK';
        ingredientsFeedback.style.color = 'green';
        ingredientsInput.style.borderColor = 'green';
        return true;
    }
}

// Function to validate the preparation field
function validatePreparation() {
    const prepInput = document.getElementById('prep');
    const prepFeedback = document.getElementById('prepFeedback');
    const minLength = 50;
    const maxLength = 4500;

    const prepLength = prepInput.value.length;

    if (prepLength < minLength) {
        prepFeedback.textContent = '- Too short';
        prepFeedback.style.color = 'red';
        prepInput.style.borderColor = 'red';
        return false;
    } else if (prepLength > maxLength) {
        prepFeedback.textContent = '- Limit reached';
        prepFeedback.style.color = 'grey';
        prepInput.style.borderColor = 'grey';
        prepInput.value = prepInput.value.substring(0, maxLength); // Trim the input to maxLength
        return false;
    } else {
        prepFeedback.textContent = '- OK';
        prepFeedback.style.color = 'green';
        prepInput.style.borderColor = 'green';
        return true;
    }
}

// Validate all required fields on form submission
function validateForm() {
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isImageValid = validateImage();
    const isIngredientsValid = validateIngredients();
    const isPreparationValid = validatePreparation();

    // Check if all required fields are valid
    return isTitleValid && isDescriptionValid && isImageValid && isIngredientsValid && isPreparationValid;
}

// Show custom alert function
function showCustomAlert() {
    document.getElementById('customAlert').style.display = 'block';
}

// Handle form submission only for the Create form
const createForm = document.getElementById('createForm');
if (createForm) {
    createForm.addEventListener('submit', function(event) {
        if (!validateForm()) {
            event.preventDefault(); // Prevent form submission if validation fails
            showCustomAlert(); // Show the custom alert
        }
    });
}

// Optional: Close the alert when clicking outside the modal
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('customAlert')) {
        document.getElementById('customAlert').style.display = 'none';
    }
});

// Close the alert when clicking the OK button
document.getElementById('okButton').addEventListener('click', function() {
    document.getElementById('customAlert').style.display = 'none';
});

// Set the current year in the footer
const currentYear = new Date().getFullYear();
document.getElementById('year').textContent = currentYear;
