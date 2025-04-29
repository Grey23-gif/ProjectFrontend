const questionList = JSON.parse(localStorage.getItem("questions")) || [];
const productList = JSON.parse(localStorage.getItem("products")) || [];
const categoryList = JSON.parse(localStorage.getItem("categories")) || [];

const productsListElement = document.querySelector("#productsList");
const addProductBtn = document.querySelector("#addProduct");
const sortProductSelect = document.querySelector("#sortProduct");
const searchProductInput = document.querySelector("#searchProductByName");

const modalConfirmElement = document.querySelector("#modalConfirm");
const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;
const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");
let currentProductIdToDelete = null;

function renderProductList(filteredProducts = productList) {
    productsListElement.innerHTML = '';
    filteredProducts.forEach(product => {
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
}

function getCategoryName(categoryId) {
    const category = categoryList.find(c => c.id === categoryId);
    return category ? category.name : 'Chưa có danh mục';
}

addProductBtn.addEventListener("click", () => {
    window.location.href = "product-editor.html";
});

function editProduct(productId) {
    window.location.href = `product-editor.html?id=${productId}`;
}

function deleteProduct(productId) {
    currentProductIdToDelete = productId;

    confirmMessage.textContent = `Bạn có chắc chắn muốn xóa bài test này?`;

    modalConfirm.show();
}

confirmBtn.addEventListener("click", () => {
    if (currentProductIdToDelete !== null) {
        const index = productList.findIndex(p => p.id === currentProductIdToDelete);
        if (index !== -1) {
            productList.splice(index, 1);
            localStorage.setItem("products", JSON.stringify(productList));
            renderProductList();
        }

        modalConfirm.hide();
        currentProductIdToDelete = null;
    }
});

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

    renderProductList(sortedProducts);
});

searchProductInput.addEventListener("input", () => {
    const searchTerm = searchProductInput.value.toLowerCase();
    const filteredProducts = productList.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProductList(filteredProducts);
});

renderProductList(productList);
