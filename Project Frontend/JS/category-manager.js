const categoryList = JSON.parse(localStorage.getItem("categories")) || [];
const addCategory = document.querySelector("#addCategory");
const addCategoryBtn = document.querySelector(".btn.btn-primary");
const nameCategory = document.querySelector("#nameCategory");
const emoji = document.querySelector("#emojiCategory");
const categoriesList = document.querySelector("#categoriesList");

const modalElement = document.querySelector(".modal");
const modal = new bootstrap.Modal(modalElement);
const modalElement2 = document.querySelector("#modalConfirm");
const modal2 = new bootstrap.Modal(modalElement2);
const confirmMessage = document.querySelector('.confirm-message');
const confirmBtn = document.querySelector("#confirmBtn");

addCategory.addEventListener("click", () => {
    modal.show();
});

addCategoryBtn.addEventListener("click", () => {
    addCategoryForm();
});

function addCategoryForm() {
    if (!validateInput(nameCategory, "Vui lòng nhập tên danh mục") || !validateInput(emoji, "Vui lòng nhập emoji"))
        return;

    const newId = categoryList.length > 0 ? Math.max(...categoryList.map(category => category.id)) + 1 : 1;

    const newCategory = {
        id: newId,
        name: nameCategory.value,
        emoji: emoji.value,
    };

    categoryList.push(newCategory);
    localStorage.setItem("categories", JSON.stringify(categoryList));

    addCategoryRow(newCategory);

    nameCategory.value = "";
    emoji.value = "";
    modal.hide();
};

function addCategoryRow(newCategory) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${newCategory.id}</td>
        <td>${newCategory.emoji} ${newCategory.name}</td>
        <td>
            <button class="edit">Sửa</button>
            <button class="delete">Xóa</button>
        </td>
        `;

    categoriesList.appendChild(newRow);
    attachEventListenersToRow(newRow, newCategory);
}

function attachEventListenersToRow(row, category) {
    row.querySelector(".edit").addEventListener("click", () => {
        confirmMessage.textContent = `Bạn có chắc chắn muốn sửa danh mục ${category.emoji} ${category.name} không?`;
        modal2.show();
        confirmBtn.addEventListener("click" , ()=> {
            modal2.hide();
            modal.show();

            nameCategory.value = category.name;
            emoji.value = category.emoji;

            if (!validateInput(nameCategory, "Vui lòng nhập tên danh mục") || !validateInput(emoji, "Vui lòng nhập emoji"))
                return;

            category.name = nameCategory.value;
            category.emoji = emoji.value;

            const index = categoryList.findIndex(cat => cat.id === category.id);
            if (index !== -1) {
                categoryList[index] = category;
                localStorage.setItem("categories", JSON.stringify(categoryList));
            }

            row.querySelectorAll("td")[1].textContent = `${category.emoji} ${category.name}`;
        
            modal.hide();
        
            addCategoryBtn.onclick = addCategoryForm;
        })
    });

    row.querySelector(".delete").addEventListener("click", () => {
        modal2.show();
        confirmMessage.textContent = `Bạn có chắc chắn muốn xóa danh mục ${category.emoji} ${category.name} không?`;
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

// Hiển thị danh sách danh mục từ localStorage
categoryList.forEach(category => {
    addCategoryRow(category);
});