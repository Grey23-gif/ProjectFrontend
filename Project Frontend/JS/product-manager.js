// Lấy dữ liệu từ localStorage hoặc khởi tạo mảng rỗng
const productList = JSON.parse(localStorage.getItem("products")) || [];

// Lấy các phần tử DOM cần thiết
const addProduct = document.querySelector("#addProduct");
const saveProductBtn = document.querySelector(".btn.btn-primary");
const nameProduct = document.querySelector("#nameProduct");
const categoryProduct = document.querySelector("#categoryProduct");
const questionProduct = document.querySelector("#questionProduct");
const timeProduct = document.querySelector("#timeProduct");
const productsList = document.querySelector("#tableProduct tbody");
const modalElement = document.querySelector(".modal");
const modal = new bootstrap.Modal(modalElement);

// Khi bấm nút "Thêm bài test"
addProduct.addEventListener("click", () => {
    modal.show();
});

// Khi bấm nút "Lưu"
saveProductBtn.addEventListener("click", () => {
    if (
        !validateInput(nameProduct, "Vui lòng nhập tên bài test") ||
        !validateInput(categoryProduct, "Vui lòng nhập danh mục") ||
        !validateInput(questionProduct, "Vui lòng nhập số câu hỏi") ||
        !validateInput(timeProduct, "Vui lòng nhập thời gian")
    ) return;

    const newId = productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        name: nameProduct.value,
        category: categoryProduct.value,
        questionCount: questionProduct.value,
        time: timeProduct.value
    };

    productList.push(newProduct);
    localStorage.setItem("products", JSON.stringify(productList));

    addProductRow(newProduct);

    nameProduct.value = "";
    categoryProduct.value = "";
    questionProduct.value = "";
    timeProduct.value = "";
    modal.hide();
});

function addProductRow(product) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.questionCount}</td>
        <td>${product.time}</td>
        <td>
            <button class="edit">Sửa</button>
            <button class="delete">Xóa</button>
        </td>
    `;
    productsList.appendChild(newRow);
    attachEventListenersToRow(newRow);
}

function attachEventListenersToRow(row) {
    row.querySelector(".edit").addEventListener("click", () => {
        // Xử lý sửa
    });

    row.querySelector(".delete").addEventListener("click", () => {
        const id = parseInt(row.children[0].textContent);
        const index = productList.findIndex(p => p.id === id);
        if (index !== -1) {
            productList.splice(index, 1);
            localStorage.setItem("products", JSON.stringify(productList));
            row.remove();
        }
    });
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

// Hiển thị sản phẩm có sẵn khi tải trang
productList.forEach(product => {
    addProductRow(product);
});
