/**
 * Scholaris - Financial OS Controller
 */

class ScholarisApp {
  constructor() {
    // Default Initial State
    this.state = {
      currency: 'NGN',
      theme: 'dark',
      semesterConfig: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] // +90 days default
      },
      funding: [
        { id: 'f1', title: 'Federal Tertiary Grant / Scholarship', category: 'Scholarship', amount: 150000, date: '2026-08-01', recurrence: 'Lump Sum' },
        { id: 'f2', title: 'Family Semester Allowance', category: 'Parental Support', amount: 50000, date: '2026-08-05', recurrence: 'Monthly' }
      ],
      expenses: [
        { id: 'e1', purpose: 'Printing & Books', category: 'Printing & Books', amount: 5000, date: '2026-08-12', priority: 'Need', note: 'CSC 301 Lab Manual + 30 pages' },
        { id: 'e2', purpose: 'Hostel Electricity & Generator Fuel', category: 'Hostel & Rent', amount: 12000, date: '2026-08-14', priority: 'Need', note: 'Shared off-campus power bill' },
        { id: 'e3', purpose: 'Weekly Grocery & Meal Supply', category: 'Food & Groceries', amount: 15000, date: '2026-08-15', priority: 'Important', note: 'Rice, noodles, snacks' },
        { id: 'e4', purpose: 'Campus Shuttle Pass', category: 'Transportation', amount: 4500, date: '2026-08-18', priority: 'Important', note: 'Monthly campus transit' },
        { id: 'e5', purpose: 'Weekend Movie & Pizza Outing', category: 'Entertainment & Outings', amount: 6500, date: '2026-08-22', priority: 'Want', note: 'Relaxation after mid-terms' }
      ],
      savingsGoals: [
        { id: 'g1', title: '💻 Developer Laptop Fund', target: 200000, current: 45000, targetDate: '2026-11-30' },
        { id: 'g2', title: '🛟 Emergency Campus Reserve', target: 30000, current: 15000, targetDate: '2026-12-15' }
      ],
      roommateSplits: [
        { id: 's1', title: 'Off-Campus WiFi Subscription (Fiber)', totalAmount: 18000, payer: 'Alex (You)', participants: ['Alex', 'Tunde', 'Chioma'], date: '2026-08-10' }
      ]
    };

    // Currency Symbols Lookup
    this.currencies = {
      NGN: { symbol: '₦', rate: 1 },
      USD: { symbol: '$', rate: 1 },
      EUR: { symbol: '€', rate: 1 },
      GBP: { symbol: '£', rate: 1 },
      CAD: { symbol: 'C$', rate: 1 },
      GHS: { symbol: '₵', rate: 1 },
      KES: { symbol: 'KSh ', rate: 1 }
    };

    this.categoryColors = {
      'Printing & Books': '#7c4dff',
      'Tuition & School Fees': '#3b82f6',
      'Food & Groceries': '#10b981',
      'Transportation': '#f59e0b',
      'Data & Airtime': '#ec4899',
      'Hostel & Rent': '#6366f1',
      'Health & Medical': '#ef4444',
      'Entertainment & Outings': '#8b5cf6',
      'Savings Deposit': '#14b8a6',
      'Other Expenses': '#94a3b8'
    };

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.applyTheme(this.state.theme);
    this.updateCurrencyUI();
    this.render();
  }

  // LocalStorage Persistence
  loadState() {
    const saved = localStorage.getItem('scholaris2_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error('Failed to parse stored state:', e);
      }
    }
  }

  saveState() {
    localStorage.setItem('scholaris2_data', JSON.stringify(this.state));
    this.render();
  }

  // Format Money helper
  formatMoney(amount) {
    const curr = this.currencies[this.state.currency] || this.currencies.NGN;
    return `${curr.symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  // Main Render Routine
  render() {
    this.renderMetrics();
    this.renderDailyRunway();
    this.renderHealthScore();
    this.renderExpenses();
    this.renderDonutChart();
    this.renderSavingsGoals();
    this.renderRoommateSplits();
    this.renderFunding();
    this.populateSemesterInputs();
  }

  // 1. Calculate Metrics
  getTotals() {
    const totalFunding = this.state.funding.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalExpenses = this.state.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalSaved = this.state.savingsGoals.reduce((sum, g) => sum + Number(g.current || 0), 0);
    const availableBalance = Math.max(totalFunding - totalExpenses - totalSaved, 0);

    const needs = this.state.expenses.filter(e => e.priority === 'Need').reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const wants = this.state.expenses.filter(e => e.priority === 'Want').reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const needsRatio = totalExpenses > 0 ? Math.round((needs / totalExpenses) * 100) : 0;
    const wantsRatio = totalExpenses > 0 ? Math.round((wants / totalExpenses) * 100) : 0;

    return { totalFunding, totalExpenses, totalSaved, availableBalance, needsRatio, wantsRatio };
  }

  renderMetrics() {
    const totals = this.getTotals();

    document.getElementById('metricTotalFunding').textContent = this.formatMoney(totals.totalFunding);
    document.getElementById('metricFundingCount').textContent = `${this.state.funding.length} active source(s)`;

    document.getElementById('metricAvailableBalance').textContent = this.formatMoney(totals.availableBalance);
    
    document.getElementById('metricTotalExpenses').textContent = this.formatMoney(totals.totalExpenses);
    document.getElementById('metricNeedsVsWants').textContent = `Needs: ${totals.needsRatio}% | Wants: ${totals.wantsRatio}%`;

    document.getElementById('metricTotalSavings').textContent = this.formatMoney(totals.totalSaved);
    document.getElementById('metricSavingsGoalsCount').textContent = `${this.state.savingsGoals.length} active goal(s)`;

    // Funding tab summary
    document.getElementById('fundingTotalInflow').textContent = this.formatMoney(totals.totalFunding);
    const scholarships = this.state.funding.filter(f => f.category === 'Scholarship').reduce((s, f) => s + Number(f.amount), 0);
    const loans = this.state.funding.filter(f => f.category === 'Student Loan' || f.category === 'Side Hustle / Job').reduce((s, f) => s + Number(f.amount), 0);
    const allowance = this.state.funding.filter(f => f.category === 'Parental Support' || f.category === 'Savings Transfer' || f.category === 'Other Income').reduce((s, f) => s + Number(f.amount), 0);

    document.getElementById('fundingScholarshipsVal').textContent = this.formatMoney(scholarships);
    document.getElementById('fundingLoansVal').textContent = this.formatMoney(loans);
    document.getElementById('fundingAllowanceVal').textContent = this.formatMoney(allowance);
  }

  // 2. Daily Runway Calculation
  renderDailyRunway() {
    const totals = this.getTotals();
    const today = new Date();
    const endDate = new Date(this.state.semesterConfig.endDate);
    
    // Days remaining
    const diffTime = endDate - today;
    const daysRemaining = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

    const dailyRunway = Math.round(totals.availableBalance / daysRemaining);

    document.getElementById('dailyRunwayValue').textContent = `${this.formatMoney(dailyRunway)} / day`;
    document.getElementById('daysRemainingText').textContent = `⏳ ${daysRemaining} days until semester end`;

    const runwayBarFill = document.getElementById('runwayBarFill');
    const runwayPill = document.getElementById('runwayPill');
    const daysTotalText = document.getElementById('daysTotalText');

    if (dailyRunway > 3000) {
      runwayPill.textContent = 'Healthy Pace';
      runwayPill.className = 'pill pill-want';
      daysTotalText.textContent = 'Status: Safe Spending Buffer';
      runwayBarFill.style.width = '85%';
      runwayBarFill.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
    } else if (dailyRunway >= 1000) {
      runwayPill.textContent = 'Moderate Pace';
      runwayPill.className = 'pill pill-important';
      daysTotalText.textContent = 'Status: Budget Lightly';
      runwayBarFill.style.width = '50%';
      runwayBarFill.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
    } else {
      runwayPill.textContent = 'Tight Pace';
      runwayPill.className = 'pill pill-need';
      daysTotalText.textContent = 'Status: Prioritize Needs Only';
      runwayBarFill.style.width = '20%';
      runwayBarFill.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
    }
  }

  // 3. Financial Health Score Engine
  renderHealthScore() {
    const totals = this.getTotals();
    let score = 50; // base score

    if (totals.availableBalance > 0) score += 20;
    if (totals.needsRatio <= 65) score += 15;
    if (totals.wantsRatio <= 25) score += 10;
    if (this.state.savingsGoals.length > 0) score += 5;

    score = Math.min(Math.max(score, 0), 100);

    document.getElementById('healthScoreNum').textContent = score;

    // Update SVG circumference (r = 42 -> 2 * PI * 42 = 263.89)
    const circle = document.getElementById('scoreCircle');
    const offset = 263.89 - (score / 100) * 263.89;
    circle.style.strokeDashoffset = offset;

    const gradeEl = document.getElementById('healthScoreGrade');
    const tipEl = document.getElementById('healthTipText');

    if (score >= 80) {
      gradeEl.textContent = 'Excellent Position!';
      gradeEl.style.color = 'var(--green)';
      circle.style.stroke = 'var(--green)';
      tipEl.textContent = 'Great discipline! Your needs & savings are well aligned.';
    } else if (score >= 60) {
      gradeEl.textContent = 'Good Position!';
      gradeEl.style.color = 'var(--purple-light)';
      circle.style.stroke = 'var(--purple-light)';
      tipEl.textContent = 'Solid balance. Keep wants under 20% to boost your score.';
    } else {
      gradeEl.textContent = 'Needs Attention';
      gradeEl.style.color = 'var(--red)';
      circle.style.stroke = 'var(--red)';
      tipEl.textContent = 'Warning: Expenses are eating into your safety buffer.';
    }
  }

  // 4. Render Expense Table & Filter
  renderExpenses() {
    const tbody = document.getElementById('expenseTableBody');
    const searchVal = document.getElementById('expenseSearchInput')?.value.toLowerCase() || '';
    const priorityVal = document.getElementById('expensePriorityFilter')?.value || 'ALL';

    const filtered = this.state.expenses.filter(e => {
      const matchSearch = e.purpose.toLowerCase().includes(searchVal) || (e.note || '').toLowerCase().includes(searchVal) || e.category.toLowerCase().includes(searchVal);
      const matchPriority = priorityVal === 'ALL' || e.priority === priorityVal;
      return matchSearch && matchPriority;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 24px;">No planned expenses match your filter.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(e => `
        <tr>
          <td>
            <div class="purpose-title">${e.purpose}</div>
            <div class="purpose-note">${e.note || 'No note added'}</div>
          </td>
          <td><span class="pill pill-purple">${e.category}</span></td>
          <td><strong class="text-primary">${this.formatMoney(e.amount)}</strong></td>
          <td class="text-muted">${e.date || 'Flexible'}</td>
          <td><span class="pill pill-${e.priority.toLowerCase()}">${e.priority}</span></td>
          <td>
            <button class="btn btn-outline-sm" onclick="app.deleteExpense('${e.id}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    }

    // Tip Banner
    const totals = this.getTotals();
    document.getElementById('expenseTipText').innerHTML = `You have <b>${this.formatMoney(totals.availableBalance)}</b> available balance with planned expenses of <b>${this.formatMoney(totals.totalExpenses)}</b>.`;
  }

  // 5. Interactive SVG Donut Chart
  renderDonutChart() {
    const svg = document.getElementById('donutSvg');
    const legend = document.getElementById('chartLegend');
    const totals = this.getTotals();

    document.getElementById('donutTotalText').textContent = this.formatMoney(totals.totalExpenses);

    // Group by category
    const catTotals = {};
    this.state.expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount);
    });

    const categories = Object.keys(catTotals);

    if (categories.length === 0 || totals.totalExpenses === 0) {
      svg.innerHTML = `<circle cx="60" cy="60" r="45" fill="none" stroke="var(--bg-input)" stroke-width="16" />`;
      legend.innerHTML = `<span class="text-muted">No expenses logged yet.</span>`;
      return;
    }

    let cumulativePercent = 0;
    let svgPaths = '';
    let legendHtml = '';

    categories.forEach(cat => {
      const amount = catTotals[cat];
      const percent = amount / totals.totalExpenses;
      const color = this.categoryColors[cat] || '#7c4dff';

      // Calculate SVG stroke slice
      const dashArray = 2 * Math.PI * 45; // r=45 -> circumference = 282.74
      const strokeDashoffset = dashArray * (1 - percent);
      const rotation = cumulativePercent * 360;

      svgPaths += `
        <circle cx="60" cy="60" r="45" fill="none" stroke="${color}" stroke-width="16"
          stroke-dasharray="${dashArray}" stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(${rotation - 90} 60 60)" />
      `;

      legendHtml += `
        <div class="legend-item">
          <span class="legend-dot" style="background:${color}"></span>
          <span>${cat} (${Math.round(percent * 100)}%)</span>
        </div>
      `;

      cumulativePercent += percent;
    });

    svg.innerHTML = svgPaths;
    legend.innerHTML = legendHtml;
  }

  // 6. Savings Goals Render
  renderSavingsGoals() {
    const dashList = document.getElementById('savingsGoalsList');
    const fullGrid = document.getElementById('allGoalsFullGrid');

    if (this.state.savingsGoals.length === 0) {
      const emptyMsg = `<p class="text-muted">No active savings goals. Create one to reserve funds!</p>`;
      if (dashList) dashList.innerHTML = emptyMsg;
      if (fullGrid) fullGrid.innerHTML = emptyMsg;
      return;
    }

    const html = this.state.savingsGoals.map(g => {
      const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
      return `
        <div class="goal-item">
          <div class="goal-header">
            <span>${g.title}</span>
            <span class="text-green">${percent}%</span>
          </div>
          <div class="goal-bar-wrap">
            <div class="goal-bar-fill" style="width: ${percent}%"></div>
          </div>
          <div class="goal-footer">
            <span>${this.formatMoney(g.current)} of ${this.formatMoney(g.target)}</span>
            <button class="btn btn-outline-sm" onclick="app.openDepositModal('${g.id}', '${g.title}')">＋ Deposit</button>
          </div>
        </div>
      `;
    }).join('');

    if (dashList) dashList.innerHTML = html;
    if (fullGrid) fullGrid.innerHTML = html;
  }

  // 7. Roommate & Peer Splits Render
  renderRoommateSplits() {
    const previewList = document.getElementById('splitsPreviewList');
    const allGrid = document.getElementById('allSplitsGrid');

    if (this.state.roommateSplits.length === 0) {
      const emptyMsg = `<p class="text-muted">No bill splits created. Click "+ Split Bill" to begin.</p>`;
      if (previewList) previewList.innerHTML = emptyMsg;
      if (allGrid) allGrid.innerHTML = emptyMsg;
      return;
    }

    const cardsHtml = this.state.roommateSplits.map(s => {
      const count = s.participants.length || 1;
      const share = Math.round(s.totalAmount / count);

      const memberRows = s.participants.map(p => `
        <div class="member-row">
          <span>👤 ${p}</span>
          <span class="text-purple">${this.formatMoney(share)}</span>
        </div>
      `).join('');

      return `
        <div class="card glass-card split-card">
          <div class="card-header-sm">
            <span>👥 ${s.title}</span>
            <span class="pill pill-purple">Total: ${this.formatMoney(s.totalAmount)}</span>
          </div>
          <p class="text-muted" style="font-size:12px">Paid by: <b>${s.payer}</b> | ${count} roommates splitting</p>
          <div class="split-members">
            ${memberRows}
          </div>
          <div style="display:flex; gap:10px; margin-top:6px;">
            <button class="btn btn-secondary btn-block" onclick="app.copySplitSummary('${s.id}')">📋 Copy Summary</button>
            <button class="btn btn-outline-sm" onclick="app.deleteSplit('${s.id}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    if (previewList) previewList.innerHTML = cardsHtml;
    if (allGrid) allGrid.innerHTML = cardsHtml;
  }

  // 8. Render Funding Table
  renderFunding() {
    const tbody = document.getElementById('fundingTableBody');
    if (!tbody) return;

    if (this.state.funding.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 24px;">No funding sources added yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.state.funding.map(f => `
      <tr>
        <td><strong>${f.title}</strong></td>
        <td><span class="pill pill-info">${f.category}</span></td>
        <td><strong class="text-green">${this.formatMoney(f.amount)}</strong></td>
        <td class="text-muted">${f.date}</td>
        <td>${f.recurrence}</td>
        <td>
          <button class="btn btn-outline-sm" onclick="app.deleteFunding('${f.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // Handlers & Actions
  handleQuickExpenseSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('expCategory').value;
    const amount = Number(document.getElementById('expAmount').value);
    const date = document.getElementById('expDate').value;
    const priority = document.getElementById('expPriority').value;
    const note = document.getElementById('expNote').value;

    const newExp = {
      id: 'e_' + Date.now(),
      purpose: category,
      category,
      amount,
      date,
      priority,
      note
    };

    this.state.expenses.unshift(newExp);
    this.saveState();
    this.toast('Expense added to your plan!');

    // Reset inputs
    document.getElementById('expAmount').value = '';
    document.getElementById('expNote').value = '';
  }

  handleAddExpenseSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('modalExpCategory').value;
    const amount = Number(document.getElementById('modalExpAmount').value);
    const date = document.getElementById('modalExpDate').value;
    const priority = document.getElementById('modalExpPriority').value;
    const note = document.getElementById('modalExpNote').value;

    const newExp = { id: 'e_' + Date.now(), purpose: category, category, amount, date, priority, note };
    this.state.expenses.unshift(newExp);
    this.saveState();
    this.closeModal('addExpenseModal');
    this.toast('Expense saved successfully!');
  }

  handleAddFundingSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('fundTitle').value;
    const category = document.getElementById('fundCategory').value;
    const amount = Number(document.getElementById('fundAmount').value);
    const date = document.getElementById('fundDate').value;
    const recurrence = document.getElementById('fundRecurrence').value;

    const newFund = { id: 'f_' + Date.now(), title, category, amount, date, recurrence };
    this.state.funding.unshift(newFund);
    this.saveState();
    this.closeModal('addFundingModal');
    this.toast('Funding source added!');
  }

  handleAddGoalSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('goalTitle').value;
    const target = Number(document.getElementById('goalTarget').value);
    const current = Number(document.getElementById('goalCurrent').value);
    const targetDate = document.getElementById('goalTargetDate').value;

    const newGoal = { id: 'g_' + Date.now(), title, target, current, targetDate };
    this.state.savingsGoals.unshift(newGoal);
    this.saveState();
    this.closeModal('addGoalModal');
    this.toast('New Savings Goal created!');
  }

  handleAddSplitSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('splitTitle').value;
    const totalAmount = Number(document.getElementById('splitTotalAmount').value);
    const payer = document.getElementById('splitPayer').value;
    const rawParts = document.getElementById('splitParticipants').value;

    const participants = rawParts.split(',').map(p => p.trim()).filter(Boolean);

    const newSplit = { id: 's_' + Date.now(), title, totalAmount, payer, participants, date: new Date().toISOString().split('T')[0] };
    this.state.roommateSplits.unshift(newSplit);
    this.saveState();
    this.closeModal('addSplitModal');
    this.toast('Roommate Bill Split created!');
  }

  handleDepositGoalSubmit(e) {
    e.preventDefault();
    const goalId = document.getElementById('depositGoalId').value;
    const amount = Number(document.getElementById('depositAmount').value);

    const goal = this.state.savingsGoals.find(g => g.id === goalId);
    if (goal) {
      goal.current += amount;
      this.saveState();
      this.closeModal('depositGoalModal');
      this.toast(`Deposited ${this.formatMoney(amount)} into ${goal.title}!`);
    }
  }

  handleSemesterConfig(e) {
    e.preventDefault();
    this.state.semesterConfig.startDate = document.getElementById('semStartDate').value;
    this.state.semesterConfig.endDate = document.getElementById('semEndDate').value;
    this.saveState();
    this.toast('Semester dates updated!');
  }

  deleteExpense(id) {
    this.state.expenses = this.state.expenses.filter(e => e.id !== id);
    this.saveState();
    this.toast('Expense removed.');
  }

  deleteFunding(id) {
    this.state.funding = this.state.funding.filter(f => f.id !== id);
    this.saveState();
    this.toast('Funding source removed.');
  }

  deleteSplit(id) {
    this.state.roommateSplits = this.state.roommateSplits.filter(s => s.id !== id);
    this.saveState();
    this.toast('Bill split removed.');
  }

  openDepositModal(goalId, goalTitle) {
    document.getElementById('depositGoalId').value = goalId;
    document.getElementById('depositGoalTitle').textContent = `Goal: ${goalTitle}`;
    document.getElementById('depositAmount').value = '';
    this.openModal('depositGoalModal');
  }

  copySplitSummary(splitId) {
    const split = this.state.roommateSplits.find(s => s.id === splitId);
    if (!split) return;
    const share = Math.round(split.totalAmount / split.participants.length);

    const text = `👥 *Scholaris Bill Split Summary*\n\n📌 Bill: ${split.title}\n💰 Total: ${this.formatMoney(split.totalAmount)}\n💳 Paid by: ${split.payer}\n\n👉 Each person owes: *${this.formatMoney(share)}*\nParticipants: ${split.participants.join(', ')}`;

    navigator.clipboard.writeText(text).then(() => {
      this.toast('Split summary copied to clipboard!');
    });
  }

  // AI Co-Pilot Advisor logic
  handleAiSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('aiInput');
    const query = input.value.trim();
    if (!query) return;

    this.addChatMessage(query, 'user');
    input.value = '';

    // Generate intelligent AI response based on student context
    setTimeout(() => {
      const response = this.generateAiResponse(query);
      this.addChatMessage(response, 'ai');
    }, 600);
  }

  sendPresetAiPrompt(promptText) {
    this.addChatMessage(promptText, 'user');
    setTimeout(() => {
      const response = this.generateAiResponse(promptText);
      this.addChatMessage(response, 'ai');
    }, 600);
  }

  addChatMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message msg-${sender}`;
    msgDiv.innerHTML = `
      <div class="msg-avatar">${sender === 'ai' ? '🤖' : '👨‍🎓'}</div>
      <div class="msg-bubble">${text}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  generateAiResponse(q) {
    const totals = this.getTotals();
    const query = q.toLowerCase();

    if (query.includes('20000') || query.includes('20,000') || query.includes('budget')) {
      return `For a ₦20,000 allowance over 4 weeks (₦5,000/week):\n\n1. **Essential Academics & Printing**: Set aside ₦4,000 upfront.\n2. **Weekly Meals & Food**: Allocate ₦9,000 (₦2,250/week).\n3. **Data & Transport Pass**: Allocate ₦4,000.\n4. **Savings Reserve**: Reserve the remaining ₦3,000 into your laptop/emergency goal!`;
    }
    if (query.includes('runway') || query.includes('pace')) {
      const today = new Date();
      const endDate = new Date(this.state.semesterConfig.endDate);
      const days = Math.max(Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)), 1);
      const daily = Math.round(totals.availableBalance / days);
      return `Your current available balance is **${this.formatMoney(totals.availableBalance)}** with **${days} days remaining** in the semester.\n\nYour safe daily runway is **${this.formatMoney(daily)} / day**. Keep non-essential spending below this limit!`;
    }
    if (query.includes('laptop') || query.includes('save')) {
      return `To hit your savings goal faster:\n1. Move 10% of any new funding directly into your goal upon receipt.\n2. Categorize optional outings as 'Wants' in your Scholaris planner.\n3. Split internet or generator costs with roommates using the Roommate Splitter!`;
    }
    if (query.includes('exam') || query.includes('emergency')) {
      return `During exam season, unexpected printing and late-night study snacks peak! We recommend keeping at least 15% of your available funds in an Emergency Reserve Goal to avoid stress during finals week.`;
    }

    return `Based on your logged data: You have **${this.formatMoney(totals.availableBalance)}** available balance. Your Needs account for ${totals.needsRatio}% of expenditures. I recommend keeping Wants below 20% to build a strong safety buffer!`;
  }

  // Setup Navigation, Modals & Themes
  setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Hamburger Mobile Menu
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
      document.getElementById('navMenu').classList.toggle('show');
    });

    // Theme Toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.state.theme);
      this.saveState();
    });

    // Currency Selector
    document.getElementById('currencySelector').addEventListener('change', (e) => {
      this.state.currency = e.target.value;
      this.updateCurrencyUI();
      this.saveState();
      this.toast(`Currency changed to ${this.state.currency}`);
    });

    // Set Default Dates in Forms
    const todayStr = new Date().toISOString().split('T')[0];
    if (document.getElementById('expDate')) document.getElementById('expDate').value = todayStr;
    if (document.getElementById('modalExpDate')) document.getElementById('modalExpDate').value = todayStr;
    if (document.getElementById('fundDate')) document.getElementById('fundDate').value = todayStr;
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active-view'));

    const activeLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    const activeView = document.getElementById(`view-${tabId}`);

    if (activeLink) activeLink.classList.add('active');
    if (activeView) activeView.classList.add('active-view');

    document.getElementById('navMenu').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggleBtn').querySelector('.theme-icon').textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  updateCurrencyUI() {
    const selector = document.getElementById('currencySelector');
    if (selector) selector.value = this.state.currency;

    const curr = this.currencies[this.state.currency] || this.currencies.NGN;
    document.querySelectorAll('.currency-symbol').forEach(el => {
      el.textContent = curr.symbol;
    });
  }

  populateSemesterInputs() {
    if (document.getElementById('semStartDate')) document.getElementById('semStartDate').value = this.state.semesterConfig.startDate;
    if (document.getElementById('semEndDate')) document.getElementById('semEndDate').value = this.state.semesterConfig.endDate;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  }

  toast(msg) {
    const container = document.getElementById('toastContainer');
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast';
    toastDiv.innerHTML = `<span>🎓</span><span>${msg}</span>`;
    container.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 2500);
  }

  scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  // Export Data CSV
  exportExpensesCSV() {
    const headers = ['Purpose', 'Category', 'Amount', 'Date', 'Priority', 'Note'];
    const rows = this.state.expenses.map(e => [e.purpose, e.category, e.amount, e.date, e.priority, `"${e.note || ''}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scholaris_expenses_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportFundingCSV() {
    const headers = ['Title', 'Category', 'Amount', 'Date', 'Recurrence'];
    const rows = this.state.funding.map(f => [f.title, f.category, f.amount, f.date, f.recurrence]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scholaris_funding_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  loadSampleDemoData() {
    localStorage.removeItem('scholaris2_data');
    location.reload();
  }

  clearAllData() {
    if (confirm('Are you sure you want to reset all Scholaris data?')) {
      this.state.funding = [];
      this.state.expenses = [];
      this.state.savingsGoals = [];
      this.state.roommateSplits = [];
      this.saveState();
      this.toast('All data reset successfully.');
    }
  }
}

// Global App Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new ScholarisApp();
});