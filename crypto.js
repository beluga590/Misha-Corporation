// crypto.js
document.addEventListener('DOMContentLoaded', function() {
    // Supabase конфигурация
    const SUPABASE_URL = 'https://ikoonalxzxseukvevyfu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_d9WXxn-H3c_ja_eUXD2ziA_bwSjIthl';
    
    let supabase = null;
    let currentUser = null;
    let currentPrice = 0.05;
    let totalSupply = 0; // Общее количество монет в обращении
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase инициализирован');
    } catch (error) {
        console.error('Ошибка инициализации Supabase:', error);
    }

    // Функция для получения общего количества монет у всех пользователей
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
            
            // Суммируем все балансы
            const total = data.reduce((sum, user) => {
                return sum + (parseFloat(user.scam_balance) || 0);
            }, 0);
            
            return total;
        } catch (error) {
            console.error('Ошибка расчета общего предложения:', error);
            return 0;
        }
    }
    
    // Расчет цены: 1 SCAM = +0.01 к курсу
    async function calculatePrice() {
        try {
            if (!supabase) return 0.05;
            
            totalSupply = await getTotalScamSupply();
            let price = 0.05 + (totalSupply * 0.01);
            
            return Math.round(price * 100000000) / 100000000;
        } catch (error) {
            console.error('Ошибка расчета цены:', error);
            return 0.05;
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
        
        const scamAmount = usdAmount / currentPrice;
        
        previewElement.innerHTML = `
            <div style="background: rgba(230, 180, 34, 0.1); border-left: 3px solid #e6b422; padding: 10px; margin-top: 10px; border-radius: 5px;">
                <div style="color: #a8e6cf; font-size: 14px;">📊 Попередній перегляд:</div>
                <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">
                    Ви отримаєте: <span style="color: #e6b422;">${scamAmount.toFixed(8)} $SCAM</span>
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                    За курсом: 1 $SCAM = $${currentPrice.toFixed(8)}
                </div>
            </div>
        `;
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
            <div style="background: rgba(230, 180, 34, 0.1); border-left: 3px solid #e6b422; padding: 10px; margin-top: 10px; border-radius: 5px;">
                <div style="color: #a8e6cf; font-size: 14px;">📊 Попередній перегляд:</div>
                <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">
                    Ви отримаєте: <span style="color: #e6b422;">$${usdAmount.toFixed(8)} USD</span>
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                    За курсом: 1 $SCAM = $${currentPrice.toFixed(8)}
                </div>
            </div>
        `;
    }
    
    // Генерация данных для графика
    function generateChartData(currentDbPrice, points, volatility) {
        const data = [];
        let price = Math.max(0.00000001, currentDbPrice * (1 - (volatility * 2)));
        
        for (let i = 0; i < points - 1; i++) {
            const change = (Math.random() - 0.5) * volatility * price;
            price = Math.max(0.00000001, price + change);
            
            const r = Math.random();
            if (r > 0.97) price *= 1.1;
            if (r < 0.03) price *= 0.9;
            
            data.push(price);
        }
        
        data.push(currentDbPrice);
        return data;
    }
    
    // Обновление баланса пользователя
    async function updateUserBalance() {
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
                
                const balanceElement = document.getElementById('userBalance');
                if (balanceElement) {
                    balanceElement.innerHTML = `<span class="scam-with-logo">${(data.scam_balance || 0).toFixed(8)} <img src="лого.png" alt="лого"></span>`;
                }
                
                const balanceUsdElement = document.getElementById('userBalanceUSD');
                if (balanceUsdElement) {
                    balanceUsdElement.textContent = '$' + ((data.scam_balance || 0) * currentPrice).toFixed(2);
                }
                
                const walletUserName = document.getElementById('walletUserName');
                if (walletUserName) {
                    walletUserName.textContent = data.first_name;
                }
                
                const walletUserBalance = document.getElementById('walletUserBalance');
                if (walletUserBalance) {
                    walletUserBalance.textContent = (data.scam_balance || 0).toFixed(8) + ' $SCAM';
                }
            }
        } catch (error) {
            console.error('Ошибка обновления баланса:', error);
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
        
        const amountToReceive = usdToSpend / currentPrice;
        
        if (amountToReceive <= 0) {
            const errorMsg = `❌ Сума занадто мала. Мінімальна сума: $0.00000001`;
            showTransactionResult('buyResult', errorMsg, 'error');
            return { success: false, message: errorMsg };
        }
        
        const finalCost = amountToReceive * currentPrice;
        const newUsdBalance = usdBalance - finalCost;
        const newScamBalance = (parseFloat(currentUser.scam_balance) || 0) + amountToReceive;
        
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
                    type: 'Купівля SCAM',
                    amount: amountToReceive,
                    currency: 'SCAM',
                    amount_usd: finalCost,
                    details: `Витрачено $${finalCost.toFixed(8)} на покупку ${amountToReceive.toFixed(8)} $SCAM (ціна: $${currentPrice.toFixed(8)})`
                }]);
            
            currentUser.balance = newUsdBalance;
            currentUser.scam_balance = newScamBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            await updateUserBalance();
            await updateAllStats();
            await updateLeaderboard();
            
            usdAmountInput.value = '';
            updateBuyPreview(); // Очищаем предпросмотр
            
            const successMsg = `✅ Успішно! Ви купили ${amountToReceive.toFixed(8)} $SCAM за $${finalCost.toFixed(8)}`;
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
            showTransactionResult('sellResult', '❌ Введіть додатнє число (можна дробове)', 'error');
            return { success: false, message: 'Неверное значение' };
        }
        
        if (!currentUser) {
            showAuthModal();
            return { success: false, message: '🔒 Необхідно авторизуватися для продажу' };
        }
        
        const scamBalance = parseFloat(currentUser.scam_balance) || 0;
        if (amount > scamBalance) {
            const errorMsg = `💰 Недостатньо $SCAM. Ваш баланс: ${scamBalance.toFixed(8)} $SCAM`;
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
                    details: `Продаж ${amount.toFixed(8)} $SCAM за $${usdAmount.toFixed(8)} (ціна: $${currentPrice.toFixed(8)})`
                }]);
            
            currentUser.balance = newUsdBalance;
            currentUser.scam_balance = newScamBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            await updateUserBalance();
            await updateAllStats();
            await updateLeaderboard();
            
            amountInput.value = '';
            updateSellPreview(); // Очищаем предпросмотр
            
            const successMsg = `✅ Успішно! Ви продали ${amount.toFixed(8)} $SCAM за $${usdAmount.toFixed(8)}`;
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
            }, 4000);
        }
    }
    
    // Обновление таблицы лидеров
    async function updateLeaderboard() {
        if (!supabase) {
            console.error('Supabase не инициализирован');
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name, scam_balance')
                .order('scam_balance', { ascending: false })
                .limit(10);
            
            if (error) {
                console.error('Ошибка загрузки лидеров:', error.message);
                return;
            }
            
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            for (let i = 0; i < 10; i++) {
                const user = data[i];
                const row = document.createElement('tr');
                
                if (user && user.scam_balance > 0) {
                    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    const balance = user.scam_balance.toFixed(8);
                    const status = user.scam_balance >= 1000000 ? 'Олігарх' : 'Інвестор';
                    
                    row.innerHTML = `
                        <th scope="row">${i + 1}</th>
                        <td>${escapeHtml(name)}</td>
                        <td>
                            <span class="scam-with-logo">
                                ${balance}
                                <img src="лого.png" alt="лого">
                            </span>
                        </td>
                        <td>${status}</td>
                    `;
                } else {
                    row.innerHTML = `
                        <th scope="row">${i + 1}</th>
                        <td>---</td>
                        <td>---</td>
                        <td>---</td>
                    `;
                }
                tbody.appendChild(row);
            }
            
            const totalSupplyElement = document.getElementById('totalSupply');
            if (totalSupplyElement && totalSupply > 0) {
                totalSupplyElement.innerHTML = `<span class="scam-with-logo">${totalSupply.toFixed(8)} <img src="лого.png" alt="лого"></span>`;
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
            currentPrice = await calculatePrice();
            
            const priceElement = document.getElementById('currentPrice');
            if (priceElement) {
                priceElement.innerHTML = `<span class="scam-with-logo">$${currentPrice.toFixed(8)} <img src="лого.png" alt="лого"></span>`;
            }
            
            const totalSupplyElement = document.getElementById('totalSupply');
            if (totalSupplyElement && totalSupply > 0) {
                totalSupplyElement.innerHTML = `<span class="scam-with-logo">${totalSupply.toFixed(8)} <img src="лого.png" alt="лого"></span>`;
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
            
            const chartData = {
                '1h': generateChartData(currentPrice, 60, 0.05),
                '6h': generateChartData(currentPrice, 60, 0.08),
                '12h': generateChartData(currentPrice, 60, 0.10),
                '24h': generateChartData(currentPrice, 60, 0.12),
                '7d': generateChartData(currentPrice, 60, 0.15),
                '30d': generateChartData(currentPrice, 60, 0.20)
            };
            
            updateAllCharts(chartData);
            
            // Обновляем предпросмотр при изменении цены
            updateBuyPreview();
            updateSellPreview();
            
            if (currentUser) {
                await updateUserBalance();
            }
            
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
        }
    }
    
    // Хранилище графиков
    let charts = {};
    
    function updateAllCharts(chartData) {
        if (charts.mainChart && chartData['24h']) {
            charts.mainChart.data.datasets[0].data = chartData['24h'];
            charts.mainChart.update();
        } else if (chartData['24h']) {
            createChart('mainChart', chartData['24h'], '#e6b422', 'Курс $SCAM (24h)');
        }
        
        if (charts.chart1h && chartData['1h']) {
            charts.chart1h.data.datasets[0].data = chartData['1h'];
            charts.chart1h.update();
        } else if (chartData['1h']) {
            createChart('chart1h', chartData['1h'], '#ff6b6b', '$SCAM 1H');
        }
        
        if (charts.chart6h && chartData['6h']) {
            charts.chart6h.data.datasets[0].data = chartData['6h'];
            charts.chart6h.update();
        } else if (chartData['6h']) {
            createChart('chart6h', chartData['6h'], '#4ecdc4', '$SCAM 6H');
        }
        
        if (charts.chart24h && chartData['24h']) {
            charts.chart24h.data.datasets[0].data = chartData['24h'];
            charts.chart24h.update();
        } else if (chartData['24h']) {
            createChart('chart24h', chartData['24h'], '#e6b422', '$SCAM 24H');
        }
        
        if (charts.chart7d && chartData['7d']) {
            charts.chart7d.data.datasets[0].data = chartData['7d'];
            charts.chart7d.update();
        } else if (chartData['7d']) {
            createChart('chart7d', chartData['7d'], '#a8e6cf', '$SCAM 7D');
        }
        
        if (chartData['24h'] && chartData['24h'].length > 0) {
            const firstPrice = chartData['24h'][0];
            const lastPrice = chartData['24h'][chartData['24h'].length - 1];
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
        
        updateMaxValues(chartData);
    }
    
    function updateMaxValues(chartData) {
        const periods = [
            { id: '1h', data: chartData['1h'], maxId: 'max1h', changeId: 'change1h' },
            { id: '6h', data: chartData['6h'], maxId: 'max6h', changeId: 'change6h' },
            { id: '24h', data: chartData['24h'], maxId: 'max24h', changeId: 'change24h' },
            { id: '7d', data: chartData['7d'], maxId: 'max7d', changeId: 'change7d' }
        ];
        
        periods.forEach(period => {
            if (period.data && period.data.length > 0) {
                const maxElement = document.getElementById(period.maxId);
                if (maxElement) {
                    const maxValue = Math.max(...period.data);
                    maxElement.textContent = maxValue.toFixed(8);
                }
                
                const changeElement = document.getElementById(period.changeId);
                if (changeElement) {
                    const first = period.data[0];
                    const last = period.data[period.data.length - 1];
                    const change = ((last - first) / first * 100).toFixed(2);
                    changeElement.textContent = (change > 0 ? '+' : '') + change + '%';
                    changeElement.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
                }
            }
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
                                return `$${context.raw.toFixed(8)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        ticks: { color: '#9ca3af', callback: function(value) { return '$' + value.toFixed(8); } }
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
    
    // Проверка авторизации
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
                    priceElement.innerHTML = `<span class="scam-with-logo">$${lastPrice.toFixed(8)} <img src="лого.png" alt="лого"></span>`;
                }
            });
        });
    }
    
    // Инициализация
    async function init() {
        await checkAuth();
        await updateAllStats();
        await updateLeaderboard();
        
        setupPeriodButtons();
        
        // Добавляем обработчики для предпросмотра
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
            "Курс $SCAM = 0.05 + (количество монет × 0.01)! Без обмежень!",
            "Можна купувати будь-яку кількість - навіть 0.00000001 монети! 💎",
            "Дивіться попередній перегляд перед покупкою! 👀",
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
    
    init();
});