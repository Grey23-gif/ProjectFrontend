document.addEventListener("DOMContentLoaded", function () {
    let currentAction = "";
    let currentEditingId = null;
    let deleteId = null;

    const categoryList = JSON.parse(localStorage.getItem("categories")) || [];
    const addCategory = document.querySelector("#addCategory");
    const addCategoryBtn = document.querySelector("#saveBtn");
    const nameCategory = document.querySelector("#nameCategory");
    const emoji = document.querySelector("#emojiCategory");
    const categoriesList = document.querySelector("#categoriesList");
    const paginationContainer = document.querySelector("#pagination");

    const modalElement = document.querySelector(".modal");
    const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

    const modalElement2 = document.querySelector("#modalConfirm");
    const modal2 = modalElement2 ? new bootstrap.Modal(modalElement2) : null;

    const confirmMessage = document.querySelector(".confirm-message");
    const confirmBtn = document.querySelector("#confirmBtn");

    let currentPage = 1;
    const itemsPerPage = 5; // Mỗi trang gồm 5 dòng
    let currentDisplayedCategories = [...categoryList]; // Danh sách hiện tại (sau khi lọc/sắp xếp)

    if (addCategory) {
        addCategory.addEventListener("click", () => {
            currentAction = "add";
            currentEditingId = null;
            nameCategory.value = "";
            emoji.value = "";
            modal?.show();
        });
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener("click", () => {
            if (!validateInput(nameCategory, "Vui lòng nhập tên danh mục") || !validateInput(emoji, "Vui lòng nhập emoji")) {
                return;
            }

            if (nameCategory.value.trim().length < 4) {
                nameCategory.classList.add("input-error");
                const error = document.createElement("div");
                error.className = "error-message w-100 mt-2";
                error.textContent = "Tên danh mục phải có ít nhất 4 ký tự.";
                nameCategory.parentNode.appendChild(error);
                return;
            }

            const isDuplicate = categoryList.some(category =>
                category.name.trim().toLowerCase() === nameCategory.value.trim().toLowerCase()
            );

            if (isDuplicate && currentAction === "add" || isDuplicate && currentAction === "edit") {
                nameCategory.classList.add("input-error");
                const error = document.createElement("div");
                error.className = "error-message w-100 mt-2";
                error.textContent = "Tên danh mục đã tồn tại.";
                nameCategory.parentNode.appendChild(error);
                return;
            }

            if (currentAction === "add") {
                confirmMessage.textContent = `Bạn có chắc chắn muốn thêm danh mục ${emoji.value} ${nameCategory.value} không?`;
            } else if (currentAction === "edit") {
                confirmMessage.textContent = `Bạn có chắc chắn muốn sửa danh mục ${emoji.value} ${nameCategory.value} không?`;
            }

            modal.hide();
            modal2.show();
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (currentAction === "add") {
                const newId = categoryList.length > 0 ? Math.max(...categoryList.map(c => c.id)) + 1 : 1;
                categoryList.push({
                    id: newId,
                    name: nameCategory.value,
                    emoji: emoji.value
                });
            } else if (currentAction === "edit") {
                const index = categoryList.findIndex(c => c.id === currentEditingId);
                if (index !== -1) {
                    categoryList[index].name = nameCategory.value;
                    categoryList[index].emoji = emoji.value;
                }
            } else if (currentAction === "delete") {
                const index = categoryList.findIndex(c => c.id === deleteId);
                if (index !== -1) {
                    categoryList.splice(index, 1);
                }
            }

            localStorage.setItem("categories", JSON.stringify(categoryList));
            currentDisplayedCategories = [...categoryList]; // Cập nhật danh sách hiển thị
            renderCategoryList(currentPage); // Render lại với trang hiện tại

            modal2.hide();
            modal?.hide();
            currentAction = "";
        });
    }

    function addCategoryRow(category) {
        if (!categoriesList) {
            console.error("Categories list element not found!");
            return;
        }

        const newRow = document.createElement("tr");

        newRow.innerHTML = `
        <td>${category.id}</td>
        <td>${category.emoji} ${category.name}</td>
        <td>
            <button class="edit btn btn-primary btn-sm">Sửa</button>
            <button class="delete btn btn-danger btn-sm">Xóa</button>
        </td>
    `;

        categoriesList.appendChild(newRow);
        attachEventListenersToRow(newRow, category);
    }

    function attachEventListenersToRow(row, category) {
        row.querySelector(".edit").addEventListener("click", () => {
            currentAction = "edit";
            currentEditingId = category.id;
            nameCategory.value = category.name;
            emoji.value = category.emoji;
            modal.show();
        });

        row.querySelector(".delete").addEventListener("click", () => {
            currentAction = "delete";
            deleteId = category.id;
            confirmMessage.textContent = `Bạn có chắc chắn muốn xóa danh mục ${category.emoji} ${category.name} không?`;
            modal2.show();
        });
    }

    function renderCategoryList(page = 1) {
        if (!categoriesList) {
            console.error("Categories list element not found!");
            return;
        }

        categoriesList.innerHTML = "";

        if (!currentDisplayedCategories || currentDisplayedCategories.length === 0) {
            categoriesList.innerHTML = '<tr><td colspan="3">Không có danh mục nào.</td></tr>';
            renderPagination(0, page);
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const paginatedCategories = currentDisplayedCategories.slice(startIndex, startIndex + itemsPerPage);

        paginatedCategories.forEach(addCategoryRow);

        renderPagination(currentDisplayedCategories.length, page);
    }

    function renderPagination(totalItems, page) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;

        const maxVisibleButtons = 3;

        // Nút Previous
        const prevButton = document.createElement('button');
        prevButton.textContent = '«';
        prevButton.className = 'pagination-button pagination-prev';
        prevButton.disabled = page === 1;
        prevButton.addEventListener('click', () => {
            if (page > 1) renderCategoryList(page - 1);
        });
        paginationContainer.appendChild(prevButton);

        // Tính toán các trang hiển thị
        let startPage, endPage;
        if (totalPages <= maxVisibleButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfVisible = Math.floor(maxVisibleButtons / 2);
            if (page <= halfVisible + 1) {
                startPage = 1;
                endPage = maxVisibleButtons;
            } else if (page >= totalPages - halfVisible) {
                startPage = totalPages - maxVisibleButtons + 1;
                endPage = totalPages;
            } else {
                startPage = page - halfVisible;
                endPage = page + halfVisible;
                if (maxVisibleButtons % 2 === 0) endPage = page + halfVisible - 1;
            }
        }

        startPage = Math.max(1, startPage);
        endPage = Math.min(totalPages, endPage);

        // Tạo các nút số trang
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'pagination-button pagination-number';
            if (i === page) {
                btn.classList.add('active');
                btn.disabled = true;
            }
            btn.addEventListener('click', () => {
                if (i !== page) renderCategoryList(i);
            });
            paginationContainer.appendChild(btn);
        }

        // Nút Next
        const nextButton = document.createElement('button');
        nextButton.textContent = '»';
        nextButton.className = 'pagination-button pagination-next';
        nextButton.disabled = page === totalPages;
        nextButton.addEventListener('click', () => {
            if (page < totalPages) renderCategoryList(page + 1);
        });
        paginationContainer.appendChild(nextButton);
    }

    function validateInput(input, message) {
        input.classList.remove("input-error");
        input.parentNode.querySelector(".error-message")?.remove();

        if (!input.value.trim()) {
            input.classList.add("input-error");
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = message;
            input.parentNode.appendChild(error);
            return false;
        }
        return true;
    }

    renderCategoryList();

    // Khởi tạo danh mục mặc định
    (function () {
        const defaultCategories = [
            { id: 1, name: "Toán học", emoji: "🧮" },
            { id: 2, name: "Văn học", emoji: "📚" },
            { id: 3, name: "Lịch sử", emoji: "🏛️" },
            { id: 4, name: "Địa lý", emoji: "🌍" },
            { id: 5, name: "Tiếng Anh", emoji: "🗣️" }
        ];

        const existing = JSON.parse(localStorage.getItem("categories")) || [];

        if (existing.length === 0) {
            localStorage.setItem("categories", JSON.stringify(defaultCategories));
        }
    })();
});

// Xử lý đăng nhập
document.addEventListener("DOMContentLoaded", function () {
    const userLoggedIn = localStorage.getItem("userLoggedIn");

    if (!userLoggedIn) {
        window.location.href = "login.html";
    }
});

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem("userLoggedIn");
    window.location.href = "login.html";
}

if (document.getElementById("logoutLink")) {
    document.getElementById("logoutLink").addEventListener("click", function (e) {
        e.preventDefault();
        logout();
    });
}