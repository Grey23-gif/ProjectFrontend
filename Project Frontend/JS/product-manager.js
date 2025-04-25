let currentAction = "";
let currentEditingId = null;
let deleteId = null;

const productList = JSON.parse(localStorage.getItem("products")) || [];
const categoryList = JSON.parse(localStorage.getItem("categories")) || [];

const addProductBtn = document.querySelector("#addProduct");
const saveProductBtn = document.querySelector("#saveBtn");
const nameProduct = document.querySelector("#nameProduct");
const categoryProduct = document.querySelector("#categoriesList");
const questionProduct = document.querySelector("#questionProduct");
const timeProduct = document.querySelector("#timeProduct");
const productsList = document.querySelector("#productsList");

const modalElement = document.querySelector(".modal");
const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

const modalConfirmElement = document.querySelector("#modalConfirmProduct");
const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;

const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");

// Hiển thị danh mục trong dropdown
function populateCategoryDropdown() {
    categoryProduct.innerHTML = '<option value="">Chọn danh mục</option>';
    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = `${category.emoji} ${category.name}`;
        categoryProduct.appendChild(option);
    });
}

// Hiển thị modal thêm sản phẩm
if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
        currentAction = "add";
        currentEditingId = null;
        nameProduct.value = "";
        categoryProduct.value = "";
        questionProduct.value = "";
        timeProduct.value = "";
        populateCategoryDropdown();
        modal?.show();
    });
}

// Lưu sản phẩm (thêm hoặc sửa)
if (saveProductBtn) {
    saveProductBtn.addEventListener("click", () => {
        if (!validateInput(nameProduct, "Vui lòng nhập tên bài test") ||
            !validateInput(categoryProduct, "Vui lòng chọn danh mục") ||
            !validateInput(questionProduct, "Vui lòng nhập số câu hỏi") ||
            !validateInput(timeProduct, "Vui lòng nhập thời gian (phút)")) {
            return;
        }

        if (currentAction === "add") {
            confirmMessage.textContent = `Bạn có chắc chắn muốn thêm bài test ${nameProduct.value} không?`;
        } else if (currentAction === "edit") {
            confirmMessage.textContent = `Bạn có chắc chắn muốn sửa bài test ${nameProduct.value} không?`;
        }

        modal?.hide();
        modalConfirm?.show();
    });
}

// Xác nhận hành động (thêm, sửa, xóa)
if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
        const selectedCategory = categoryList.find(category => category.id === parseInt(categoryProduct.value));

        if (currentAction === "add") {
            const newId = productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1;
            const newProduct = {
                id: newId,
                name: nameProduct.value,
                category: selectedCategory,
                questions: questionProduct.value,
                time: timeProduct.value,
            };
            productList.push(newProduct);
        } else if (currentAction === "edit") {
            const index = productList.findIndex(p => p.id === currentEditingId);
            if (index !== -1) {
                productList[index].name = nameProduct.value;
                productList[index].category = selectedCategory;
                productList[index].questions = questionProduct.value;
                productList[index].time = timeProduct.value;
            }
        } else if (currentAction === "delete") {
            const index = productList.findIndex(p => p.id === deleteId);
            if (index !== -1) {
                productList.splice(index, 1);
            }
        }

        localStorage.setItem("products", JSON.stringify(productList));
        renderProductList();

        modalConfirm?.hide();
        modal?.hide();
        currentAction = "";
    });
}

function addProductRow(product) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category?.emoji || ""} ${product.category?.name || ""}</td>
        <td>${product.questions}</td>
        <td>${product.time}</td>
        <td>
            <button class="edit">Sửa</button>
            <button class="delete">Xóa</button>
        </td>
    `;

    productsList.appendChild(newRow);
    attachEventListenersToRow(newRow, product);
}

function attachEventListenersToRow(row, product) {
    row.querySelector(".edit").addEventListener("click", () => {
        currentAction = "edit";
        currentEditingId = product.id;
        nameProduct.value = product.name;
        categoryProduct.value = product.category?.id || "";
        questionProduct.value = product.questions;
        timeProduct.value = product.time;
        populateCategoryDropdown();
        modal?.show();
    });

    row.querySelector(".delete").addEventListener("click", () => {
        currentAction = "delete";
        deleteId = product.id;
        confirmMessage.textContent = `Bạn có chắc chắn muốn xóa bài test ${product.name} không?`;
        modalConfirm?.show();
    });
}

function renderProductList() {
    productsList.innerHTML = "";
    productList.forEach(addProductRow);
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

populateCategoryDropdown();
renderProductList();