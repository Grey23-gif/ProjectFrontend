// Kiểm tra trạng thái đăng nhập khi trang dashboard được tải
document.addEventListener("DOMContentLoaded", function() {
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    
    // Nếu không có người dùng đăng nhập, chuyển hướng về trang login
    if (!userLoggedIn) {
        window.location.href = "login.html"; // Chuyển hướng đến trang login
    }
});

function logout() {
    localStorage.removeItem("userLoggedIn");
    window.location.href = "login.html"; 
}

document.getElementById("logoutLink").addEventListener("click", function(e) {
    e.preventDefault(); // Ngăn hành động mặc định của thẻ <a>
    logout();
});
