const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");
const loginButton = document.getElementById("btnLogin");

const emailGroupLogin = document.getElementById("emailGroupLogin"); 
const passwordGroupLogin = document.getElementById("passwordGroupLogin");

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

    window.location.href = "../Pages/dashboard.html";
}

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    loginAccount();
});
