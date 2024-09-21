// Toggle dropdown menu on click
document.getElementById('meButton').addEventListener('click', function() {
    var dropdown = document.getElementById('dropdownMenu');
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
});

// Optional: Hide dropdown if clicked outside
document.addEventListener('click', function(event) {
    var isClickInside = document.getElementById('meButton').contains(event.target) ||
                        document.getElementById('dropdownMenu').contains(event.target);
    if (!isClickInside) {
        document.getElementById('dropdownMenu').style.display = 'none';
    }
});
