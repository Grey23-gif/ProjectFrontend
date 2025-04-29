const nameRegister = document.getElementById("nameRegister");
const emailRegister = document.getElementById("emailRegister");
const passwordRegister = document.getElementById("passwordRegister");
const confirmPasswordRegister = document.getElementById("confirmPassword");
const registerButton = document.getElementById("btnRegister");

const nameGroup = document.getElementById("nameGroup");
const emailGroup = document.getElementById("emailGroup");
const passwordGroup = document.getElementById("passwordGroup");
const confirmGroup = document.getElementById("confirmGroup");

function registerAccount() {
    const nameUser = nameRegister.value.trim();
    const email = emailRegister.value.trim();
    const password = passwordRegister.value.trim();
    const confirmPassword = confirmPasswordRegister.value.trim();

    clearErrors(); // Xóa lỗi cũ

    let hasError = false;
    if(!nameUser) {
        showError(nameGroup, "Vui lòng nhập họ và tên.");
        hasError = true;
    }
    if (!email) {
        showError(emailGroup, "Vui lòng nhập email.");
        hasError = true;
    }

    if (!password) {
        showError(passwordGroup, "Vui lòng nhập mật khẩu.");
        hasError = true;
    }

    if (!confirmPassword) {
        showError(confirmGroup, "Vui lòng xác nhận mật khẩu.");
        hasError = true;
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(emailGroup, "Email không hợp lệ.");
        hasError = true;
    }

    if (password && password.length < 8) {
        showError(passwordGroup, "Mật khẩu phải có ít nhất 8 ký tự.");
        hasError = true;
    }

    if (password && confirmPassword && password !== confirmPassword) {
        showError(confirmGroup, "Mật khẩu không khớp.");
        hasError = true;
    }

    if (hasError) return;

    // Xử lý đăng ký
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        showError(emailGroup, "Email đã tồn tại.");
        return;
    }

    const newUser = {nameUser, email, password, role: "user"};
    users.push({
        nameUser: "Thanh Thanh",
        email: "thanhthanh123@gmail.com",
        password: "1234568",
        role: "admin"
    });
    users.push(newUser);
    
    localStorage.setItem("users", JSON.stringify(users));

    window.location.href = "login.html"; 
}

registerButton.addEventListener("click", (e) => {
    e.preventDefault();
    registerAccount();
});
