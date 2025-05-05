document.addEventListener("DOMContentLoaded", function () {
    // --- Check Login ---
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (!userLoggedIn) {
        window.location.href = "login.html";
        return; // Stop execution if not logged in
    }

    // --- DOM Elements ---
    const quizTitleEl = document.getElementById('quizTitle');
    const totalTimeEl = document.getElementById('totalTime');
    const timeLeftEl = document.getElementById('timeLeft');
    const questionNavGridEl = document.getElementById('questionNavGrid');
    const questionCounterEl = document.getElementById('questionCounter');
    const questionTextEl = document.getElementById('questionText');
    const answersContainerEl = document.getElementById('answersContainer');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const finishButton = document.getElementById('finishButton');
    const logoutLink = document.getElementById("logoutLink");

    // --- State Variables ---
    let currentQuizData = null;
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Object to store answers: { questionId: [selectedAnswerValue1, ...], ... }
    let timerInterval = null;
    let timeRemaining = 0; // in seconds

    // --- Initialization ---
    function initializeQuiz() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get("id"));

        if (!productId) {
            alert("Không tìm thấy ID bài test!");
            window.location.href = "dashboard.html"; // Redirect back
            return;
        }

        const productList = JSON.parse(localStorage.getItem("products")) || [];
        currentQuizData = productList.find(p => p.id === productId);

        if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
            alert("Không tìm thấy dữ liệu bài test hoặc bài test không có câu hỏi!");
            window.location.href = "dashboard.html";
            return;
        }

        // Initialize userAnswers object
        currentQuizData.questions.forEach(q => {
            userAnswers[q.id] = []; // Start with empty array for each question's answers
        });

        // Setup UI
        quizTitleEl.textContent = currentQuizData.name;
        totalTimeEl.textContent = currentQuizData.time;
        timeRemaining = currentQuizData.time * 60; // Convert minutes to seconds

        renderNavigationSidebar();
        displayQuestion(currentQuestionIndex);
        startTimer();
        updateControlButtons();

         // Add logout listener
        if(logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Bạn có chắc chắn muốn đăng xuất và hủy bài test?")) {
                    stopTimer(); // Dừng timer trước khi logout
                    logout();
                }
            });
        }
    }

    // --- Display Logic ---
    function displayQuestion(index) {
        if (index < 0 || index >= currentQuizData.questions.length) return;

        currentQuestionIndex = index;
        const question = currentQuizData.questions[index];

        questionCounterEl.textContent = `Câu hỏi ${index + 1} trên ${currentQuizData.questions.length}`;
        questionTextEl.textContent = question.questionText;
        answersContainerEl.innerHTML = ''; // Clear previous answers

        question.answers.forEach((answer, ansIndex) => {
            const answerId = `q${question.id}-ans-${ansIndex}`; // Unique ID for label/input

            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-option';

            const input = document.createElement('input');
            input.type = 'checkbox'; // Using checkbox as per image
            input.id = answerId;
            input.name = `question_${question.id}`;
            input.value = answer.text; // Store answer text as value

            // Check if this answer was previously selected
            if (userAnswers[question.id] && userAnswers[question.id].includes(answer.text)) {
                input.checked = true;
            }

            input.addEventListener('change', () => saveAnswer()); // Save on change

            const label = document.createElement('label');
            label.htmlFor = answerId;
            label.textContent = answer.text;

            answerDiv.appendChild(input);
            answerDiv.appendChild(label);
            answersContainerEl.appendChild(answerDiv);
        });

        updateNavigationSidebar();
        updateControlButtons();
    }

    function renderNavigationSidebar() {
        questionNavGridEl.innerHTML = '';
        currentQuizData.questions.forEach((q, index) => {
            const btn = document.createElement('button');
            btn.textContent = index + 1;
            btn.className = 'nav-question-btn';
            btn.dataset.index = index; // Store index in data attribute
            btn.addEventListener('click', () => {
                 saveAnswer(); // Save current answer before jumping
                 displayQuestion(index);
            });
            questionNavGridEl.appendChild(btn);
        });
    }

    function updateNavigationSidebar() {
        const buttons = questionNavGridEl.querySelectorAll('.nav-question-btn');
        buttons.forEach((btn, index) => {
            btn.classList.remove('current');
            btn.classList.remove('answered'); // Reset answered state first

             const questionId = currentQuizData.questions[index].id;
             // Check if question has been answered (at least one selection)
             if (userAnswers[questionId] && userAnswers[questionId].length > 0) {
                 btn.classList.add('answered');
             }

            if (index === currentQuestionIndex) {
                btn.classList.add('current');
            }
        });
    }

    // --- Timer Logic ---
    function startTimer() {
        updateTimerDisplay(); // Initial display
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                handleTimeUp();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeLeftEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function handleTimeUp() {
        stopTimer();
        alert("Đã hết giờ làm bài!");
        finishQuiz(); // Automatically finish when time is up
    }

    // --- Answer Handling ---
    function saveAnswer() {
        const questionId = currentQuizData.questions[currentQuestionIndex].id;
        const selectedCheckboxes = answersContainerEl.querySelectorAll('input[type="checkbox"]:checked');
        const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value);
        userAnswers[questionId] = selectedValues;

         // Update sidebar immediately to show answered state
         updateNavigationSidebar();
    }

    // --- Control Logic ---
    function updateControlButtons() {
        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = currentQuestionIndex === currentQuizData.questions.length - 1;
    }

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            saveAnswer();
            displayQuestion(currentQuestionIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < currentQuizData.questions.length - 1) {
            saveAnswer();
            displayQuestion(currentQuestionIndex + 1);
        }
    });

    finishButton.addEventListener('click', () => {
         if (confirm("Bạn có chắc chắn muốn nộp bài?")) {
             finishQuiz();
         }
    });

    function finishQuiz() {
        stopTimer();
        saveAnswer(); // Save the answer of the very last question shown
        const score = calculateScore();

        // Store result (optional) - You might want to store more details
        const resultData = {
            productId: currentQuizData.id,
            productName: currentQuizData.name,
            score: score.correctCount,
            totalQuestions: score.totalQuestions,
            percentage: score.percentage,
            userAnswers: userAnswers, // Include user answers for review
            timestamp: new Date().toISOString()
        };
        // Save result to localStorage or send to server
        localStorage.setItem("lastQuizResult", JSON.stringify(resultData));

        // Redirect to a results page (create result.html)
        window.location.href = `result.html`;
    }

    function calculateScore() {
        let correctCount = 0;
        const totalQuestions = currentQuizData.questions.length;

        currentQuizData.questions.forEach(question => {
            const questionId = question.id;
            const correctAnswers = question.answers
                                     .filter(ans => ans.isCorrect)
                                     .map(ans => ans.text); // Get text of correct answers
            const userSelected = userAnswers[questionId] || [];

            // For checkbox (multiple correct answers possible):
            // Score is correct if the user selected ALL correct answers AND NO incorrect answers.
            let isQuestionCorrect = correctAnswers.length === userSelected.length && // Same number of answers selected as correct ones
                                     correctAnswers.every(correctAns => userSelected.includes(correctAns)); // All correct answers are included in user selection

            if (isQuestionCorrect) {
                correctCount++;
            }
        });

        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        return {
            correctCount,
            totalQuestions,
            percentage
        };
    }

     // --- Logout Function ---
     function logout() {
        localStorage.removeItem("userLoggedIn");
        window.location.href = "login.html";
    }

    // --- Start the Quiz ---
    initializeQuiz();
});