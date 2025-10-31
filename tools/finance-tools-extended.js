// Extended Finance Tools Implementation

// Debt Snowball Tool
ToolsApp.getDebtSnowballHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label>Strategy Method</label>
                <select id="payoffMethod">
                    <option value="snowball">Debt Snowball (Lowest Balance First)</option>
                    <option value="avalanche">Debt Avalanche (Highest Interest First)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="extraPayment">Extra Monthly Payment ($)</label>
                <input type="number" id="extraPayment" value="100" min="0" step="10">
            </div>
            
            <div id="debtsList">
                <h4>Your Debts</h4>
                <div class="debt-entry">
                    <input type="text" placeholder="Debt Name" class="debt-name" value="Credit Card 1">
                    <input type="number" placeholder="Balance" class="debt-balance" value="5000" min="0">
                    <input type="number" placeholder="Min Payment" class="debt-payment" value="100" min="0">
                    <input type="number" placeholder="Interest Rate %" class="debt-rate" value="18.99" min="0" step="0.01">
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
                </div>
                <div class="debt-entry">
                    <input type="text" placeholder="Debt Name" class="debt-name" value="Car Loan">
                    <input type="number" placeholder="Balance" class="debt-balance" value="15000" min="0">
                    <input type="number" placeholder="Min Payment" class="debt-payment" value="350" min="0">
                    <input type="number" placeholder="Interest Rate %" class="debt-rate" value="4.5" min="0" step="0.01">
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary" onclick="ToolsApp.addDebtEntry()">Add Another Debt</button>
            <button type="button" class="btn" onclick="ToolsApp.calculateDebtPayoff()">Calculate Payoff Plan</button>
        </div>
        
        <div id="debtResults"></div>
    `;
};

ToolsApp.addDebtEntry = function() {
    const debtsList = document.getElementById('debtsList');
    const newEntry = document.createElement('div');
    newEntry.className = 'debt-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Debt Name" class="debt-name">
        <input type="number" placeholder="Balance" class="debt-balance" min="0">
        <input type="number" placeholder="Min Payment" class="debt-payment" min="0">
        <input type="number" placeholder="Interest Rate %" class="debt-rate" min="0" step="0.01">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    debtsList.appendChild(newEntry);
};

ToolsApp.calculateDebtPayoff = function() {
    const method = document.getElementById('payoffMethod').value;
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
    
    // Collect all debts
    const debtEntries = document.querySelectorAll('.debt-entry');
    let debts = [];
    
    debtEntries.forEach(entry => {
        const name = entry.querySelector('.debt-name').value || 'Unnamed Debt';
        const balance = parseFloat(entry.querySelector('.debt-balance').value) || 0;
        const minPayment = parseFloat(entry.querySelector('.debt-payment').value) || 0;
        const rate = parseFloat(entry.querySelector('.debt-rate').value) || 0;
        
        if (balance > 0) {
            debts.push({
                name: name,
                balance: balance,
                originalBalance: balance,
                minPayment: minPayment,
                rate: rate / 100 / 12, // Monthly rate
                totalPaid: 0,
                interestPaid: 0
            });
        }
    });
    
    if (debts.length === 0) {
        document.getElementById('debtResults').innerHTML = '<div class="results"><p style="color: #e74c3c;">Please add at least one debt.</p></div>';
        return;
    }
    
    // Sort debts based on method
    if (method === 'snowball') {
        debts.sort((a, b) => a.balance - b.balance);
    } else {
        debts.sort((a, b) => b.rate - a.rate);
    }
    
    // Calculate payoff
    let totalMinPayments = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    let availableExtra = extraPayment;
    let month = 0;
    let totalInterestSaved = 0;
    
    // Create a copy for comparison without extra payments
    let debtsNormal = JSON.parse(JSON.stringify(debts));
    
    while (debts.some(debt => debt.balance > 0) && month < 600) { // Max 50 years
        month++;
        
        // Apply payments
        for (let i = 0; i < debts.length; i++) {
            if (debts[i].balance <= 0) continue;
            
            let payment = debts[i].minPayment;
            
            // Add extra payment to first debt with balance
            if (i === 0 && availableExtra > 0) {
                payment += availableExtra;
            }
            
            // Don't pay more than the balance
            payment = Math.min(payment, debts[i].balance);
            
            let interestPayment = debts[i].balance * debts[i].rate;
            let principalPayment = payment - interestPayment;
            
            if (principalPayment < 0) principalPayment = payment; // Edge case
            
            debts[i].balance -= principalPayment;
            debts[i].totalPaid += payment;
            debts[i].interestPaid += interestPayment;
            
            if (debts[i].balance <= 0) {
                debts[i].balance = 0;
                // Move to next debt for extra payments
                debts.sort((a, b) => {
                    if (a.balance === 0 && b.balance === 0) return 0;
                    if (a.balance === 0) return 1;
                    if (b.balance === 0) return -1;
                    return method === 'snowball' ? a.balance - b.balance : b.rate - a.rate;
                });
            }
        }
    }
    
    let totalPaid = debts.reduce((sum, debt) => sum + debt.totalPaid, 0);
    let totalInterest = debts.reduce((sum, debt) => sum + debt.interestPaid, 0);
    let totalOriginalBalance = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
    
    // Calculate comparison without extra payments
    let monthsNormal = 0;
    while (debtsNormal.some(debt => debt.balance > 0) && monthsNormal < 600) {
        monthsNormal++;
        debtsNormal.forEach(debt => {
            if (debt.balance <= 0) return;
            let interestPayment = debt.balance * debt.rate;
            let principalPayment = debt.minPayment - interestPayment;
            if (principalPayment > 0) {
                debt.balance -= principalPayment;
                debt.interestPaid += interestPayment;
            }
            if (debt.balance < 0) debt.balance = 0;
        });
    }
    
    let normalInterest = debtsNormal.reduce((sum, debt) => sum + debt.interestPaid, 0);
    let interestSaved = normalInterest - totalInterest;
    let timeSaved = monthsNormal - month;
    
    const resultsHTML = `
        <div class="results">
            <h4>Debt Payoff Plan (${method === 'snowball' ? 'Snowball' : 'Avalanche'} Method)</h4>
            <div class="result-item">
                <span class="result-label">Time to Pay Off</span>
                <span class="result-value">${month} months (${Math.floor(month/12)} years, ${month%12} months)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Interest Paid</span>
                <span class="result-value">${this.formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Interest Saved vs. Minimum Payments</span>
                <span class="result-value" style="color: #27ae60;">${this.formatCurrency(interestSaved)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Time Saved vs. Minimum Payments</span>
                <span class="result-value" style="color: #27ae60;">${timeSaved} months</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Amount Paid</span>
                <span class="result-value">${this.formatCurrency(totalPaid)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Debt Payoff Order</h4>
            ${debts.map((debt, index) => `
                <div class="result-item">
                    <span class="result-label">${index + 1}. ${debt.name}</span>
                    <span class="result-value">Balance: ${this.formatCurrency(debt.originalBalance)} | Rate: ${(debt.rate * 12 * 100).toFixed(2)}%</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('debtResults').innerHTML = resultsHTML;
};

// Budget Planner
ToolsApp.getBudgetPlannerHTML = function() {
    return `
        <div class="calculator-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: #27ae60;">💰 Monthly Income</h4>
                    <div class="form-group">
                        <label for="primaryIncome">Primary Income (After Tax)</label>
                        <input type="number" id="primaryIncome" value="5000" min="0" step="100">
                    </div>
                    <div class="form-group">
                        <label for="secondaryIncome">Secondary Income</label>
                        <input type="number" id="secondaryIncome" value="0" min="0" step="100">
                    </div>
                    <div class="form-group">
                        <label for="otherIncome">Other Income</label>
                        <input type="number" id="otherIncome" value="0" min="0" step="100">
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #e74c3c;">💳 Monthly Expenses</h4>
                    <div class="form-group">
                        <label for="housing">Housing (Rent/Mortgage)</label>
                        <input type="number" id="housing" value="1500" min="0" step="50">
                    </div>
                    <div class="form-group">
                        <label for="utilities">Utilities</label>
                        <input type="number" id="utilities" value="200" min="0" step="25">
                    </div>
                    <div class="form-group">
                        <label for="food">Food & Groceries</label>
                        <input type="number" id="food" value="400" min="0" step="25">
                    </div>
                    <div class="form-group">
                        <label for="transportation">Transportation</label>
                        <input type="number" id="transportation" value="300" min="0" step="25">
                    </div>
                    <div class="form-group">
                        <label for="insurance">Insurance</label>
                        <input type="number" id="insurance" value="150" min="0" step="25">
                    </div>
                    <div class="form-group">
                        <label for="entertainment">Entertainment</label>
                        <input type="number" id="entertainment" value="200" min="0" step="25">
                    </div>
                    <div class="form-group">
                        <label for="otherExpenses">Other Expenses</label>
                        <input type="number" id="otherExpenses" value="150" min="0" step="25">
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <h4 style="color: #667eea;">💎 Savings Goals</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label for="emergencyFund">Emergency Fund</label>
                        <input type="number" id="emergencyFund" value="200" min="0" step="25">
                    </div>
                    <div>
                        <label for="retirement">Retirement</label>
                        <input type="number" id="retirement" value="400" min="0" step="25">
                    </div>
                </div>
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.calculateBudget()">Analyze Budget</button>
        </div>
        
        <div id="budgetResults"></div>
    `;
};

ToolsApp.initBudgetPlanner = function() {
    // Auto-calculate on input change
    const inputs = ['primaryIncome', 'secondaryIncome', 'otherIncome', 'housing', 'utilities', 'food', 'transportation', 'insurance', 'entertainment', 'otherExpenses', 'emergencyFund', 'retirement'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => this.calculateBudget());
    });
    this.calculateBudget();
};

ToolsApp.calculateBudget = function() {
    const primaryIncome = parseFloat(document.getElementById('primaryIncome').value) || 0;
    const secondaryIncome = parseFloat(document.getElementById('secondaryIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const totalIncome = primaryIncome + secondaryIncome + otherIncome;
    
    const housing = parseFloat(document.getElementById('housing').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const food = parseFloat(document.getElementById('food').value) || 0;
    const transportation = parseFloat(document.getElementById('transportation').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const entertainment = parseFloat(document.getElementById('entertainment').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;
    
    const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 0;
    const retirement = parseFloat(document.getElementById('retirement').value) || 0;
    
    const totalExpenses = housing + utilities + food + transportation + insurance + entertainment + otherExpenses;
    const totalSavings = emergencyFund + retirement;
    const totalSpending = totalExpenses + totalSavings;
    const remainingMoney = totalIncome - totalSpending;
    
    // Calculate percentages
    const housingPercent = totalIncome > 0 ? (housing / totalIncome) * 100 : 0;
    const savingsPercent = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    
    // Budget health analysis
    let budgetHealth = 'Good';
    let healthColor = '#27ae60';
    let recommendations = [];
    
    if (remainingMoney < 0) {
        budgetHealth = 'Overspending';
        healthColor = '#e74c3c';
        recommendations.push('You are spending more than you earn. Consider reducing expenses.');
    } else if (remainingMoney < totalIncome * 0.05) {
        budgetHealth = 'Tight';
        healthColor = '#f39c12';
        recommendations.push('Very little buffer. Consider building more savings.');
    }
    
    if (housingPercent > 30) {
        recommendations.push(`Housing costs are ${housingPercent.toFixed(1)}% of income. Ideally should be under 30%.`);
    }
    
    if (savingsPercent < 20) {
        recommendations.push(`Savings rate is ${savingsPercent.toFixed(1)}%. Try to save at least 20% of income.`);
    }
    
    if (emergencyFund < totalExpenses * 0.25) {
        recommendations.push('Consider increasing emergency fund to cover 3-6 months of expenses.');
    }
    
    const resultsHTML = `
        <div class="results">
            <h4>Budget Analysis</h4>
            <div class="result-item">
                <span class="result-label">Total Monthly Income</span>
                <span class="result-value">${this.formatCurrency(totalIncome)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Monthly Expenses</span>
                <span class="result-value">${this.formatCurrency(totalExpenses)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Monthly Savings</span>
                <span class="result-value">${this.formatCurrency(totalSavings)}</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Remaining Money</span>
                <span class="result-value" style="color: ${remainingMoney >= 0 ? '#27ae60' : '#e74c3c'};">${this.formatCurrency(remainingMoney)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Budget Health</span>
                <span class="result-value" style="color: ${healthColor};">${budgetHealth}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Savings Rate</span>
                <span class="result-value">${savingsPercent.toFixed(1)}%</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Expense Breakdown</h4>
            <div class="result-item">
                <span class="result-label">Housing</span>
                <span class="result-value">${this.formatCurrency(housing)} (${housingPercent.toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Food & Groceries</span>
                <span class="result-value">${this.formatCurrency(food)} (${((food/totalIncome)*100).toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Transportation</span>
                <span class="result-value">${this.formatCurrency(transportation)} (${((transportation/totalIncome)*100).toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Entertainment</span>
                <span class="result-value">${this.formatCurrency(entertainment)} (${((entertainment/totalIncome)*100).toFixed(1)}%)</span>
            </div>
        </div>
        
        ${recommendations.length > 0 ? `
        <div class="results mt-3">
            <h4>💡 Recommendations</h4>
            ${recommendations.map(rec => `<p style="margin: 0.5rem 0; color: #666;">• ${rec}</p>`).join('')}
        </div>
        ` : ''}
    `;
    
    document.getElementById('budgetResults').innerHTML = resultsHTML;
}; 