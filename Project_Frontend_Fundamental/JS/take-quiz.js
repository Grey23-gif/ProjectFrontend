document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử DOM
    const quizTitle = document.getElementById("quizTitle");
    const questionCounter = document.getElementById("questionCounter");
    const questionText = document.getElementById("questionText");
    const answersContainer = document.getElementById("answersContainer");
    const questionNavGrid = document.getElementById("questionNavGrid");
    const timeLeft = document.getElementById("timeLeft");
    const totalTime = document.getElementById("totalTime");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const finishButton = document.getElementById("finishButton");
    const logoutLink = document.getElementById("logoutLink");
    const modalNotification = document.getElementById("modalNotification");
    const modalNotificationScore = document.getElementById("modalNotificationScore");
    const notificationMessage = document.querySelector(".notification-message");
    const notificationScoreMessage = document.querySelector(".notificationScore-message");
    const confirmBtn = document.getElementById("confirmBtn");
    const retryButton = document.getElementById("retryButton");
    const homeButton = document.getElementById("homeButton");

    let currentQuestionIndex = 0;
    let quizData = null;
    let userAnswers = [];
    let timerInterval = null;

    // Lấy ID bài test từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get("id"), 10);

    // Kiểm tra đăng nhập
    const userLoggedIn = JSON.parse(localStorage.getItem("userLoggedIn"));
    if (!userLoggedIn) {
        showError("Vui lòng đăng nhập để làm bài test!");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000); // chờ 2 giây
        return;
    }

    // Lấy dữ liệu bài test từ localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];
    quizData = products.find((product) => product.id === quizId);

    // Kiểm tra dữ liệu bài test
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        showError("Không tìm thấy bài test hoặc bài test không có câu hỏi!");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000); // chờ 2 giây
        return;
    }

    // Kiểm tra số lần làm bài
    const userAttemptsKey = `attempts_${quizId}_${userLoggedIn.email}`;
    let userAttempts = parseInt(localStorage.getItem(userAttemptsKey)) || 0;
    const maxAttempts = quizData.attempts;
    if (userAttempts >= maxAttempts) {
        showError(`Bạn đã hết số lần làm bài test này (${maxAttempts} lần)!`);
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000); // chờ 2 giây
        return;
    }

    // Hàm hiển thị lỗi
    function showError(message) {
        if (modalNotification && notificationMessage) {
            notificationMessage.textContent = message;
            const modal = new bootstrap.Modal(modalNotification);
            modal.show();
        } else {
            alert(message);
        }
    }

    // Khởi tạo giao diện bài test
    function initializeQuiz() {
        if (quizTitle) quizTitle.textContent = quizData.name;
        if (totalTime) totalTime.textContent = quizData.time;
        userAnswers = Array(quizData.questions.length).fill(null);

        renderQuestion();
        renderNavigation();
        startTimer((quizData.time) * 60);
    }

    // Hiển thị câu hỏi hiện tại
    function renderQuestion() {
        const question = quizData.questions[currentQuestionIndex];
        if (
            !question ||
            !question.questionText ||
            !question.answers ||
            question.answers.length < 2
        ) {
            showError("Câu hỏi không hợp lệ!");
            finishQuiz();
            return;
        }

        if (questionCounter)
            questionCounter.textContent = `Câu hỏi: ${currentQuestionIndex + 1
                } trên ${quizData.questions.length}`;
        if (questionText) questionText.textContent = question.questionText;

        if (answersContainer) {
            answersContainer.innerHTML = "";
            question.answers.forEach((answer, index) => {
                const answerOption = document.createElement("div");
                answerOption.className = "answer-option";
                answerOption.innerHTML = `
                    <input type="radio" id="answer_${index}" name="answer" value="${answer.text}">
                    <label for="answer_${index}">${answer.text}</label>
                `;
                answersContainer.appendChild(answerOption);

                if (userAnswers[currentQuestionIndex] === answer.text) {
                    answerOption.querySelector("input").checked = true;
                }
            });
        }

        updateNavigationButtons();
        updateNavigationGrid();
    }

    // Cập nhật trạng thái nút điều hướng
    function updateNavigationButtons() {
        if (prevButton) prevButton.disabled = currentQuestionIndex === 0;
        if (nextButton)
            nextButton.disabled =
                currentQuestionIndex === quizData.questions.length - 1;
    }

    // Cập nhật lưới điều hướng
    function updateNavigationGrid() {
        if (questionNavGrid) {
            const navButtons = questionNavGrid.querySelectorAll(".nav-question-btn");
            navButtons.forEach((btn, index) => {
                btn.classList.toggle("answered", userAnswers[index] !== null);
                btn.classList.toggle("active", index === currentQuestionIndex);
            });
        }
    }

    // Lưu câu trả lời của người dùng
    function saveUserAnswer() {
        if (answersContainer) {
            const selectedAnswer = answersContainer.querySelector("input:checked");
            userAnswers[currentQuestionIndex] = selectedAnswer
                ? selectedAnswer.value
                : null;
        }
    }

    // Hiển thị điều hướng nhanh
    function renderNavigation() {
        if (questionNavGrid) {
            questionNavGrid.innerHTML = "";
            quizData.questions.forEach((_, index) => {
                const navButton = document.createElement("button");
                navButton.className = "nav-question-btn";
                navButton.textContent = index + 1;
                navButton.addEventListener("click", () => {
                    saveUserAnswer();
                    currentQuestionIndex = index;
                    renderQuestion();
                });
                questionNavGrid.appendChild(navButton);
            });
        }
    }

    // Bắt đầu đếm ngược thời gian
    function startTimer(duration) {
        let remainingTime = duration;

        timerInterval = setInterval(() => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            if (timeLeft)
                timeLeft.textContent = `${minutes}:${seconds < 10 ? "0" : ""
                    }${seconds}`;

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                finishQuiz();
            }

            remainingTime--;
        }, 1000);
    }

    // Hiển thị modal xác nhận nộp bài
    function showConfirmModal() {
        if (modalNotification && notificationMessage) {
            notificationMessage.textContent = "Bạn có chắc chắn muốn hoàn thành bài test?";
            const modal = new bootstrap.Modal(modalNotification);
            modal.show();

            // Đảm bảo modal căn giữa khi hiển thị
            modalNotification.addEventListener('shown.bs.modal', function () {
                const dialog = modalNotification.querySelector('.modal-dialog');
                if (dialog) {
                    dialog.style.position = 'relative';
                    dialog.style.top = '50%';
                    dialog.style.transform = 'translateY(-50%)';
                    dialog.style.margin = 'auto';
                }
            }, { once: true });
        }
    }

    // Hiển thị modal kết quả
    function showResultModal(score, totalQuestions, remainingAttempts) {
        if (modalNotificationScore && notificationScoreMessage) {
            notificationScoreMessage.innerHTML = `
                <h2>Hoàn thành</h2>
                <div class="notificationScore-content">   
                    <h4>Chúc mừng!</h4>
                    <p>Bạn đã hoàn thành bài test</p><hr>
                    <p>Điểm của bạn: <strong>${((score / totalQuestions) * 100).toFixed(0)}%</strong></p>
                </div>
                <div class="notificationScore-details">
                    <div class="notificationScore-header">
                        <h4>Kết quả của bạn</h4>
                    </div>
                    <div>
                        <p>Tổng số câu hỏi: ${totalQuestions}</p>
                        <p>Câu trả lời đúng: ${score}</p>
                        <p>Câu trả lời sai: ${totalQuestions - score}</p>
                        <p>Số lần làm bài còn lại: ${remainingAttempts}</p>
                    </div>
                </div>
            `;
            const modal = new bootstrap.Modal(modalNotificationScore);
            modal.show();

            // Đảm bảo modal căn giữa khi hiển thị
            modalNotificationScore.addEventListener('shown.bs.modal', function () {
                const dialog = modalNotificationScore.querySelector('.modal-dialog');
                if (dialog) {
                    dialog.style.position = 'relative';
                    dialog.style.top = '50%';
                    dialog.style.transform = 'translateY(-50%)';
                    dialog.style.margin = 'auto';
                }
            }, { once: true });
        }
    }

    // Kết thúc bài test
    function finishQuiz() {
        saveUserAnswer();
        clearInterval(timerInterval);

        let score = 0;
        quizData.questions.forEach((question, index) => {
            const correctAnswers = question.answers
                .filter((answer) => answer.isCorrect)
                .map((answer) => answer.text);
            const userAnswer = userAnswers[index];
            if (correctAnswers.includes(userAnswer)) {
                score++;
            }
        });

        // Cập nhật số lần làm bài
        userAttempts++;
        localStorage.setItem(userAttemptsKey, userAttempts);

        // Cập nhật số lượt chơi của bài test
        const productIndex = products.findIndex((p) => p.id === quizId);
        if (productIndex !== -1) {
            products[productIndex].plays =
                (products[productIndex].plays || 0) + 1;
            localStorage.setItem("products", JSON.stringify(products));
        }

        // Hiển thị kết quả trong modal
        showResultModal(
            score,
            quizData.questions.length,
            maxAttempts - userAttempts
        );
    }

    // Xử lý sự kiện nút điều hướng
    if (prevButton) {
        prevButton.addEventListener("click", () => {
            saveUserAnswer();
            currentQuestionIndex--;
            renderQuestion();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            saveUserAnswer();
            currentQuestionIndex++;
            renderQuestion();
        });
    }

    if (finishButton) {
        finishButton.addEventListener("click", () => {
            showConfirmModal();
        });
    }

    // Xử lý xác nhận nộp bài
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            const modal = bootstrap.Modal.getInstance(modalNotification);
            if (modal) modal.hide();
            finishQuiz();
        });
    }

    // Xử lý nút "Làm lại"
    if (retryButton) {
        retryButton.addEventListener("click", () => {
            userAttempts++;
            const modal = bootstrap.Modal.getInstance(modalNotificationScore);
            if (modal) modal.hide();
            window.location.reload();
        });
    }

    // Xử lý nút "Trang chủ"
    if (homeButton) {
        homeButton.addEventListener("click", () => {
            const modal = bootstrap.Modal.getInstance(modalNotificationScore);
            if (modal) modal.hide();
            window.location.href = "dashboard.html";
        });
    }

    // Xử lý đăng xuất
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("userLoggedIn");
            clearInterval(timerInterval);
            window.location.href = "login.html";
        });
    }

    // Khởi chạy bài test
    initializeQuiz();
});