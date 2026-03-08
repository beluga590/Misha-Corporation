document.addEventListener('DOMContentLoaded', function() {
    const victimBtn = document.getElementById('victimButton');
    
    if (victimBtn) {
        victimBtn.addEventListener('mouseenter', function() {
            this.textContent = 'Пізно відступати';
        });
        
        victimBtn.addEventListener('mouseleave', function() {
            this.textContent = 'Стати жертвою... ой, партнером';
        });
    }

    const rickrollBtn = document.getElementById('rickrollBtn');
    
    if (rickrollBtn) {
        rickrollBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        });
    }

    const debtsBtn = document.getElementById('debtsButton');
    
    if (debtsBtn) {
        debtsBtn.addEventListener('click', function() {
            window.location.href = '404.html';
        });
    }

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