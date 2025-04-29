// Hàm làm sạch đầu vào để ngăn XSS
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Hàm phân tích JSON an toàn
function safeParseJSON(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error(`Lỗi khi phân tích ${key} từ localStorage:`, e);
        return [];
    }
}

// Khởi tạo danh sách từ localStorage
const questionList = safeParseJSON("questions");
const productList = safeParseJSON("products");
const categoryList = safeParseJSON("categories");

// Lấy các phần tử DOM
const addQuestionBtn = document.querySelector("#addQuestion");
const saveProductBtn = document.querySelector("#saveBtn");
const saveQuestionBtn = document.querySelector("#saveQuestionBtn");
const nameProduct = document.querySelector("#nameProduct");
const categoryProduct = document.querySelector("#categoriesList");
const timeProduct = document.querySelector("#timeProduct");
const tableQuestion = document.querySelector("#questionsList");
const addAnswerBtn = document.querySelector("#addAnswer");
const modalElement = document.querySelector("#modalQuestion");
const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
const modalConfirmElement = document.querySelector("#modalConfirmQuestion");
const modalConfirm = modalConfirmElement ? new bootstrap.Modal(modalConfirmElement) : null;
const confirmMessage = document.querySelector(".confirm-message");
const confirmBtn = document.querySelector("#confirmBtn");
const logoutLink = document.querySelector("#logoutLink");

let currentAction = "";
let currentEditingQuestionId = null;

// Hiển thị danh mục trong dropdown
function populateCategoryDropdown() {
    if (!categoryProduct) return;
    categoryProduct.innerHTML = '<option value="">Chọn danh mục</option>';
    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = `${category.emoji} ${category.name}`;
        categoryProduct.appendChild(option);
    });
}

// Kiểm tra đầu vào
function validateInput(input, message) {
    input.classList.remove("input-error");
    const existingError = input.parentNode.querySelector(".error-message");
    if (existingError) existingError.remove();

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

// Kiểm tra danh sách câu trả lời
function validateAnswers() {
    const answerInputs = document.querySelectorAll("#answersContainer .form-control");
    const checkboxes = document.querySelectorAll("#answersContainer .form-check-input");
    let hasCorrectAnswer = false;
    let hasValidAnswers = true;

    answerInputs.forEach((input, index) => {
        if (!input.value.trim()) {
            hasValidAnswers = false;
            input.classList.add("input-error");
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Vui lòng nhập câu trả lời";
            input.parentNode.appendChild(error);
        } else {
            input.classList.remove("input-error");
            input.parentNode.querySelector(".error-message")?.remove();
        }
        if (checkboxes[index].checked) {
            hasCorrectAnswer = true;
        }
    });

    if (!hasValidAnswers) {
        alert("Vui lòng nhập tất cả câu trả lời.");
        return false;
    }
    if (!hasCorrectAnswer) {
        alert("Vui lòng chọn ít nhất một câu trả lời đúng.");
        return false;
    }
    return true;
}

// Tạo hàng câu trả lời
function createAnswerRow(text = "", correct = false) {
    const row = document.createElement("div");
    row.className = "input-group mb-2";
    row.innerHTML = `
        <div class="input-group-text">
            <input type="checkbox" class="form-check-input mt-0" ${correct ? "checked" : ""}>
        </div>
        <input type="text" class="form-control" placeholder="Nhập câu trả lời" value="${sanitizeInput(text)}">
        <button class="btn btn-danger delete-answer"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector(".delete-answer").addEventListener("click", () => {
        const answersContainer = document.querySelector("#answersContainer");
        if (answersContainer.children.length > 1) {
            row.remove();
        } else {
            alert("Câu hỏi phải có ít nhất một câu trả lời.");
        }
    });
    return row;
}

// Điền danh sách câu trả lời vào modal
function populateAnswers(answers) {
    const answersContainer = document.querySelector("#answersContainer");
    answersContainer.innerHTML = "";
    answers.forEach(answer => {
        answersContainer.appendChild(createAnswerRow(answer.text, answer.correct));
    });
    if (answers.length === 0) {
        answersContainer.appendChild(createAnswerRow());
    }
}

// Lấy danh sách câu trả lời từ modal
function getAnswers() {
    const answerInputs = document.querySelectorAll("#answersContainer .input-group");
    const answers = [];
    answerInputs.forEach(inputGroup => {
        const answerText = inputGroup.querySelector("input[type='text']").value.trim();
        const isCorrect = inputGroup.querySelector("input[type='checkbox']").checked;
        if (answerText) {
            answers.push({ text: sanitizeInput(answerText), correct: isCorrect });
        }
    });
    return answers;
}

// Thêm hàng câu hỏi vào bảng
function addQuestionRow(question) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${question.id}</td>
        <td>${sanitizeInput(question.question)}</td>
        <td>
            <button class="edit btn btn-primary btn-sm">Sửa</button>
            <button class="delete btn btn-danger btn-sm">Xóa</button>
        </td>
    `;
    tableQuestion.appendChild(newRow);

    newRow.querySelector(".edit").addEventListener("click", () => {
        currentAction = "edit";
        currentEditingQuestionId = question.id;
        document.querySelector("#question").value = question.question;
        populateAnswers(question.answers);
        modal?.show();
    });

    newRow.querySelector(".delete").addEventListener("click", () => {
        currentAction = "delete";
        confirmMessage.textContent = `Bạn có chắc chắn muốn xóa câu hỏi "${sanitizeInput(question.question)}" không?`;
        modalConfirm?.show();
        confirmBtn.onclick = () => {
            const index = questionList.findIndex(q => q.id === question.id);
            if (index !== -1) {
                questionList.splice(index, 1);
                localStorage.setItem("questions", JSON.stringify(questionList));
                renderQuestionList();
            }
            modalConfirm?.hide();
        };
    });
}

// Hiển thị danh sách câu hỏi
function renderQuestionList() {
    tableQuestion.innerHTML = "";
    questionList.forEach(addQuestionRow);
}

// Sự kiện nút "Thêm câu hỏi"
if (addQuestionBtn) {
    addQuestionBtn.addEventListener("click", () => {
        currentAction = "add";
        currentEditingQuestionId = null;
        document.querySelector("#question").value = "";
        populateAnswers([]);
        modal?.show();
    });
}

// Sự kiện nút "Thêm câu trả lời"
if (addAnswerBtn) {
    addAnswerBtn.addEventListener("click", () => {
        const answersContainer = document.querySelector("#answersContainer");
        answersContainer.appendChild(createAnswerRow());
    });
}

// Sự kiện nút "Lưu câu hỏi"
if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
        const questionInput = document.querySelector("#question");
        if (!validateInput(questionInput, "Vui lòng nhập câu hỏi") || !validateAnswers()) {
            return;
        }
        const answers = getAnswers();
        if (currentAction === "add") {
            const newQuestion = {
                id: questionList.length > 0 ? Math.max(...questionList.map(q => q.id)) + 1 : 1,
                question: sanitizeInput(questionInput.value),
                answers
            };
            questionList.push(newQuestion);
        } else if (currentAction === "edit") {
            const question = questionList.find(q => q.id === currentEditingQuestionId);
            if (question) {
                question.question = sanitizeInput(questionInput.value);
                question.answers = answers;
            }
        }
        localStorage.setItem("questions", JSON.stringify(questionList));
        renderQuestionList();
        modal?.hide();
    });
}

// Sự kiện nút "Lưu bài test"
if (saveProductBtn) {
    saveProductBtn.addEventListener("click", () => {
        if (
            !validateInput(nameProduct, "Vui lòng nhập tên bài test") ||
            !validateInput(categoryProduct, "Vui lòng chọn danh mục") ||
            !validateInput(timeProduct, "Vui lòng nhập thời gian làm bài")
        ) {
            return;
        }
        const time = parseInt(timeProduct.value);
        if (isNaN(time) || time <= 0) {
            alert("Vui lòng nhập thời gian hợp lệ (số phút lớn hơn 0).");
            return;
        }
        if (questionList.length === 0) {
            alert("Vui lòng thêm ít nhất một câu hỏi.");
            return;
        }
        const newProduct = {
            id: productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1,
            name: sanitizeInput(nameProduct.value),
            categoryId: parseInt(categoryProduct.value),
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
        alert("Bài test đã được lưu thành công!");
    });
}

// Sự kiện nút "Đăng xuất"
if (logoutLink) {
    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("userSession"); // Giả sử có khóa này
        window.location.href = "login.html";
    });
}

// Khởi chạy
populateCategoryDropdown();
renderQuestionList();

// Gán sự kiện xóa cho các câu trả lời tĩnh
document.querySelectorAll("#answersContainer .delete-answer").forEach(button => {
    button.addEventListener("click", () => {
        const answersContainer = document.querySelector("#answersContainer");
        if (answersContainer.children.length > 1) {
            button.closest(".input-group").remove();
        } else {
            alert("Câu hỏi phải có ít nhất một câu trả lời.");
        }
    });
});