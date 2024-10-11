document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#add_habit').onclick = function() {
        document.querySelector('#habitModal').style.display = 'block';
    };

    document.querySelector('.close').onclick = function() {
        document.querySelector('#habitModal').style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == document.querySelector('#habitModal')) {
            document.querySelector('#habitModal').style.display = 'none';
        }
    };
});


function repositionElements() {
    const pages = document.querySelectorAll('.page-item');
    const addButton = document.getElementById('add_habit');
    const pageContainer = document.getElementById('page-container');

    let totalWidth = 0;
    pages.forEach(page => {
        totalWidth += page.offsetWidth + 20; // Adding width of the page item and margin
    });

    addButton.style.left = totalWidth + 'px'; // Position the add button after the last page item
}

document.addEventListener('DOMContentLoaded', function() {
    repositionElements(); // Initial positioning of elements

    // Trigger repositioning after form submission and page reload
    document.querySelector('#addPageForm').onsubmit = function() {
        setTimeout(function() {
            repositionElements();
        }, 100); // Delay to allow DOM update
    };
});