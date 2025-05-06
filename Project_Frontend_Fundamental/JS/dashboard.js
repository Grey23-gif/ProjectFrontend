document.addEventListener("DOMContentLoaded", function () {
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (!userLoggedIn) {
        window.location.href = "login.html";
    }

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            logout();
        });
    }

    function logout() {
        localStorage.removeItem("userLoggedIn");
        window.location.href = "login.html";
    }

    const quizzShowTbody = document.getElementById('quizzShow');
    const searchInput = document.getElementById('searchTest');
    const filterButtons = document.querySelectorAll('.filterButton');
    const playGameBtn = document.getElementById('playGame');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 6;
    let currentPage = 1;
    let allProducts = JSON.parse(localStorage.getItem("products")) || [];
    let currentDisplayedProducts = [...allProducts];

    function renderTests(testList, page = 1) {
        if (!quizzShowTbody) return;
        quizzShowTbody.innerHTML = '';

        currentPage = page;

        if (!testList || testList.length === 0) {
            quizzShowTbody.innerHTML = '<tr><td colspan="2">Không có bài test nào phù hợp.</td></tr>';
            renderPagination(0, currentPage);
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const paginatedTests = testList.slice(startIndex, startIndex + itemsPerPage);

        const columns = 2;
        let row;

        paginatedTests.forEach((product, index) => {
            if (index % columns === 0) {
                row = document.createElement('tr');
                quizzShowTbody.appendChild(row);
            }

            const cell = document.createElement('td');
            cell.innerHTML = `
                <div class="quiz-card">
                    <img src="../assets/images/imgQuiz.jpg" alt="${product.name}" class="quiz-image">
                    <div class="quiz-info">
                        <div class="quiz-content">
                            <p class="quiz-category">${product.categoryText || 'Chưa phân loại'}</p>
                            <p class="quiz-name">${product.name}</p>
                            <p class="quiz-details">${product.questions?.length || 0} câu hỏi - ${product.attempts || 0} lần chơi</p>
                        </div>
                        <button class="play-button" data-id="${product.id}">Chơi</button>
                    </div>
                </div>
            `;
            if (row) row.appendChild(cell);
        });

        if (row && row.children.length < columns && paginatedTests.length > 0) {
            const remainingCells = columns - row.children.length;
            for (let i = 0; i < remainingCells; i++) {
                const emptyCell = document.createElement('td');
                emptyCell.classList.add('empty-quiz-cell');
                if (row) row.appendChild(emptyCell);
            }
        }

        renderPagination(testList.length, currentPage);
    }

    function renderPagination(totalItems, page) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;

        const maxVisibleButtons = 3;

        const prevButton = document.createElement('button');
        prevButton.textContent = '«';
        prevButton.className = 'pagination-button pagination-prev';
        if (page === 1) {
            prevButton.disabled = true;
        }
        prevButton.addEventListener('click', () => {
            if (page > 1) {
                renderTests(currentDisplayedProducts, page - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        let startPage, endPage;
        if (totalPages <= maxVisibleButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfVisible = Math.floor(maxVisibleButtons / 2);
            if (page <= halfVisible + 1) {
                startPage = 1;
                endPage = maxVisibleButtons;
            } else if (page >= totalPages - halfVisible) {
                startPage = totalPages - maxVisibleButtons + 1;
                endPage = totalPages;
            } else {
                startPage = page - halfVisible;
                endPage = page + halfVisible;
                if ((maxVisibleButtons % 2) === 0) {
                    endPage = page + halfVisible - 1;
                }
            }
        }

        startPage = Math.max(1, startPage);
        endPage = Math.min(totalPages, endPage);

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'pagination-button pagination-number';
            if (i === page) {
                btn.classList.add('active');
                btn.disabled = true;
            }

            btn.addEventListener('click', () => {
                if (i !== page) {
                    renderTests(currentDisplayedProducts, i);
                }
            });

            paginationContainer.appendChild(btn);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = '»';
        nextButton.className = 'pagination-button pagination-next';
        if (page === totalPages) {
            nextButton.disabled = true;
        }
        nextButton.addEventListener('click', () => {
            if (page < totalPages) {
                renderTests(currentDisplayedProducts, page + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }


    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const filteredProducts = !searchTerm
                ? [...allProducts]
                : allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.categoryText && product.categoryText.toLowerCase().includes(searchTerm))
                );

            currentDisplayedProducts = filteredProducts;
            renderTests(currentDisplayedProducts, 1);
        });
    }


    if (quizzShowTbody) {
        quizzShowTbody.addEventListener('click', (event) => {
            if (event.target.classList.contains('play-button')) {
                const productId = event.target.getAttribute('data-id');
                if (productId) {
                    window.location.href = `take-quiz.html?id=${productId}`;
                }
            }
        });
    }


    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortType = button.textContent;
            let sortedProducts = [...currentDisplayedProducts];

            if (sortType.includes('tăng dần')) {
                sortedProducts.sort((a, b) => (a.attempts || 0) - (b.attempts || 0));
            } else if (sortType.includes('giảm dần')) {
                sortedProducts.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
            }

            currentDisplayedProducts = sortedProducts;
            renderTests(currentDisplayedProducts, 1);

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    if (playGameBtn) {
        playGameBtn.addEventListener('click', () => {
            if (allProducts.length > 0) {
                const randomIndex = Math.floor(Math.random() * allProducts.length);
                const randomProductId = allProducts[randomIndex].id;
                window.location.href = `take-quiz.html?id=${randomProductId}`;
            }
        });
    }

    renderTests(currentDisplayedProducts, currentPage);
});