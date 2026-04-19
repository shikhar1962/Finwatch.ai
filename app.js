document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initChart();
    loadSIPs();
    loadEquity();
    loadDebt();
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
    const portfolioData = [100, 105, 108, 106, 112, 120, 118, 125, 130, 128, 135, 142]; 
    const niftyData = [100, 102, 103, 101, 106, 109, 108, 110, 115, 114, 118, 121]; 

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
                    tension: 0.4 
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
                legend: { labels: { color: '#f3f4f6', font: { family: 'Outfit', size: 12 } } },
                tooltip: {
                    mode: 'index', intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleColor: '#fff', bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'Outfit' } } },
                y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af', font: { family: 'Outfit' } } }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });

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
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// --- EQUITY & MFS ---
let equityData = [];

function loadEquity() {
    const stored = localStorage.getItem('fw_equity');
    if (stored) equityData = JSON.parse(stored);
    renderEquity();
}

function saveEquity() {
    localStorage.setItem('fw_equity', JSON.stringify(equityData));
}

function addEquity() {
    const type = document.getElementById('eqType').value;
    const name = document.getElementById('eqName').value.trim();
    const inv = parseFloat(document.getElementById('eqInv').value);
    const val = parseFloat(document.getElementById('eqVal').value);

    if (!name || isNaN(inv) || isNaN(val)) { alert("Please fill all fields."); return; }

    equityData.push({ id: Date.now(), type, name, inv, val });
    saveEquity();
    renderEquity();
    
    document.getElementById('eqName').value = '';
    document.getElementById('eqInv').value = '';
    document.getElementById('eqVal').value = '';
}

function deleteEquity(id) {
    equityData = equityData.filter(item => item.id !== id);
    saveEquity();
    renderEquity();
}

function renderEquity() {
    const list = document.getElementById('equityList');
    list.innerHTML = '';
    if (equityData.length === 0) { list.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px;">No equity holdings added.</div>'; return; }

    equityData.forEach(eq => {
        const pnl = eq.val - eq.inv;
        const pct = ((pnl / eq.inv) * 100).toFixed(2);
        const isProfit = pnl >= 0;
        
        const card = document.createElement('div');
        card.style.background = 'rgba(255,255,255,0.02)';
        card.style.border = '1px solid var(--panel-border)';
        card.style.borderRadius = 'var(--radius-sm)';
        card.style.padding = '16px';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        
        card.innerHTML = `
            <div>
                <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase;">${eq.type}</div>
                <div style="font-weight: 500; font-size: 16px; color: white;">${eq.name}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Inv: ₹${eq.inv.toLocaleString('en-IN')}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 600;">₹${eq.val.toLocaleString('en-IN')}</div>
                <div style="font-size: 12px; font-weight: 500; color: ${isProfit ? 'var(--success)' : 'var(--danger)'};">
                    ${isProfit ? '+' : ''}₹${pnl.toLocaleString('en-IN')} (${isProfit ? '+' : ''}${pct}%)
                </div>
                <button onclick="deleteEquity(${eq.id})" style="background:none; border:none; color: var(--text-secondary); font-size: 11px; cursor: pointer; margin-top: 6px; text-decoration: underline;">Remove</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- DEBT & FIXED INCOME ---
let debtData = [];

function loadDebt() {
    const stored = localStorage.getItem('fw_debt');
    if (stored) debtData = JSON.parse(stored);
    renderDebt();
}

function saveDebt() {
    localStorage.setItem('fw_debt', JSON.stringify(debtData));
}

function addDebt() {
    const type = document.getElementById('dbType').value;
    const name = document.getElementById('dbName').value.trim();
    const val = parseFloat(document.getElementById('dbVal').value);
    const rate = parseFloat(document.getElementById('dbRate').value);

    if (!name || isNaN(val) || isNaN(rate)) { alert("Please fill all fields."); return; }

    debtData.push({ id: Date.now(), type, name, val, rate });
    saveDebt();
    renderDebt();
    
    document.getElementById('dbName').value = '';
    document.getElementById('dbVal').value = '';
    document.getElementById('dbRate').value = '';
}

function deleteDebt(id) {
    debtData = debtData.filter(item => item.id !== id);
    saveDebt();
    renderDebt();
}

function renderDebt() {
    const list = document.getElementById('debtList');
    list.innerHTML = '';
    if (debtData.length === 0) { list.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px;">No debt records added.</div>'; return; }

    debtData.forEach(db => {
        const isLiability = db.type.includes('Loan');
        const color = isLiability ? 'var(--warning)' : 'var(--primary)';

        const card = document.createElement('div');
        card.style.background = 'rgba(255,255,255,0.02)';
        card.style.border = '1px solid var(--panel-border)';
        card.style.borderRadius = 'var(--radius-sm)';
        card.style.padding = '16px';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        
        card.innerHTML = `
            <div>
                <div style="font-size: 11px; color: ${color}; text-transform: uppercase; font-weight: 600;">${db.type}</div>
                <div style="font-weight: 500; font-size: 16px; color: white;">${db.name}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Interest: ${db.rate}% p.a.</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 600;">₹${db.val.toLocaleString('en-IN')}</div>
                <button onclick="deleteDebt(${db.id})" style="background:none; border:none; color: var(--text-secondary); font-size: 11px; cursor: pointer; margin-top: 6px; text-decoration: underline;">Remove</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- CRYPTO WEEKLY SIP ---
let sipData = [];

function loadSIPs() {
    const stored = localStorage.getItem('fw_sips');
    if (stored) sipData = JSON.parse(stored);
    renderSIPs();
}

function saveSIPs() {
    localStorage.setItem('fw_sips', JSON.stringify(sipData));
}

function addWeeklySIP() {
    const coin = document.getElementById('sipCoin').value;
    const amount = parseFloat(document.getElementById('sipAmount').value);

    if (!amount || amount <= 0) { alert("Please enter a valid amount."); return; }

    sipData.push({ id: Date.now(), coin: coin, amount: amount, startDate: new Date().toISOString() });
    saveSIPs();
    renderSIPs();
    document.getElementById('sipAmount').value = ''; 
}

function deleteSIP(id) {
    sipData = sipData.filter(s => s.id !== id);
    saveSIPs();
    renderSIPs();
}

function renderSIPs() {
    const list = document.getElementById('sipList');
    list.innerHTML = '';
    if(sipData.length === 0) { list.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px;">No weekly SIPs configured.</div>'; return; }

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

        card.innerHTML = `
            <div>
                <div style="font-weight: 500; font-size: 15px; color: var(--primary);">${sip.coin}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">₹${sip.amount} / week • Started ${start.toLocaleDateString('en-IN')}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 15px; font-weight: 600;">Est Inv: ₹${estimatedInvested.toLocaleString('en-IN')}</div>
                <button onclick="deleteSIP(${sip.id})" style="background:none; border:none; color: var(--danger); font-size: 12px; cursor: pointer; margin-top: 4px; text-decoration: underline;">Cancel SIP</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- AI CHAT LOGIC ---
const aiInput = document.getElementById('aiInput');
aiInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
});

function sendMsg() {
    const val = aiInput.value.trim();
    if(!val) return;
    appendMsg(val, 'user');
    aiInput.value = '';
    setTimeout(() => {
        appendMsg('Analyzing your portfolio strategy...', 'ai');
        setTimeout(() => {
            appendMsg('Based on your latest inputs across Equity and Debt, your portfolio is gaining excellent traction. ' + val.substring(0, 15) + '... context: maintaining discipline in Indian Equities while hedging through weekly Crypto SIPs shows great diversification!', 'ai');
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
