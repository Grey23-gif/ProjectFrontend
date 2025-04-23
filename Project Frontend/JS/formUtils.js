function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
}

function showError(container, message) {
    const error = document.createElement("div");
    error.className = "error-message";
    error.innerText = message;
    container.appendChild(error);
}