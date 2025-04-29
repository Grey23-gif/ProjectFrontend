const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");
const loginButton = document.getElementById("btnLogin");

const emailGroupLogin = document.getElementById("emailGroupLogin");
const passwordGroupLogin = document.getElementById("passwordGroupLogin");

function clearErrors() {
    emailGroupLogin.classList.remove('error');
    passwordGroupLogin.classList.remove('error');
}

function showError(element, message) {
    element.classList.add('error');
    const errorMessage = document.createElement("p");
    errorMessage.textContent = message;
    element.appendChild(errorMessage);
}

function loginAccount() {
    const email = emailLogin.value.trim();
    const password = passwordLogin.value.trim();
    let hasError = false;

    clearErrors();

    if (!email) {
        showError(emailGroupLogin, "Vui lòng nhập email.");
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(emailGroupLogin, "Email không hợp lệ.");
        hasError = true;
    }

    if (!password) {
        showError(passwordGroupLogin, "Vui lòng nhập mật khẩu.");
        hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(user => user.email === email);
    if (!foundUser) {
        showError(emailGroupLogin, "Email không tồn tại.");
        return;
    }

    if (foundUser.password !== password) {
        showError(passwordGroupLogin, "Mật khẩu không đúng.");
        return;
    }

    localStorage.setItem("userLoggedIn", JSON.stringify({
        email: email,
        role: foundUser.role // lưu vai trò của người dùng
    }));

    if (foundUser.role === 'admin') {
        window.location.href = "category-manager.html";  
    } else {
        window.location.href = "dashboard.html"; 
    }
}

window.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("userLoggedIn")) {
        const loggedInUser = JSON.parse(localStorage.getItem("userLoggedIn"));
        if (loggedInUser.role === 'admin') {
            window.location.href = "category-manager.html";
        } else {
            window.location.href = "dashboard.html"; 
        }
    }
});

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    loginAccount();
});
