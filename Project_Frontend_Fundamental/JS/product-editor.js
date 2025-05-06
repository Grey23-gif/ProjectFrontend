document.addEventListener("DOMContentLoaded", function () {
    let productList = JSON.parse(localStorage.getItem("products")) || [];
let categoryList = JSON.parse(localStorage.getItem("categories")) || [];
let questionList = [];

const saveProductBtn = document.querySelector("#saveBtn");
const nameProduct = document.querySelector("#nameProduct");
const categoryProduct = document.querySelector("#categoriesList");
const timeProduct = document.querySelector("#timeProduct");
const addQuestionBtn = document.querySelector("#addQuestion");
const tableQuestion = document.querySelector("#questionList");
const attemptsProduct = document.querySelector("#attemptsProduct");

const modalElement = document.querySelector("#modalQuestion");
const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
const modalConfirmElement = document.querySelector("#modalConfirmQuestion");
const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;
const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");

let currentAction = null;
let currentEditingQuestionId = null;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id") ? parseInt(urlParams.get("id")) : null;
const product = productId ? productList.find(p => p.id === productId) : null;

function populateCategoriesList() {
    categoryProduct.innerHTML = '<option value="">Chọn danh mục</option>';
    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = `${category.emoji} ${category.name}`;
        categoryProduct.appendChild(option);
    });
}

function initializeForm() {
    populateCategoriesList();
    if (product) {
        nameProduct.value = product.name;
        categoryProduct.value = product.categoryId;
        timeProduct.value = product.time;
        questionList = product.questions ? [...product.questions] : [];
    } else {
        questionList = [];
    }
    renderQuestionList();
}

saveProductBtn.addEventListener("click", () => {
    clearErrors();
    // Kiểm tra hợp lệ dữ liệu đầu vào
    if (!validateInput(nameProduct, "Vui lòng nhập tên bài test") ||
        !validateInput(categoryProduct, "Vui lòng chọn danh mục") ||
        !validateInput(timeProduct, "Vui lòng nhập thời gian làm bài") ||
        !validateNumberInput(timeProduct, "Vui lòng nhập lại thời gian làm bài") ||
        !validateInput(attemptsProduct, "Vui lòng nhập số lần làm bài") ||
        !validateNumberInput(attemptsProduct, "Vui lòng nhập lại số lần làm bài")) {
        return;
    }

    if (questionList.length === 0) {
        showError(addQuestionBtn, "Bài test phải có ít nhất 1 câu hỏi!");
        return;
    }

    const time = parseInt(timeProduct.value);
    const attempts = parseInt(attemptsProduct.value); // Số lần làm bài
    const selectedCategory = categoryList.find(c => c.id === parseInt(categoryProduct.value));
    const categoryText = selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : "";

    // Nếu đang sửa sản phẩm
    if (product) {
        const index = productList.findIndex(p => p.id === product.id);
        if (index !== -1) {
            productList[index] = {
                ...productList[index],
                name: nameProduct.value.trim(),
                categoryId: parseInt(categoryProduct.value),
                categoryText: categoryText,
                time,
                attempts, // Lưu số lần làm bài
                questions: [...questionList]
            };
        }
    } else {
        // Thêm mới sản phẩm
        const newProduct = {
            id: productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1,
            name: nameProduct.value.trim(),
            categoryId: parseInt(categoryProduct.value),
            categoryText: categoryText,
            time,
            attempts, // Lưu số lần làm bài
            questions: [...questionList]
        };
        productList.push(newProduct);
    }

    // Lưu vào localStorage
    localStorage.setItem("products", JSON.stringify(productList));
    window.location.href = "product-manager.html";
});


addQuestionBtn.addEventListener("click", () => {
    clearErrors();
    currentAction = "add";
    currentEditingQuestionId = null;
    document.querySelector("#question").value = "";
    resetAnswers();

    const answersContainer = document.querySelector("#answersContainer");
    for (let i = 0; i < 4; i++) {
        const answerRow = createAnswerRow("", false);
        answersContainer.appendChild(answerRow);
    }
    if (modal) modal.show();
});

document.querySelector("#addAnswer")?.addEventListener("click", () => {
    const answersContainer = document.querySelector("#answersContainer");
    const answerRow = createAnswerRow("", false);
    answersContainer.appendChild(answerRow);
});

saveQuestionBtn.addEventListener("click", () => {
    const questionInput = document.querySelector("#question");
    const answersContainer = document.querySelector("#answersContainer");
    const answerInputs = answersContainer.querySelectorAll("input[type='text']");
    const checkboxes = answersContainer.querySelectorAll(".form-check-input");

    clearErrors();

    let isValid = true;
    if (!validateInput(questionInput, "Vui lòng nhập câu hỏi")) {
        isValid = false;
    }
    answerInputs.forEach(input => {
        if (!validateInput(input, "Vui lòng nhập câu trả lời")) {
            isValid = false;
        }
    });

    if (answerInputs.length < 2) {
        showError(document.querySelector("#addAnswer"), "Phải có ít nhất 2 câu trả lời.");
        isValid = false;
    }
    const atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    if (!atLeastOneChecked) {
        showError(saveQuestionBtn, "Phải có ít nhất một câu trả lời đúng.");
        isValid = false;
    }

    if (!isValid) return;

    const answers = Array.from(answerInputs).map((input, index) => ({
        text: input.value.trim(),
        isCorrect: checkboxes[index].checked
    }));

    if (currentAction === "add") {
        const newQuestion = {
            id: questionList.length > 0 ? Math.max(...questionList.map(q => q.id)) + 1 : 1,
            questionText: questionInput.value.trim(),
            answers
        };
        questionList.push(newQuestion);
    } else if (currentAction === "edit" && currentEditingQuestionId !== null) {
        const questionIndex = questionList.findIndex(q => q.id === currentEditingQuestionId);
        if (questionIndex !== -1) {
            questionList[questionIndex].questionText = questionInput.value.trim();
            questionList[questionIndex].answers = answers;
        }
    }

    renderQuestionList();
    if (modal) modal.hide();
});

confirmBtn.addEventListener("click", () => {
    if (currentAction === "delete" && currentEditingQuestionId !== null) {
        const index = questionList.findIndex(q => q.id === currentEditingQuestionId);
        if (index !== -1) {
            questionList.splice(index, 1);
            renderQuestionList();
        }
        if (modalConfirm) modalConfirm.hide();
    }
});

function renderQuestionList() {
    if (!tableQuestion) return;
    tableQuestion.innerHTML = "";
    questionList.forEach((question, index) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${question.questionText}</td>
            <td>
                <button class="edit btn btn-primary btn-sm" data-id="${question.id}">Sửa</button>
                <button class="delete btn btn-danger btn-sm" data-id="${question.id}" data-text="${question.questionText}">Xóa</button>
            </td>
        `;
        tableQuestion.appendChild(newRow);
    });
}

tableQuestion?.addEventListener('click', (event) => {
    const target = event.target;
    const questionId = parseInt(target.getAttribute('data-id'));

    if (target.classList.contains('edit')) {
        const question = questionList.find(q => q.id === questionId);
        if (question) {
            clearErrors();
            currentAction = "edit";
            currentEditingQuestionId = question.id;
            document.querySelector("#question").value = question.questionText;
            resetAnswers();
            populateAnswers(question.answers);
            if (modal) modal.show();
        }
    } else if (target.classList.contains('delete')) {
        const questionText = target.getAttribute('data-text');
        if (questionId) {
            currentAction = "delete";
            currentEditingQuestionId = questionId;
            confirmMessage.textContent = `Bạn có chắc chắn muốn xóa câu hỏi "${questionText}" không?`;
            if (modalConfirm) modalConfirm.show();
        }
    }
});

function createAnswerRow(text = "", correct = false) {
    const row = document.createElement("div");
    row.className = "input-group mb-2 answer-row";
    row.innerHTML = `
        <div class="input-group-text">
            <input type="checkbox" class="form-check-input mt-0" ${correct ? "checked" : ""}>
        </div>
        <input type="text" class="form-control" placeholder="Nhập câu trả lời" value="${text}">
        <button type="button" class="btn btn-danger delete-answer"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector(".delete-answer").addEventListener("click", (e) => {
        e.stopPropagation();
        row.remove();
    });
    return row;
}

function resetAnswers() {
    const container = document.querySelector("#answersContainer");
    if (container) container.innerHTML = "";
}

function populateAnswers(answers) {
    const answersContainer = document.querySelector("#answersContainer");
    if (!answersContainer) return;
    resetAnswers();
    answers.forEach(answer => {
        const answerRow = createAnswerRow(answer.text, answer.isCorrect);
        answersContainer.appendChild(answerRow);
    });
}

function validateInput(input, message) {
    if (!input) return false;
    clearErrorForInput(input);
    if (!input.value.trim()) {
        showError(input, message);
        return false;
    }
    return true;
}

function validateNumberInput(input, message) {
    if (!input) return false;
    clearErrorForInput(input);
    const value = parseInt(input.value);
    if (isNaN(value) || value <= 0) {
        showError(input, message);
        return false;
    }
    return true;
}

function showError(element, message) {
    element.classList.add("input-error");

    const error = document.createElement("div");
    error.className = "error-message w-100 mt-2";
    error.textContent = message;

    const existingError = element.parentNode.querySelector(".error-message");
    if (existingError) {
        existingError.remove();
    }

    element.parentNode.appendChild(error);

    element.classList.add("is-invalid");
}

function clearErrorForInput(input) {
    if (!input) return;
    const parent = input.closest('.input-group') || input.parentNode;
    const error = parent.parentNode.querySelector(".error-message");
    if (error) {
        error.remove();
    }
    input.classList.remove("is-invalid");
}

function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(errorMessage => errorMessage.remove());

    const invalidFields = document.querySelectorAll(".is-invalid");
    invalidFields.forEach(field => {
        field.classList.remove("is-invalid");
    });
}


initializeForm();
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