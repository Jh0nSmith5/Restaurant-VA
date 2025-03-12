// script.js
document.addEventListener("DOMContentLoaded", () => {
    const tables = document.querySelectorAll(".table-button");

    tables.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("occupied");
            if (button.classList.contains("occupied")) {
                button.dataset.status = "occupied";
            } else {
                button.dataset.status = "free";
            }
        });
    });
});
