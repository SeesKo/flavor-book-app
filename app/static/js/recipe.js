document.addEventListener("DOMContentLoaded", function () {
    // Function to toggle the visibility of the menu
    function toggleMenu() {
        var menu = document.getElementById("menu");
        if (menu.classList.contains("hidden")) {
            menu.classList.remove("hidden");
            menu.style.display = 'block'; // Make menu visible
        } else {
            menu.classList.add("hidden");
            menu.style.display = 'none'; // Hide the menu
        }
    }

    // Attach the click event listener to the dots
    document.querySelector(".menu-dots").addEventListener("click", function(event) {
        event.stopPropagation(); // Prevent the click from triggering the document click listener
        toggleMenu(); // Call the toggleMenu function
    });

    // Hide the menu when clicking outside of it
    document.addEventListener("click", function(event) {
        var menu = document.getElementById("menu");
        if (!menu.contains(event.target) && !document.querySelector(".menu-dots").contains(event.target)) {
            menu.classList.add("hidden");
            menu.style.display = 'none';
        }
    });

    // Custom delete confirmation modal logic
    const deleteRecipeForm = document.getElementById('deleteRecipeForm');
    const deleteModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');

    if (deleteRecipeForm) {
        // Override the default delete action
        deleteRecipeForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission
            deleteModal.style.display = 'block'; // Show the custom modal
        });

        // Handle the custom delete button
        confirmDeleteButton.addEventListener('click', function() {
            deleteRecipeForm.submit(); // Submit the form when the user confirms
        });

        // Handle the custom cancel button
        cancelDeleteButton.addEventListener('click', function() {
            deleteModal.style.display = 'none'; // Hide the modal if the user cancels
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const likeForms = document.querySelectorAll('.like-section form');

    likeForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const button = this.querySelector('.like-button');
            const likeCountSpan = this.parentElement.querySelector('.like-count'); // Ensure correct scope

            fetch(this.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(this))
            })
            .then(response => response.json())
            .then(data => {
                // Update button and like count based on response
                if (data.liked) {
                    button.classList.add('liked');
                    likeCountSpan.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                    likeCountSpan.classList.remove('liked');
                }

                // Update like count text
                likeCountSpan.innerHTML = data.like_count_text;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const commentForm = document.getElementById('comment-form');
    const commentCountElement = document.querySelector('.comment-section p');
    const commentsList = document.getElementById('comments-list');

    // Helper function to update the comment count text
    function updateCommentCount(count) {
        if (count === 0) {
            commentCountElement.textContent = 'No reviews yet';
            commentCountElement.classList.remove('has-comments');
            commentCountElement.classList.add('no-comments');
        } else if (count === 1) {
            commentCountElement.textContent = '1 review';
            commentCountElement.classList.remove('no-comments');
            commentCountElement.classList.add('has-comments');
        } else {
            commentCountElement.textContent = `${count} reviews`;
            commentCountElement.classList.remove('no-comments');
            commentCountElement.classList.add('has-comments');
        }
    }

    // Handle the comment submission
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const formData = new FormData(commentForm);

            fetch(commentForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the comment list with the new comment
                    commentsList.innerHTML += `
                        <div class="user-comment" id="comment-${data.comment.id}">
                            <div class="comment-author">
                                <span><i class="fa-solid fa-feather"></i> ${data.comment.user.username}</span>
                                <form class="delete-comment-form" action="/comment/${data.comment.id}/delete" method="post">
                                    <button type="submit" class="btn btn-link p-0">
                                        <i class="bi bi-trash-fill delete-icon"></i>
                                    </button>
                                </form>
                            </div>
                            <div class="comment-text">${data.comment.text}</div>
                        </div>
                    `;
                    // Update the comment count
                    updateCommentCount(data.comment_count);

                    // Clear the comment box
                    commentForm.querySelector('textarea').value = '';
                } else {
                    console.error('Error adding comment:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Handle comment deletion using event delegation
    document.addEventListener('submit', function(event) {
        if (event.target.matches('.delete-comment-form')) {
            event.preventDefault(); // Prevent the default form submission

            const form = event.target;

            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(form))
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the comment from the DOM
                    const commentElement = document.getElementById(`comment-${data.comment_id}`);
                    if (commentElement) {
                        commentElement.remove();
                    }

                    // Update the comment count
                    updateCommentCount(data.comment_count);
                } else {
                    console.error('Error deleting comment:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});