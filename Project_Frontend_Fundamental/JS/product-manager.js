document.addEventListener("DOMContentLoaded", function () {
    const questionList = JSON.parse(localStorage.getItem("questions")) || [];
    const productList = JSON.parse(localStorage.getItem("products")) || [];
    const categoryList = JSON.parse(localStorage.getItem("categories")) || [];

    const productsListElement = document.querySelector("#productsList");
    const addProductBtn = document.querySelector("#addProduct");
    const sortProductSelect = document.querySelector("#sortProduct");
    const searchProductInput = document.querySelector("#searchProductByName");
    const paginationContainer = document.querySelector("#pagination");

    const modalConfirmElement = document.querySelector("#modalConfirm");
    const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;
    const confirmMessage = document.querySelector(".confirm-message");
    const confirmBtn = document.querySelector("#confirmBtn");

    let currentProductIdToDelete = null;
    let currentPage = 1;
    const itemsPerPage = 5; // Mỗi trang gồm 5 dòng
    let currentDisplayedProducts = [...productList]; // Danh sách hiện tại (sau khi lọc/sắp xếp)

    // Hàm hiển thị danh sách bài test với phân trang
    function renderProductList(filteredProducts = productList, page = 1) {
        if (!productsListElement) return;
        productsListElement.innerHTML = '';

        currentPage = page;

        if (!filteredProducts || filteredProducts.length === 0) {
            productsListElement.innerHTML = '<tr><td colspan="6">Không có bài test nào phù hợp.</td></tr>';
            renderPagination(0, currentPage);
            return;
        }

        // Phân trang
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

        // Hiển thị danh sách
        paginatedProducts.forEach(product => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${getCategoryName(product.categoryId)}</td>
                <td>${product.questions.length}</td>
                <td>${product.time} phút</td>
                <td>
                    <button class="edit btn btn-primary btn-sm" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="delete btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Xóa</button>
                </td>
            `;
            productsListElement.appendChild(newRow);
        });

        renderPagination(filteredProducts.length, currentPage);
    }

    // Hàm lấy tên danh mục
    function getCategoryName(categoryId) {
        const category = categoryList.find(c => c.id === categoryId);
        return category ? category.name : 'Chưa có danh mục';
    }

    // Hàm render phân trang
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
            if (page > 1) renderProductList(currentDisplayedProducts, page - 1);
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
                if (i !== page) renderProductList(currentDisplayedProducts, i);
            });
            paginationContainer.appendChild(btn);
        }

        // Nút Next
        const nextButton = document.createElement('button');
        nextButton.textContent = '»';
        nextButton.className = 'pagination-button pagination-next';
        nextButton.disabled = page === totalPages;
        nextButton.addEventListener('click', () => {
            if (page < totalPages) renderProductList(currentDisplayedProducts, page + 1);
        });
        paginationContainer.appendChild(nextButton);
    }

    // Thêm bài test mới
    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            window.location.href = "product-editor.html";
        });
    }

    // Sửa bài test
    window.editProduct = function (productId) {
        window.location.href = `product-editor.html?id=${productId}`;
    };

    // Xóa bài test
    window.deleteProduct = function (productId) {
        currentProductIdToDelete = productId;
        if (confirmMessage) confirmMessage.textContent = `Bạn có chắc chắn muốn xóa bài test này?`;
        if (modalConfirm) modalConfirm.show();
    };

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (currentProductIdToDelete !== null) {
                const index = productList.findIndex(p => p.id === currentProductIdToDelete);
                if (index !== -1) {
                    productList.splice(index, 1);
                    localStorage.setItem("products", JSON.stringify(productList));
                    currentDisplayedProducts = [...productList];
                    renderProductList(currentDisplayedProducts, currentPage > 1 ? currentPage : 1);
                }
                if (modalConfirm) modalConfirm.hide();
                currentProductIdToDelete = null;
            }
        });
    }

    // Sắp xếp
    if (sortProductSelect) {
        sortProductSelect.addEventListener("change", () => {
            const selectedOption = sortProductSelect.value;
            let sortedProducts = [...productList];

            if (selectedOption === "Sắp xếp theo tên") {
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (selectedOption === "Sắp xếp theo danh mục") {
                sortedProducts.sort((a, b) => {
                    const categoryA = getCategoryName(a.categoryId);
                    const categoryB = getCategoryName(b.categoryId);
                    return categoryA.localeCompare(categoryB);
                });
            }

            currentDisplayedProducts = sortedProducts;
            renderProductList(currentDisplayedProducts, 1);
        });
    }

    // Tìm kiếm
    if (searchProductInput) {
        searchProductInput.addEventListener("input", () => {
            const searchTerm = searchProductInput.value.toLowerCase();
            const filteredProducts = productList.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
            currentDisplayedProducts = filteredProducts;
            renderProductList(currentDisplayedProducts, 1);
        });
    }

    // Khởi tạo danh sách
    renderProductList(currentDisplayedProducts, currentPage);

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