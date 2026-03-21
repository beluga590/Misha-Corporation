// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Головна функція, яка оновлює хедер при завантаженні сторінки
    updateAuthHeader();

    // --- Логіка для головної сторінки (index.html) ---
    const victimBtn = document.getElementById('victimButton');
    if (victimBtn) {
        victimBtn.addEventListener('mouseenter', function() {
            this.textContent = 'Пізно відступати';
        });
        victimBtn.addEventListener('mouseleave', function() {
            this.textContent = 'Стати партнером';
        });
    }

    const rickrollBtn = document.getElementById('rickrollBtn');
    if (rickrollBtn) {
        rickrollBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        });
    }

    // --- Логіка для сторінки "Про нас" (about.html) ---
    const debtsBtn = document.getElementById('debtsButton');
    if (debtsBtn) {
        debtsBtn.addEventListener('click', function() {
            window.location.href = '404.html';
        });
    }

    // --- Логіка для сторінки "Контакти" (contacts.html) ---
    const chanceForm = document.getElementById('chanceForm');
    const formContainer = document.getElementById('formContainer');
    const callCenter = document.getElementById('callCenter');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const guessBtn = document.getElementById('guessBtn');

    if (chanceForm) {
        chanceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (formContainer) {
                formContainer.style.display = 'none';
            }

            if (callCenter) {
                callCenter.style.display = 'block';

                if (phoneDisplay) {
                    setInterval(() => {
                        const part1 = Math.floor(Math.random() * 10000);
                        const part2 = Math.floor(Math.random() * 10000);
                        phoneDisplay.textContent = `+380 ${part1.toString().padStart(4, '0')} ${part2.toString().padStart(4, '0')}`;
                    }, 100);
                }
            }
        });
    }

    if (guessBtn) {
        guessBtn.addEventListener('click', function() {
            alert('Неправда. Спробуйте ще раз через 100 років');
        });
    }

    // --- Логіка для сторінки 404 (404.html) ---
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');

    if (loadingBar && loadingText) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;

            if (progress <= 99) {
                loadingBar.style.width = progress + '%';
                loadingText.textContent = `Завантаження боргів... ${progress}%`;
            }

            if (progress === 99) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingBar.style.width = '0%';
                    loadingText.textContent = 'Ой, забув. Завантаження боргів... 0%';
                }, 1500);
            }
        }, 100);
    }
});

// Функція для оновлення хедера (викликається при завантаженні)
function updateAuthHeader() {
    const accountBtn = document.getElementById('accountBtn');
    const accountBtnText = document.getElementById('accountBtnText');
    const accountDropdown = document.getElementById('accountDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // Якщо на сторінці немає кнопки акаунта (наприклад, на auth.html), виходимо
    if (!accountBtn) return;

    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
        // Якщо користувач залогінений
        try {
            const user = JSON.parse(savedUser);
            accountBtnText.textContent = user.first_name || 'Кабінет';

            // Прибираємо старі обробники, щоб не накопичувались
            accountBtn.replaceWith(accountBtn.cloneNode(true));
            const newAccountBtn = document.getElementById('accountBtn');
            const newAccountBtnText = document.getElementById('accountBtnText');
            const newAccountDropdown = document.getElementById('accountDropdown');
            const newLogoutBtn = document.getElementById('logoutBtn');

            if (newAccountBtn && newAccountBtnText) {
                newAccountBtnText.textContent = user.first_name || 'Кабінет';

                // Клік по кнопці: показуємо/ховаємо дропдаун
                newAccountBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (newAccountDropdown) {
                        newAccountDropdown.classList.toggle('show');
                    }
                });

                // Клік по всьому документу ховає дропдаун
                document.addEventListener('click', function() {
                    if (newAccountDropdown) {
                        newAccountDropdown.classList.remove('show');
                    }
                });

                // Обробник для кнопки "Вийти"
                if (newLogoutBtn) {
                    newLogoutBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        localStorage.removeItem('currentUser');
                        window.location.reload(); // Перезавантажуємо сторінку, щоб оновити хедер
                    });
                }
            }

        } catch (e) {
            console.error('Помилка парсингу користувача:', e);
            localStorage.removeItem('currentUser');
            accountBtnText.textContent = 'Кабінет';
            // Якщо помилка, перенаправляємо на реєстрацію при кліку
            accountBtn.onclick = function() {
                window.location.href = 'register.html';
            };
        }
    } else {
        // Якщо користувач не залогінений
        accountBtnText.textContent = 'Кабінет';
        // Ховаємо дропдаун, якщо він був відкритий
        if (accountDropdown) {
            accountDropdown.classList.remove('show');
        }
        // При кліку на кнопку переходимо на сторінку реєстрації
        accountBtn.onclick = function() {
            window.location.href = 'register.html';
        };
    }
}