document.addEventListener('DOMContentLoaded', function() {
    function getDeterministicPrice(seedOffset) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();

        let seed = (year * 1000000) + (month * 50000) + (day * 2000) + (hour * 60) + minute + seedOffset;

        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        
        let r = seed;
        const results = [];
        
        for (let i = 0; i < 60; i++) {
            r = (a * r + c) % m;
            results.push(r / m);
        }
        return results;
    }

    function generateDataFromTime(basePrice, points, offset) {
        const randoms = getDeterministicPrice(offset);
        const data = [];
        let price = basePrice;

        for (let i = 0; i < points; i++) {
            const r = randoms[i];
            const change = (r - 0.49) * 0.1 * price;
            price = Math.max(5, price + change);
            
            if (r > 0.97) price *= 1.4;
            if (r < 0.03) price *= 0.7;

            data.push(Math.round(price * 100) / 100);
        }
        return data;
    }

    const chartData = {
        '1h': generateDataFromTime(42, 60, 100),
        '6h': generateDataFromTime(41, 60, 200),
        '12h': generateDataFromTime(40, 60, 300),
        '24h': generateDataFromTime(39, 60, 400),
        '7d': generateDataFromTime(35, 60, 500),
        '30d': generateDataFromTime(30, 60, 600)
    };

    function createChart(canvasId, data, color = '#e6b422', label = 'Курс $MishaCoin') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = Array(data.length).fill('');
        const firstPrice = data[0];
        const lastPrice = data[data.length - 1];
        const change = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
        
        const changeElement = document.getElementById(canvasId.replace('chart', 'change'));
        if (changeElement) {
            changeElement.textContent = (change > 0 ? '+' : '') + change + '%';
            changeElement.style.color = change < 0 ? '#ff6b6b' : '#a8e6cf';
        }

        return new Chart(ctx, {
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
                plugins: { legend: { display: canvasId === 'mainChart' } },
                scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
                    x: { display: canvasId === 'mainChart' }
                }
            }
        });
    }

    createChart('mainChart', chartData['24h'], '#e6b422', 'Курс $MishaCoin (24h)');
    createChart('chart1h', chartData['1h'], '#ff6b6b');
    createChart('chart6h', chartData['6h'], '#4ecdc4');
    createChart('chart24h', chartData['24h'], '#e6b422');
    createChart('chart7d', chartData['7d'], '#a8e6cf');

    const currentPrice = chartData['24h'][chartData['24h'].length - 1];
    document.getElementById('currentPrice').textContent = '$' + currentPrice.toFixed(2);

    const periodBtns = document.querySelectorAll('.chart-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const period = this.dataset.period;
            const newData = chartData[period];
            document.getElementById('currentPrice').textContent = '$' + newData[newData.length - 1].toFixed(2);
            Chart.getChart('mainChart')?.destroy();
            createChart('mainChart', newData, '#e6b422', `Курс $MishaCoin (${period})`);
        });
    });
});