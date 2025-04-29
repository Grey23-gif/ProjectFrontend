let currentAction = "";
let currentEditingId = null;
let deleteId = null;

const categoryList = JSON.parse(localStorage.getItem("categories")) || [];
const addCategory = document.querySelector("#addCategory");
const addCategoryBtn = document.querySelector("#saveBtn");
const nameCategory = document.querySelector("#nameCategory");
const emoji = document.querySelector("#emojiCategory");
const categoriesList = document.querySelector("#categoriesList");

const modalElement = document.querySelector(".modal");
const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

const modalElement2 = document.querySelector("#modalConfirm");
const modal2 = modalElement2 ? new bootstrap.Modal(modalElement2) : null;

const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");

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

        if (nameCategory.value.trim().length < 5) {
            nameCategory.classList.add("input-error");
            const error = document.createElement("div");
            error.className = "error-message w-100 mt-2";
            error.textContent = "Tên danh mục phải có ít nhất 5 ký tự.";
            nameCategory.parentNode.appendChild(error);
            return;
        }

        const isDuplicate = categoryList.some(category => 
            category.name.trim().toLowerCase() === nameCategory.value.trim().toLowerCase()
        );

        if (isDuplicate && currentAction === "add" || isDuplicate && currentAction === "edit" ) {
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
        renderCategoryList();

        modal2.hide();
        modal.hide();
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
            <button class="edit">Sửa</button>
            <button class="delete">Xóa</button>
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

function renderCategoryList() {
    if (!categoriesList) {
        console.error("Categories list element not found!");
        return;
    }

    categoriesList.innerHTML = "";
    categoryList.forEach(addCategoryRow);
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