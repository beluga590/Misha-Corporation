// crypto.js - з інтеграцією Supabase для зберігання історії курсу
document.addEventListener('DOMContentLoaded', function() {
    // Supabase конфігурація
    const SUPABASE_URL = 'https://ikoonalxzxseukvevyfu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_d9WXxn-H3c_ja_eUXD2ziA_bwSjIthl';
    
    let supabase = null;
    let currentUser = null;
    let currentPrice = 0.05;
    let totalSupply = 0;
    
    // Масив для зберігання історії цін (з БД)
    let priceHistory = [];
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase ініціалізовано');
    } catch (error) {
        console.error('Помилка ініціалізації Supabase:', error);
    }

    // ========== РОБОТА З БАЗОЮ ДАНИХ ДЛЯ ІСТОРІЇ ЦІН ==========
    
    // Збереження ціни в базу даних Supabase
    async function savePriceToDB(price) {
        if (!supabase) return false;
        
        try {
            const { error } = await supabase
                .from('price_history')
                .insert([{ 
                    price: price,
                    timestamp: new Date().toISOString()
                }]);
            
            if (error) {
                console.error('Помилка збереження курсу в БД:', error);
                return false;
            }
            
            console.log(`Курс $${price.toFixed(3)} збережено в БД`);
            return true;
        } catch (err) {
            console.error('Помилка при збереженні в БД:', err);
            return false;
        }
    }
    
    // Загрузка данных за последние 7 дней
    async function loadPriceHistoryFromDB() {
        if (!supabase) {
            loadPriceHistoryFromLocal();
            return;
        }

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('price_history')
                .select('timestamp, price')
                .gte('timestamp', sevenDaysAgo.toISOString())
                .order('timestamp', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                priceHistory = data.map(entry => {
                    const dateObj = new Date(entry.timestamp);
                    return {
                        timestamp: dateObj.getTime(),
                        price: entry.price,
                        date: dateObj.toLocaleDateString(),
                        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                });

                savePriceHistoryToLocal();
                return true;
            } else {
                initializeLocalPriceHistory();
                return false;
            }
        } catch (err) {
            loadPriceHistoryFromLocal();
            return false;
        }
    }
    
    // Ініціалізація локальної історії (якщо БД порожня)
    function initializeLocalPriceHistory() {
        priceHistory = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            priceHistory.push({
                timestamp: date.getTime(),
                price: 0.05,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
        savePriceHistoryToLocal();
        
        // Зберігаємо початкові дані в БД
        for (let i = 0; i < priceHistory.length; i++) {
            setTimeout(() => {
                savePriceToDB(priceHistory[i].price);
            }, i * 100);
        }
    }
    
    // Завантаження з localStorage (резервний варіант)
    function loadPriceHistoryFromLocal() {
        const saved = localStorage.getItem('scam_price_history');
        if (saved) {
            priceHistory = JSON.parse(saved);
            console.log('Завантажено з localStorage:', priceHistory.length, 'записів');
        } else {
            initializeLocalPriceHistory();
        }
    }
    
    // Збереження в localStorage (резервне копіювання)
    function savePriceHistoryToLocal() {
        localStorage.setItem('scam_price_history', JSON.stringify(priceHistory));
    }
    
    // Сохранение новых данных без лимита в 30 записей
    async function addPriceToHistory(price) {
        const now = new Date();
        const newEntry = {
            timestamp: now.getTime(),
            price: price,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        priceHistory.push(newEntry);
        
        const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        priceHistory = priceHistory.filter(entry => entry.timestamp >= sevenDaysAgo);
        
        savePriceHistoryToLocal();
        await savePriceToDB(price);
    }
    
    // ========== ОСНОВНА ЛОГІКА РОБОТИ З ЦІНОЮ ==========
    
    // Функція для отримання загальної кількості монет
    async function getTotalScamSupply() {
        try {
            if (!supabase) return 0;
            
            const { data, error } = await supabase
                .from('users')
                .select('scam_balance');
            
            if (error) {
                console.error('Помилка отримання балансів:', error);
                return 0;
            }
            
            const total = data.reduce((sum, user) => {
                return sum + (parseFloat(user.scam_balance) || 0);
            }, 0);
            
            return total;
        } catch (error) {
            console.error('Помилка розрахунку загальної пропозиції:', error);
            return 0;
        }
    }
    
    // Розрахунок ціни: 1 SCAM = +0.001 до курсу
    async function calculatePrice() {
        try {
            if (!supabase) return 0.05;
            
            totalSupply = await getTotalScamSupply();
            // Формула: 1 монета = +0.001 до курсу
            let price = 0.05 + (totalSupply * 0.001);
            
            return Math.round(price * 1000) / 1000; // 3 знаки після коми
        } catch (error) {
            console.error('Помилка розрахунку ціни:', error);
            return 0.05;
        }
    }
    
    // Оновлення балансу на сторінці крипти
    async function updateCryptoPageBalance() {
        if (!currentUser || !supabase) return;
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('scam_balance, balance, first_name, last_name, email')
                .eq('id', currentUser.id)
                .single();
            
            if (error) throw error;
            
            if (data) {
                currentUser = { ...currentUser, ...data };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Оновлюємо USD баланс
                const usdElem = document.getElementById('usdBalance');
                if (usdElem) {
                    usdElem.textContent = '$' + (data.balance || 0).toFixed(2);
                }
                
                // Оновлюємо SCAM баланс
                const scamElem = document.getElementById('scamBalance');
                if (scamElem) {
                    scamElem.innerHTML = `${(data.scam_balance || 0).toFixed(3)} <small>SCAM</small>`;
                }
                
                // Оновлюємо старі елементи для зворотної сумісності
                const balanceElement = document.getElementById('userBalance');
                if (balanceElement) {
                    balanceElement.innerHTML = `<span class="scam-with-logo">${(data.scam_balance || 0).toFixed(3)} <img src="лого.png" alt="лого"></span>`;
                }
                
                const balanceUsdElement = document.getElementById('userBalanceUSD');
                if (balanceUsdElement) {
                    balanceUsdElement.textContent = '$' + ((data.balance || 0).toFixed(2));
                }
                
                // Оновлюємо ім'я користувача в бічній панелі
                const walletUserName = document.getElementById('walletUserName');
                if (walletUserName) {
                    walletUserName.textContent = data.first_name;
                }
                
                // Оновлюємо SCAM баланс в бічній панелі
                const walletUserBalance = document.getElementById('walletUserBalance');
                if (walletUserBalance) {
                    walletUserBalance.textContent = (data.scam_balance || 0).toFixed(3) + ' $SCAM';
                }
                
                // Оновлюємо кнопку в хедері
                const accountBtnText = document.getElementById('accountBtnText');
                if (accountBtnText) {
                    accountBtnText.textContent = data.first_name || 'Кабінет';
                }
            }
        } catch (err) {
            console.error('Помилка завантаження балансу:', err);
        }
    }
    
    // Оновлення попереднього перегляду при покупці
    function updateBuyPreview() {
        const usdAmountInput = document.getElementById('buyAmount');
        const previewElement = document.getElementById('buyPreview');
        
        if (!usdAmountInput || !previewElement) return;
        
        const usdAmount = parseFloat(usdAmountInput.value.trim());
        
        if (isNaN(usdAmount) || usdAmount <= 0) {
            previewElement.innerHTML = '';
            return;
        }
        
        const wholeScamAmount = Math.floor(usdAmount / currentPrice);
        const fractionalPart = (usdAmount / currentPrice) - wholeScamAmount;
        
        let previewHtml = `
            <div class="preview-box">
                <div class="preview-label">📊 Попередній перегляд:</div>
                <div class="preview-amount">
                    Ви отримаєте: <span>${wholeScamAmount.toFixed(3)} $SCAM</span>
                </div>
        `;
        
        if (fractionalPart > 0 && fractionalPart < 1) {
            const remainingUSD = fractionalPart * currentPrice;
            previewHtml += `
                <div class="preview-warning" style="color: #ffaa44; margin-top: 5px;">
                    ⚠️ На ${fractionalPart.toFixed(3)} $SCAM не вистачає коштів (потрібно ще $${(currentPrice - remainingUSD).toFixed(3)})
                </div>
                <div class="preview-refund" style="color: #a8e6cf; margin-top: 5px;">
                    💰 ${remainingUSD.toFixed(3)} USD буде повернено на баланс
                </div>
            `;
        }
        
        previewHtml += `
                <div class="preview-rate" style="margin-top: 5px;">
                    За курсом: 1 $SCAM = $${currentPrice.toFixed(3)}
                </div>
            </div>
        `;
        
        previewElement.innerHTML = previewHtml;
    }
    
    // Оновлення попереднього перегляду при продажі
    function updateSellPreview() {
        const scamAmountInput = document.getElementById('sellAmount');
        const previewElement = document.getElementById('sellPreview');
        
        if (!scamAmountInput || !previewElement) return;
        
        const scamAmount = parseFloat(scamAmountInput.value.trim());
        
        if (isNaN(scamAmount) || scamAmount <= 0) {
            previewElement.innerHTML = '';
            return;
        }
        
        const usdAmount = scamAmount * currentPrice;
        
        previewElement.innerHTML = `
            <div class="preview-box">
                <div class="preview-label">📊 Попередній перегляд:</div>
                <div class="preview-amount">
                    Ви отримаєте: <span>$${usdAmount.toFixed(3)} USD</span>
                </div>
                <div class="preview-rate">
                    За курсом: 1 $SCAM = $${currentPrice.toFixed(3)}
                </div>
            </div>
        `;
    }
    
    // ========== ФУНКЦІЇ ДЛЯ РОБОТИ З ГРАФІКАМИ ==========
    
    function getHistorySlice(count) {
        if (!priceHistory || priceHistory.length === 0) {
            return [currentPrice];
        }
        
        // Беремо останні count записів з priceHistory
        const historySlice = priceHistory.slice(-count);
        
        // Якщо в історії менше записів, ніж потрібно, доповнюємо поточним курсом
        if (historySlice.length < count) {
            const filler = [];
            const needed = count - historySlice.length;
            for (let i = 0; i < needed; i++) {
                filler.push(currentPrice);
            }
            return [...filler, ...historySlice.map(entry => entry.price)];
        }
        
        return historySlice.map(entry => entry.price);
    }
    
    function updateMainChartWithHistory() {
        const activeBtn = document.querySelector('.chart-btn.active');
        const activePeriod = activeBtn ? activeBtn.dataset.period : '1h';

        let count;
        switch(activePeriod) {
            case '1h': count = 20; break;
            case '6h': count = 50; break;
            case '12h': count = 80; break;
            case '24h': count = 120; break;
            case '7d': count = 300; break;
            case '30d': count = 600; break;
            default: count = 50;
        }

        const activeData = getHistorySlice(count);
        const labels = Array(activeData.length).fill('');

        if (charts.mainChart) {
            charts.mainChart.data.datasets[0].data = activeData;
            charts.mainChart.data.labels = labels;
            charts.mainChart.update('none');
        } else {
            createChart('mainChart', activeData, '#e6b422', 'Курс $SCAM');
        }

        updatePriceChangeDisplay(activeData);
        updateSmallCharts();
    }
    
    function updatePriceChangeDisplay(data) {
        if (data.length < 2) return;

        const firstPrice = data[0];
        const lastPrice = data[data.length - 1];
        const change = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);

        const priceChangeElement = document.getElementById('priceChange');
        const mainChartChange = document.getElementById('mainChartChange');

        [priceChangeElement, mainChartChange].forEach(el => {
            if (el) {
                el.textContent = (change > 0 ? '+' : '') + change + '%';
                el.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
            }
        });
    }
    
    function updateSmallCharts() {
        const configs = [
            { id: 'chart1h', count: 20, color: '#ff6b6b', label: '$SCAM 1H' },
            { id: 'chart6h', count: 50, color: '#4ecdc4', label: '$SCAM 6H' },
            { id: 'chart24h', count: 120, color: '#e6b422', label: '$SCAM 24H' },
            { id: 'chart7d', count: 300, color: '#a8e6cf', label: '$SCAM 7D' }
        ];

        configs.forEach(config => {
            const data = getHistorySlice(config.count);
            
            if (charts[config.id]) {
                charts[config.id].data.datasets[0].data = data;
                charts[config.id].data.labels = Array(data.length).fill('');
                charts[config.id].update('none');
            } else {
                createChart(config.id, data, config.color, config.label);
            }
        });

        updateMaxValues();
    }
    
    function updateMaxValues() {
        const stats = [
            { id: '1h', maxId: 'max1h', changeId: 'change1h', count: 20 },
            { id: '6h', maxId: 'max6h', changeId: 'change6h', count: 50 },
            { id: '24h', maxId: 'max24h', changeId: 'change24h', count: 120 },
            { id: '7d', maxId: 'max7d', changeId: 'change7d', count: 300 }
        ];

        stats.forEach(stat => {
            const data = getHistorySlice(stat.count);
            if (data.length > 0) {
                const maxElement = document.getElementById(stat.maxId);
                if (maxElement) {
                    maxElement.textContent = Math.max(...data).toFixed(3);
                }

                const changeElement = document.getElementById(stat.changeId);
                if (changeElement) {
                    const first = data[0];
                    const last = data[data.length - 1];
                    const change = ((last - first) / first * 100).toFixed(2);
                    changeElement.textContent = (change > 0 ? '+' : '') + change + '%';
                    changeElement.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
                }
            }
        });
    }
    
    // Покупка SCAM
    async function buyScam() {
        const usdAmountInput = document.getElementById('buyAmount');
        if (!usdAmountInput) return { success: false, message: 'Поле введення не знайдено' };
        
        const usdToSpend = parseFloat(usdAmountInput.value.trim());
        
        if (isNaN(usdToSpend) || usdToSpend <= 0) {
            showTransactionResult('buyResult', '❌ Введіть коректну суму в USD!', 'error');
            return { success: false, message: 'Невірна сума' };
        }
        
        if (!currentUser) {
            showAuthModal();
            return { success: false, message: '🔒 Необхідно авторизуватися для покупки' };
        }
        
        const usdBalance = parseFloat(currentUser.balance);
        if (usdToSpend > usdBalance) {
            const errorMsg = `💰 Недостатньо USD. Ваш баланс: $${usdBalance.toFixed(2)}`;
            showTransactionResult('buyResult', errorMsg, 'error');
            return { success: false, message: errorMsg };
        }
        
        const wholeScamAmount = Math.floor(usdToSpend / currentPrice);
        
        if (wholeScamAmount === 0) {
            const errorMsg = `❌ Недостатньо коштів для покупки 1 $SCAM. Мінімальна сума: $${currentPrice.toFixed(3)}`;
            showTransactionResult('buyResult', errorMsg, 'error');
            return { success: false, message: errorMsg };
        }
        
        const costForWhole = wholeScamAmount * currentPrice;
        const remainingUSD = usdToSpend - costForWhole;
        
        const newUsdBalance = usdBalance - costForWhole;
        const newScamBalance = (parseFloat(currentUser.scam_balance) || 0) + wholeScamAmount;
        
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    balance: newUsdBalance,
                    scam_balance: newScamBalance
                })
                .eq('id', currentUser.id);
            
            if (updateError) throw updateError;
            
            let transactionDetails = `Витрачено $${costForWhole.toFixed(3)} на покупку ${wholeScamAmount.toFixed(3)} $SCAM (ціна: $${currentPrice.toFixed(3)})`;
            
            if (remainingUSD > 0) {
                transactionDetails += `. Повернено на баланс: $${remainingUSD.toFixed(3)} USD (не вистачило на цілу монету)`;
            }
            
            await supabase
                .from('transactions')
                .insert([{
                    user_id: currentUser.id,
                    sender_id: currentUser.id,
                    recipient_id: currentUser.id,
                    type: 'Купівля SCAM',
                    amount: wholeScamAmount,
                    currency: 'SCAM',
                    amount_usd: costForWhole,
                    details: transactionDetails
                }]);
            
            currentUser.balance = newUsdBalance;
            currentUser.scam_balance = newScamBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            await updateCryptoPageBalance();
            await updateAllStats();
            await updateLeaderboard();
            
            usdAmountInput.value = '';
            updateBuyPreview();
            
            let successMsg = `✅ Успішно! Ви купили ${wholeScamAmount.toFixed(3)} $SCAM за $${costForWhole.toFixed(3)}`;
            if (remainingUSD > 0) {
                successMsg += `\n💰 Повернено на баланс: $${remainingUSD.toFixed(3)} USD`;
            }
            showTransactionResult('buyResult', successMsg, 'success');
            
            return { success: true, message: successMsg };
        } catch (error) {
            console.error('Помилка при покупці:', error);
            showTransactionResult('buyResult', '❌ Помилка при покупці', 'error');
            return { success: false, message: 'Помилка' };
        }
    }
    
    // Продаж SCAM
    async function sellScam() {
        const amountInput = document.getElementById('sellAmount');
        if (!amountInput) return { success: false, message: 'Поле введення не знайдено' };
        
        const inputValue = amountInput.value.trim();
        
        if (inputValue === '') {
            showTransactionResult('sellResult', '❌ Введіть кількість монет', 'error');
            return { success: false, message: 'Пусте поле' };
        }
        
        const amount = parseFloat(inputValue);
        
        if (isNaN(amount) || amount <= 0) {
            showTransactionResult('sellResult', '❌ Введіть додатнє число', 'error');
            return { success: false, message: 'Невірне значення' };
        }
        
        if (!currentUser) {
            showAuthModal();
            return { success: false, message: '🔒 Необхідно авторизуватися для продажу' };
        }
        
        const scamBalance = parseFloat(currentUser.scam_balance) || 0;
        if (amount > scamBalance) {
            const errorMsg = `💰 Недостатньо $SCAM. Ваш баланс: ${scamBalance.toFixed(3)} $SCAM`;
            showTransactionResult('sellResult', errorMsg, 'error');
            return { success: false, message: errorMsg };
        }
        
        const usdAmount = amount * currentPrice;
        const newUsdBalance = (parseFloat(currentUser.balance) || 0) + usdAmount;
        const newScamBalance = scamBalance - amount;
        
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    balance: newUsdBalance,
                    scam_balance: newScamBalance
                })
                .eq('id', currentUser.id);
            
            if (updateError) throw updateError;
            
            await supabase
                .from('transactions')
                .insert([{
                    user_id: currentUser.id,
                    sender_id: currentUser.id,
                    recipient_id: currentUser.id,
                    type: 'Продаж SCAM',
                    amount: amount,
                    currency: 'SCAM',
                    amount_usd: usdAmount,
                    details: `Продаж ${amount.toFixed(3)} $SCAM за $${usdAmount.toFixed(3)} (ціна: $${currentPrice.toFixed(3)})`
                }]);
            
            currentUser.balance = newUsdBalance;
            currentUser.scam_balance = newScamBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            await updateCryptoPageBalance();
            await updateAllStats();
            await updateLeaderboard();
            
            amountInput.value = '';
            updateSellPreview();
            
            const successMsg = `✅ Успішно! Ви продали ${amount.toFixed(3)} $SCAM за $${usdAmount.toFixed(3)}`;
            showTransactionResult('sellResult', successMsg, 'success');
            
            return { success: true, message: successMsg };
        } catch (error) {
            console.error('Помилка при продажі:', error);
            showTransactionResult('sellResult', '❌ Помилка при продажі', 'error');
            return { success: false, message: 'Помилка' };
        }
    }
    
    function showTransactionResult(elementId, message, type) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.textContent = message;
            resultElement.className = `transaction-result ${type}`;
            setTimeout(() => {
                resultElement.textContent = '';
                resultElement.className = 'transaction-result';
            }, 5000);
        }
    }
    
    // Оновлення таблиці лідерів
    async function updateLeaderboard() {
        if (!supabase) return;
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name, scam_balance')
                .order('scam_balance', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            // Статуси для кожного місця
            const statuses = [
                { name: '👑 Крипто-Король', color: '#ffd700' },
                { name: '💎 Платиновий Інвестор', color: '#e5e4e2' },
                { name: '🥉 Бронзовий Магнат', color: '#cd7f32' },
                { name: '📈 Висхідна Зірка', color: '#4ecdc4' },
                { name: '⚡ Енерджайзер', color: '#95e77e' },
                { name: '🎯 Мисливець за SCAM', color: '#ff9f4a' },
                { name: '🦊 Хитрий Лис', color: '#ff6b6b' },
                { name: '🐧 Пінгвін-Холдер', color: '#6c5ce7' },
                { name: '🌟 Новачок', color: '#a8e6cf' },
                { name: '🎲 Щасливчик', color: '#fd79a8' }
            ];
            
            for (let i = 0; i < 10; i++) {
                const user = data[i];
                const row = document.createElement('tr');
                const status = statuses[i];
                
                if (user && user.scam_balance > 0) {
                    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    const balance = user.scam_balance.toFixed(3);
                    
                    row.innerHTML = `
                        <th scope="row" style="font-weight: bold;">${i + 1}</th>
                        <td>${escapeHtml(name)}</td>
                        <td>
                            <span class="scam-with-logo">
                                ${balance}
                                <img src="лого.png" alt="лого">
                            </span>
                        </td>
                        <td style="color: ${status.color}; font-weight: bold;">${status.name}</td>
                    `;
                } else {
                    row.innerHTML = `
                        <th scope="row" style="font-weight: bold;">${i + 1}</th>
                        <td>---</td>
                        <td>---</td>
                        <td style="color: #6b7280;">${status.name} (вакантно)</td>
                    `;
                }
                tbody.appendChild(row);
            }
            
            const totalSupplyElement = document.getElementById('totalSupply');
            if (totalSupplyElement && totalSupply > 0) {
                totalSupplyElement.innerHTML = `<span class="scam-with-logo">${totalSupply.toFixed(3)} <img src="лого.png" alt="лого"></span>`;
            }
            
        } catch (error) {
            console.error('Помилка оновлення лідерборду:', error);
        }
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Оновлення статистики та графіків
    async function updateAllStats() {
        try {
            const oldPrice = currentPrice;
            currentPrice = await calculatePrice();
            
            // Додаємо нову ціну в історію, якщо вона змінилася
            if (oldPrice !== currentPrice) {
                await addPriceToHistory(currentPrice);
            }
            
            const priceElement = document.getElementById('currentPrice');
            if (priceElement) {
                priceElement.innerHTML = `<span class="scam-with-logo">$${currentPrice.toFixed(3)} <img src="лого.png" alt="лого"></span>`;
            }
            
            const totalSupplyElement = document.getElementById('totalSupply');
            if (totalSupplyElement && totalSupply > 0) {
                totalSupplyElement.innerHTML = `<span class="scam-with-logo">${totalSupply.toFixed(3)} <img src="лого.png" alt="лого"></span>`;
            }
            
            const marketCapElement = document.getElementById('marketCap');
            if (marketCapElement) {
                const marketCap = currentPrice * totalSupply;
                marketCapElement.innerHTML = `<span class="scam-with-logo">$${marketCap.toFixed(2)} <img src="лого.png" alt="лого"></span>`;
            }
            
            const volumeElement = document.getElementById('volume');
            if (volumeElement) {
                const volume = currentPrice * 50000;
                volumeElement.innerHTML = `<span class="scam-with-logo">${volume.toFixed(2)} $SCAM <img src="лого.png" alt="лого"></span>`;
            }
            
            // Оновлюємо графік з історичними даними
            updateMainChartWithHistory();
            
            updateBuyPreview();
            updateSellPreview();
            
            if (currentUser) {
                await updateCryptoPageBalance();
            }
            
        } catch (error) {
            console.error('Помилка оновлення статистики:', error);
        }
    }
    
    function setupPeriodButtons() {
        const periodBtns = document.querySelectorAll('.chart-btn');
        const periodNames = {
            '1h': '1 година',
            '6h': '6 годин',
            '12h': '12 годин',
            '24h': '24 години',
            '7d': '7 днів',
            '30d': '30 днів'
        };

        periodBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                if (this.classList.contains('active')) return;

                periodBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const period = this.dataset.period;
                const selectedPeriod = document.getElementById('selectedPeriod');
                if (selectedPeriod) {
                    selectedPeriod.textContent = periodNames[period] || period;
                }

                updateMainChartWithHistory();
            });
        });
    }
    
    function createChart(canvasId, data, color, label) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const labels = Array(data.length).fill('');
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: 'rgba(230, 180, 34, 0.05)',
                    borderWidth: canvasId === 'mainChart' ? 3 : 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: canvasId === 'mainChart' ? 2 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        display: canvasId === 'mainChart',
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.raw.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        ticks: { color: '#9ca3af', callback: function(value) { return '$' + value.toFixed(3); } }
                    },
                    x: { 
                        display: canvasId === 'mainChart',
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
        
        charts[canvasId] = chart;
        return chart;
    }
    
    async function checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        
        if (!savedUser) {
            currentUser = null;
            return false;
        }
        
        if (!supabase) {
            console.error('Supabase не ініціалізовано');
            currentUser = null;
            return false;
        }
        
        try {
            const user = JSON.parse(savedUser);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error || !data) {
                localStorage.removeItem('currentUser');
                currentUser = null;
                return false;
            }
            
            currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(data));
            
            const accountBtnText = document.getElementById('accountBtnText');
            if (accountBtnText) {
                accountBtnText.textContent = data.first_name || 'Кабінет';
            }
            
            const userWalletInfo = document.getElementById('userWalletInfo');
            if (userWalletInfo) {
                userWalletInfo.style.display = 'block';
            }
            
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            
            // Завантажуємо баланс після успішної авторизації
            await updateCryptoPageBalance();
            
            return true;
        } catch (error) {
            console.error('Помилка перевірки авторизації:', error);
            currentUser = null;
            return false;
        }
    }
    
    function showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    async function init() {
        // Спочатку завантажуємо історію з БД
        await loadPriceHistoryFromDB();
        await checkAuth();
        await updateAllStats();
        await updateLeaderboard();
        
        setupPeriodButtons();
        
        const buyAmountInput = document.getElementById('buyAmount');
        const sellAmountInput = document.getElementById('sellAmount');
        
        if (buyAmountInput) {
            buyAmountInput.addEventListener('input', updateBuyPreview);
        }
        
        if (sellAmountInput) {
            sellAmountInput.addEventListener('input', updateSellPreview);
        }
        
        const buyBtn = document.getElementById('buyBtn');
        const sellBtn = document.getElementById('sellBtn');
        
        if (buyBtn) {
            buyBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                await buyScam();
            });
        }
        
        if (sellBtn) {
            sellBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                await sellScam();
            });
        }
        
        const modal = document.getElementById('authModal');
        const closeModal = document.getElementById('closeModal');
        if (closeModal) closeModal.addEventListener('click', hideAuthModal);
        window.addEventListener('click', function(event) {
            if (event.target === modal) hideAuthModal();
        });
        
        const accountBtn = document.getElementById('accountBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (accountBtn) {
            accountBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const savedUser = localStorage.getItem('currentUser');
                if (savedUser) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'register.html';
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
        
        setInterval(async () => {
            await updateAllStats();
            await updateLeaderboard();
        }, 30000);
        
        const jokeBtn = document.getElementById('cryptoJokeBtn');
        const jokeText = document.getElementById('cryptoJoke');
        const jokes = [
            "Михайло каже: 'Курс растет! Купуйте, поки я друкую!' 🤣",
            "Михайло сьогодні в гарному настрої - курс впаде тільки на 90%",
            "Михайло продав квартиру і купив $SCAM, тепер живе в офісі",
            "Чим більше монет у всіх, тим вище курс! 🚀",
            "Курс $SCAM = 0.05 + (количество монет × 0.001)! Без обмежень!",
            "Можна купувати будь-яку кількість - навіть 0.001 монети! 💎",
            "Якщо не вистачає на цілу монету - гроші повертаються! 💰",
            "Кіт Мурка написав курс лапкою - сьогодні +1000%!"
        ];
        
        if (jokeBtn && jokeText) {
            jokeBtn.addEventListener('click', function() {
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                jokeText.textContent = randomJoke;
                setTimeout(() => {
                    jokeText.textContent = '';
                }, 3000);
            });
        }
    }
    
    // Хранилище графіків
    let charts = {};
    
    init();
});