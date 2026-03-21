// crypto.js
document.addEventListener('DOMContentLoaded', function() {
    // Supabase конфигурация
    const SUPABASE_URL = 'https://ikoonalxzxseukvevyfu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_d9WXxn-H3c_ja_eUXD2ziA_bwSjIthl';
    
    let supabase = null;
    let currentUser = null;
    let currentPrice = 0.05;
    let totalSupply = 0;
    
    // Массив для хранения истории цен (последние 30 дней)
    let priceHistory = [];
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase инициализирован');
    } catch (error) {
        console.error('Ошибка инициализации Supabase:', error);
    }

    // Загрузка истории цен из localStorage
    function loadPriceHistory() {
        const saved = localStorage.getItem('scam_price_history');
        if (saved) {
            priceHistory = JSON.parse(saved);
        } else {
            // Инициализация истории за последние 30 дней
            priceHistory = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                priceHistory.push({
                    timestamp: date.getTime(),
                    price: 0.05,
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString()
                });
            }
            savePriceHistory();
        }
    }
    
    // Сохранение истории цен
    function savePriceHistory() {
        localStorage.setItem('scam_price_history', JSON.stringify(priceHistory));
    }
    
    // Добавление новой цены в историю
    function addPriceToHistory(price) {
        const now = new Date();
        const newEntry = {
            timestamp: now.getTime(),
            price: price,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };
        
        priceHistory.push(newEntry);
        
        // Оставляем только последние 30 дней (30 записей)
        if (priceHistory.length > 30) {
            priceHistory = priceHistory.slice(-30);
        }
        
        savePriceHistory();
    }
    
    // Функция для получения общего количества монет
    async function getTotalScamSupply() {
        try {
            if (!supabase) return 0;
            
            const { data, error } = await supabase
                .from('users')
                .select('scam_balance');
            
            if (error) {
                console.error('Ошибка получения балансов:', error);
                return 0;
            }
            
            const total = data.reduce((sum, user) => {
                return sum + (parseFloat(user.scam_balance) || 0);
            }, 0);
            
            return total;
        } catch (error) {
            console.error('Ошибка расчета общего предложения:', error);
            return 0;
        }
    }
    
    // Расчет цены: 1 SCAM = +0.001 к курсу
    async function calculatePrice() {
        try {
            if (!supabase) return 0.05;
            
            totalSupply = await getTotalScamSupply();
            // Формула: 1 монета = +0.001 к курсу
            let price = 0.05 + (totalSupply * 0.001);
            
            return Math.round(price * 1000) / 1000; // 3 знака после запятой
        } catch (error) {
            console.error('Ошибка расчета цены:', error);
            return 0.05;
        }
    }
    
    // Функция для обновления баланса на странице крипты
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
                
                // Обновляем USD баланс (как в dashboard)
                const usdElem = document.getElementById('usdBalance');
                if (usdElem) {
                    usdElem.textContent = '$' + (data.balance || 0).toFixed(2);
                }
                
                // Обновляем SCAM баланс (как в dashboard)
                const scamElem = document.getElementById('scamBalance');
                if (scamElem) {
                    scamElem.innerHTML = `${(data.scam_balance || 0).toFixed(3)} <small>SCAM</small>`;
                }
                
                // Обновляем старые элементы для обратной совместимости
                const balanceElement = document.getElementById('userBalance');
                if (balanceElement) {
                    balanceElement.innerHTML = `<span class="scam-with-logo">${(data.scam_balance || 0).toFixed(3)} <img src="лого.png" alt="лого"></span>`;
                }
                
                const balanceUsdElement = document.getElementById('userBalanceUSD');
                if (balanceUsdElement) {
                    balanceUsdElement.textContent = '$' + ((data.balance || 0).toFixed(2));
                }
                
                // Обновляем имя пользователя в боковой панели
                const walletUserName = document.getElementById('walletUserName');
                if (walletUserName) {
                    walletUserName.textContent = data.first_name;
                }
                
                // Обновляем SCAM баланс в боковой панели
                const walletUserBalance = document.getElementById('walletUserBalance');
                if (walletUserBalance) {
                    walletUserBalance.textContent = (data.scam_balance || 0).toFixed(3) + ' $SCAM';
                }
                
                // Обновляем USD баланс в боковой панели
                const walletUserBalanceUSD = document.getElementById('walletUserBalanceUSD');
                if (walletUserBalanceUSD) {
                    walletUserBalanceUSD.textContent = '$' + ((data.balance || 0).toFixed(2));
                }
                
                // Обновляем кнопку в хедере
                const accountBtnText = document.getElementById('accountBtnText');
                if (accountBtnText) {
                    accountBtnText.textContent = data.first_name || 'Кабінет';
                }
            }
        } catch (err) {
            console.error('Ошибка загрузки баланса:', err);
        }
    }
    
    // Функция для обновления предпросмотра при покупке
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
    
    // Функция для обновления предпросмотра при продаже
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
    
    // Генерация данных для графика с историей
    function generateChartDataWithHistory(points) {
        if (priceHistory.length >= points) {
            // Берем последние points записей из истории
            const lastPoints = priceHistory.slice(-points);
            return lastPoints.map(entry => entry.price);
        } else {
            // Если истории недостаточно, генерируем случайные данные
            const data = [];
            let price = currentPrice * (1 - 0.2);
            for (let i = 0; i < points; i++) {
                const change = (Math.random() - 0.5) * 0.05 * price;
                price = Math.max(0.01, price + change);
                data.push(Math.round(price * 1000) / 1000);
            }
            return data;
        }
    }
    
    // Получение меток времени для графика
    function getChartLabels(points) {
        if (priceHistory.length >= points) {
            const lastPoints = priceHistory.slice(-points);
            return lastPoints.map(entry => `${entry.date}\n${entry.time}`);
        } else {
            return Array(points).fill('');
        }
    }
    
    // Покупка SCAM
    async function buyScam() {
        const usdAmountInput = document.getElementById('buyAmount');
        if (!usdAmountInput) return { success: false, message: 'Поле ввода не найдено' };
        
        const usdToSpend = parseFloat(usdAmountInput.value.trim());
        
        if (isNaN(usdToSpend) || usdToSpend <= 0) {
            showTransactionResult('buyResult', '❌ Введіть коректну суму в USD!', 'error');
            return { success: false, message: 'Неверная сумма' };
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
            console.error('Ошибка при покупке:', error);
            showTransactionResult('buyResult', '❌ Помилка при покупці', 'error');
            return { success: false, message: 'Ошибка' };
        }
    }
    
    // Продажа SCAM
    async function sellScam() {
        const amountInput = document.getElementById('sellAmount');
        if (!amountInput) return { success: false, message: 'Поле ввода не найдено' };
        
        const inputValue = amountInput.value.trim();
        
        if (inputValue === '') {
            showTransactionResult('sellResult', '❌ Введіть кількість монет', 'error');
            return { success: false, message: 'Пустое поле' };
        }
        
        const amount = parseFloat(inputValue);
        
        if (isNaN(amount) || amount <= 0) {
            showTransactionResult('sellResult', '❌ Введіть додатнє число', 'error');
            return { success: false, message: 'Неверное значение' };
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
            console.error('Ошибка при продаже:', error);
            showTransactionResult('sellResult', '❌ Помилка при продажі', 'error');
            return { success: false, message: 'Ошибка' };
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
    
    // Обновление таблицы лидеров с разными статусами для каждого места
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
            
            // Статусы для каждого места
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
            console.error('Ошибка обновления лидерборда:', error);
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
    
    // Обновление статистики и графиков
    async function updateAllStats() {
        try {
            const oldPrice = currentPrice;
            currentPrice = await calculatePrice();
            
            // Добавляем новую цену в историю, если она изменилась
            if (oldPrice !== currentPrice) {
                addPriceToHistory(currentPrice);
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
            
            // Обновляем график с историческими данными
            updateMainChartWithHistory();
            
            updateBuyPreview();
            updateSellPreview();
            
            if (currentUser) {
                await updateCryptoPageBalance();
            }
            
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
        }
    }
    
    // Обновление главного графика с историческими данными
    function updateMainChartWithHistory() {
        const points = 30; // 30 дней
        const chartData = generateChartDataWithHistory(points);
        const labels = getChartLabels(points);
        
        if (charts.mainChart) {
            charts.mainChart.data.datasets[0].data = chartData;
            charts.mainChart.data.labels = labels;
            charts.mainChart.update();
        } else {
            createChartWithHistory('mainChart', chartData, labels, '#e6b422', 'Курс $SCAM (30 днів)');
        }
        
        // Обновляем остальные графики
        const volatility = 0.12;
        const randomData = generateChartData(currentPrice, 60, volatility);
        updateSmallCharts(randomData);
        
        if (chartData.length > 0) {
            const firstPrice = chartData[0];
            const lastPrice = chartData[chartData.length - 1];
            const change = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
            
            const priceChangeElement = document.getElementById('priceChange');
            if (priceChangeElement) {
                priceChangeElement.textContent = (change > 0 ? '+' : '') + change + '%';
                priceChangeElement.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
            }
            
            const mainChartChange = document.getElementById('mainChartChange');
            if (mainChartChange) {
                mainChartChange.textContent = (change > 0 ? '+' : '') + change + '%';
                mainChartChange.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
            }
        }
    }
    
    function generateChartData(currentDbPrice, points, volatility) {
        const data = [];
        let price = Math.max(0.001, currentDbPrice * (1 - (volatility * 2)));
        
        for (let i = 0; i < points - 1; i++) {
            const change = (Math.random() - 0.5) * volatility * price;
            price = Math.max(0.001, price + change);
            
            const r = Math.random();
            if (r > 0.97) price *= 1.1;
            if (r < 0.03) price *= 0.9;
            
            data.push(Math.round(price * 1000) / 1000);
        }
        
        data.push(currentDbPrice);
        return data;
    }
    
    function updateSmallCharts(chartData) {
        if (charts.chart1h) {
            charts.chart1h.data.datasets[0].data = chartData;
            charts.chart1h.update();
        } else {
            createChart('chart1h', chartData, '#ff6b6b', '$SCAM 1H');
        }
        
        if (charts.chart6h) {
            charts.chart6h.data.datasets[0].data = chartData;
            charts.chart6h.update();
        } else {
            createChart('chart6h', chartData, '#4ecdc4', '$SCAM 6H');
        }
        
        if (charts.chart24h) {
            charts.chart24h.data.datasets[0].data = chartData;
            charts.chart24h.update();
        } else {
            createChart('chart24h', chartData, '#e6b422', '$SCAM 24H');
        }
        
        if (charts.chart7d) {
            charts.chart7d.data.datasets[0].data = chartData;
            charts.chart7d.update();
        } else {
            createChart('chart7d', chartData, '#a8e6cf', '$SCAM 7D');
        }
        
        updateMaxValues(chartData);
    }
    
    function updateMaxValues(chartData) {
        const periods = [
            { id: '1h', maxId: 'max1h', changeId: 'change1h' },
            { id: '6h', maxId: 'max6h', changeId: 'change6h' },
            { id: '24h', maxId: 'max24h', changeId: 'change24h' },
            { id: '7d', maxId: 'max7d', changeId: 'change7d' }
        ];
        
        periods.forEach(period => {
            if (chartData && chartData.length > 0) {
                const maxElement = document.getElementById(period.maxId);
                if (maxElement) {
                    const maxValue = Math.max(...chartData);
                    maxElement.textContent = maxValue.toFixed(3);
                }
                
                const changeElement = document.getElementById(period.changeId);
                if (changeElement) {
                    const first = chartData[0];
                    const last = chartData[chartData.length - 1];
                    const change = ((last - first) / first * 100).toFixed(2);
                    changeElement.textContent = (change > 0 ? '+' : '') + change + '%';
                    changeElement.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
                }
            }
        });
    }
    
    function createChartWithHistory(canvasId, data, labels, color, label) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: 'rgba(230, 180, 34, 0.05)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: color,
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        display: true,
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const price = context.raw;
                                const label = context.label;
                                return [`💰 Ціна: $${price.toFixed(3)}`, `📅 ${label}`];
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
                        ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }
                    }
                }
            }
        });
        
        charts[canvasId] = chart;
        return chart;
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
            console.error('Supabase не инициализирован');
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
            
            // Загружаем баланс после успешной авторизации
            await updateCryptoPageBalance();
            
            return true;
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
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
                periodBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const period = this.dataset.period;
                const selectedPeriod = document.getElementById('selectedPeriod');
                if (selectedPeriod) {
                    selectedPeriod.textContent = periodNames[period] || period;
                }
                
                let volatility = 0.12;
                switch(period) {
                    case '1h': volatility = 0.05; break;
                    case '6h': volatility = 0.08; break;
                    case '12h': volatility = 0.10; break;
                    case '24h': volatility = 0.12; break;
                    case '7d': volatility = 0.15; break;
                    case '30d': volatility = 0.20; break;
                }
                
                const newData = generateChartData(currentPrice, 60, volatility);
                
                if (charts.mainChart) {
                    charts.mainChart.data.datasets[0].data = newData;
                    charts.mainChart.update();
                } else {
                    createChart('mainChart', newData, '#e6b422', `Курс $SCAM (${periodNames[period]})`);
                }
                
                const lastPrice = newData[newData.length - 1];
                const priceElement = document.getElementById('currentPrice');
                if (priceElement) {
                    priceElement.innerHTML = `<span class="scam-with-logo">$${lastPrice.toFixed(3)} <img src="лого.png" alt="лого"></span>`;
                }
            });
        });
    }
    
    async function init() {
        loadPriceHistory();
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
    
    // Хранилище графиков
    let charts = {};
    
    init();
});