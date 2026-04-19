document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initChart();
    loadSIPs();
});

// --- NAVIGATION ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .bnav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');

            // Update active states for tabs
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll(`[data-target="${target}"]`).forEach(n => n.classList.add('active'));

            // Show target page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`page-${target}`).classList.add('active');
        });
    });
}

// --- CHART.JS ---
let compareChartInstance = null;

function initChart() {
    const ctx = document.getElementById('compareChart').getContext('2d');
    
    // Mock 12-month data comparison
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const portfolioData = [100, 105, 108, 106, 112, 120, 118, 125, 130, 128, 135, 142]; // Growth
    const niftyData = [100, 102, 103, 101, 106, 109, 108, 110, 115, 114, 118, 121]; // Nifty benchmark

    compareChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Your Portfolio',
                    data: portfolioData,
                    borderColor: '#8b5cf6', // Primary Purple
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#8b5cf6',
                    fill: true,
                    tension: 0.4 // Smooth curve
                },
                {
                    label: 'NIFTY 50 (Benchmark)',
                    data: niftyData,
                    borderColor: '#9ca3af', // Gray
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f3f4f6', font: { family: 'Outfit', size: 12 } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // Animate stats
    animateValue("totalWealth", 0, 1420500, 1000, "₹ ");
    animateValue("totalReturns", 0, 42, 1000, "+", "%");
}

function animateValue(id, start, end, duration, prefix = "", suffix = "") {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = prefix + current.toLocaleString('en-IN') + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- CRYPTO WEEKLY SIP LOGIC ---
let sipData = [];

function loadSIPs() {
    const stored = localStorage.getItem('fw_sips');
    if (stored) {
        sipData = JSON.parse(stored);
    }
    renderSIPs();
}

function saveSIPs() {
    localStorage.setItem('fw_sips', JSON.stringify(sipData));
}

function addWeeklySIP() {
    const coin = document.getElementById('sipCoin').value;
    const amount = parseFloat(document.getElementById('sipAmount').value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const newSIP = {
        id: Date.now(),
        coin: coin,
        amount: amount,
        startDate: new Date().toISOString()
    };

    sipData.push(newSIP);
    saveSIPs();
    renderSIPs();
    
    document.getElementById('sipAmount').value = ''; // clear
}

function deleteSIP(id) {
    sipData = sipData.filter(s => s.id !== id);
    saveSIPs();
    renderSIPs();
}

function renderSIPs() {
    const list = document.getElementById('sipList');
    list.innerHTML = '';

    if(sipData.length === 0) {
        list.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px;">No weekly SIPs configured yet.</div>';
        return;
    }

    sipData.forEach(sip => {
        const start = new Date(sip.startDate);
        const weeksPassed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const estimatedInvested = sip.amount * (weeksPassed + 1);

        const card = document.createElement('div');
        card.style.background = 'rgba(255,255,255,0.02)';
        card.style.border = '1px solid var(--panel-border)';
        card.style.borderRadius = 'var(--radius-sm)';
        card.style.padding = '16px';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';

        card.innerHTML = `
            <div>
                <div style="font-weight: 500; font-size: 15px; color: var(--primary);">${sip.coin}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    ₹${sip.amount} / week • Started ${start.toLocaleDateString('en-IN')}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 15px; font-weight: 600;">Est: ₹${estimatedInvested.toLocaleString('en-IN')}</div>
                <button onclick="deleteSIP(${sip.id})" style="background:none; border:none; color: var(--danger); font-size: 12px; cursor: pointer; margin-top: 4px; text-decoration: underline;">Cancel SIP</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- AI CHAT LOGIC ---
const aiInput = document.getElementById('aiInput');
aiInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
    }
});

function sendMsg() {
    const val = aiInput.value.trim();
    if(!val) return;

    appendMsg(val, 'user');
    aiInput.value = '';

    setTimeout(() => {
        appendMsg('Analyzing your weekly SIPs and overall portfolio...', 'ai');
        setTimeout(() => {
            appendMsg('Based on your simulated chart, your portfolio (14.2L) is heavily outperforming NIFTY 50. Adding ' + val.substring(0, 15) + '... context: maintaining weekly SIPs is a very effective strategy against crypto volatility. Stay the course!', 'ai');
        }, 1500 + Math.random() * 1000);
    }, 500);
}

function appendMsg(text, sender) {
    const msgBox = document.createElement('div');
    msgBox.className = `msg ${sender}`;
    msgBox.innerText = text;
    
    const container = document.getElementById('aiMessages');
    container.appendChild(msgBox);
    container.scrollTop = container.scrollHeight;
}
