const questionList = JSON.parse(localStorage.getItem("questions")) || [];
const productList = JSON.parse(localStorage.getItem("products")) || [];
const categoryList = JSON.parse(localStorage.getItem("categories")) || [];

const saveQuestionBtn = document.querySelector("#saveQuestionBtn");
const saveProductBtn = document.querySelector("#saveBtn");
const nameProduct = document.querySelector("#nameProduct");
const categoryProduct = document.querySelector("#categoriesList");
const timeProduct = document.querySelector("#timeProduct");
const addQuestionBtn = document.querySelector("#addQuestion");
const tableQuestion = document.querySelector("#questionList");

const modalElement = document.querySelector("#modalQuestion");
const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
const modalConfirmElement = document.querySelector("#modalConfirmQuestion");
const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;
const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");

let currentAction = null;
let currentEditingQuestionId = null;

// Hàm hiển thị danh mục
function populateCategoriesList() {
    categoryProduct.innerHTML = '<option value="">Chọn danh mục</option>';
    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = `${category.emoji} ${category.name}`;
        categoryProduct.appendChild(option);
    });
}

// Lưu bài test
saveProductBtn.addEventListener("click", () => {
    if (!validateInput(nameProduct, "Vui lòng nhập tên bài test") ||
        !validateInput(categoryProduct, "Vui lòng chọn danh mục") ||
        !validateInput(timeProduct, "Vui lòng nhập thời gian làm bài")) {
        return;
    }
    if (!validateNumberInput(timeProduct, "Vui lòng nhập lại thời gian làm bài")) {
        return;
    }
    if (questionList.length === 0) {
        alert("Bài test phải có ít nhất 1 câu hỏi!");
        return;
    }

    const time = parseInt(timeProduct.value);
    const selectedCategory = categoryList.find(c => c.id === parseInt(categoryProduct.value));
    const newProduct = {
        id: productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1,
        name: nameProduct.value,
        categoryId: parseInt(categoryProduct.value),
        categoryText: selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : "",
        time,
        questions: [...questionList]
    };

    productList.push(newProduct);
    localStorage.setItem("products", JSON.stringify(productList));
    questionList.length = 0;
    localStorage.setItem("questions", JSON.stringify(questionList));

    nameProduct.value = "";
    categoryProduct.value = "";
    timeProduct.value = "";
    renderQuestionList();
});

// Thêm câu hỏi
addQuestionBtn.addEventListener("click", () => {
    clearErrors();
    currentAction = "add";
    currentEditingQuestionId = null;
    resetAnswers();

    const answersContainer = document.querySelector("#answersContainer");
    for (let i = 0; i < 4; i++) {
        const answerRow = createAnswerRow("", false);
        answersContainer.appendChild(answerRow);
    }
    modal.show();
});

// Thêm câu trả lời
document.querySelector("#addAnswer").addEventListener("click", () => {
    const answersContainer = document.querySelector("#answersContainer");
    const answerRow = createAnswerRow("", false);
    answersContainer.appendChild(answerRow);
});

// Lưu câu hỏi
saveQuestionBtn.addEventListener("click", () => {
    const questionInput = document.querySelector("#question");
    const answerInputs = document
        .querySelector("#answersContainer")
        .querySelectorAll("input[type='text']");
    const checkboxes = document.querySelectorAll(".form-check-input");

    clearErrors();

    if (!validateInput(questionInput, "Vui lòng nhập câu hỏi")) {
        return;
    }
    for (let input of answerInputs) {
        if (!validateInput(input, "Vui lòng nhập câu trả lời")) {
            return;
        }
    }
    if (answerInputs.length < 2) {
        showError(saveQuestionBtn, "Phải có ít nhất 2 câu trả lời.");
        return;
    }
    const atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    if (!atLeastOneChecked) {
        showError(saveQuestionBtn, "Phải có ít nhất một câu trả lời đúng.");
        return;
    }

    const answers = Array.from(answerInputs).map((input, index) => ({
        text: input.value,
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

    localStorage.setItem("questions", JSON.stringify(questionList));
    renderQuestionList();
    modal.hide();
});

// Hiển thị danh sách câu hỏi
function renderQuestionList() {
    tableQuestion.innerHTML = "";
    questionList.forEach(question => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${question.id}</td>
            <td>${question.questionText}</td>
            <td>
                <button class="edit btn btn-primary btn-sm">Sửa</button>
                <button class="delete btn btn-danger btn-sm">Xóa</button>
            </td>
        `;
        tableQuestion.appendChild(newRow);

        newRow.querySelector(".edit").addEventListener("click", () => {
            clearErrors();
            currentAction = "edit";
            currentEditingQuestionId = question.id;
            document.querySelector("#question").value = question.questionText;
            resetAnswers();
            populateAnswers(question.answers);
            modal.show();
        });

        newRow.querySelector(".delete").addEventListener("click", () => {
            currentAction = "delete";
            currentEditingQuestionId = question.id;
            confirmMessage.textContent = `Bạn có chắc chắn muốn xóa câu hỏi "${question.questionText}" không?`;
            modalConfirm.show();
        });
    });
}

// Xác nhận xóa câu hỏi
confirmBtn.addEventListener("click", () => {
    if (currentAction === "delete" && currentEditingQuestionId !== null) {
        const index = questionList.findIndex(q => q.id === currentEditingQuestionId);
        if (index !== -1) {
            questionList.splice(index, 1);
            localStorage.setItem("questions", JSON.stringify(questionList));
            renderQuestionList();
        }
        modalConfirm.hide();
    }
});

// Tạo dòng trả lời
function createAnswerRow(text = "", correct = false) {
    const row = document.createElement("div");
    row.className = "input-group mb-2";
    row.innerHTML = `
        <div class="input-group-text">
            <input type="checkbox" class="form-check-input mt-0" ${correct ? "checked" : ""}>
        </div>
        <input type="text" class="form-control" placeholder="Nhập câu trả lời" value="${text}">
        <button type="button" class="btn btn-danger delete-answer"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector(".delete-answer").addEventListener("click", () => row.remove());
    return row;
}

function resetAnswers() {
    document.querySelector("#answersContainer").innerHTML = "";
}

function populateAnswers(answers) {
    const answersContainer = document.querySelector("#answersContainer");
    answers.forEach(answer => {
        const answerRow = createAnswerRow(answer.text, answer.isCorrect);
        answersContainer.appendChild(answerRow);
    });
}

// Validate
function validateInput(input, message) {
    input.classList.remove("input-error");
    input.parentNode.querySelector(".error-message")?.remove();
    if (!input.value.trim()) {
        showError(input, message);
        return false;
    }
    return true;
}

function validateNumberInput(input, message) {
    const value = parseInt(input.value);
    if (isNaN(value) || value <= 0) {
        showError(input, message);
        return false;
    }
    return true;
}

function showError(input, message) {
    input.classList.add("input-error");
    const error = document.createElement("div");
    error.className = "error-message w-100 mt-2";
    error.textContent = message;
    input.parentNode.appendChild(error);
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
}

// Nếu chỉnh sửa bài test
const productId = new URLSearchParams(window.location.search).get('id');
const product = productList.find(p => p.id === parseInt(productId));

if (product) {
    nameProduct.value = product.name;
    categoryProduct.value = product.categoryId;
    timeProduct.value = product.time;

    questionList.length = 0;
    product.questions.forEach(q => questionList.push(q));
    renderQuestionList();
}

// Load danh mục ban đầu
populateCategoriesList();
