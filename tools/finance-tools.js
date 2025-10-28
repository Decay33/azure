// Finance Tools Implementation
// This file extends ToolsApp with finance calculator methods

// Mortgage Calculator
ToolsApp.getMortgageCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="loanAmount">Loan Amount ($)</label>
                <input type="number" id="loanAmount" value="300000" min="1000" step="1000">
            </div>
            
            <div class="form-group">
                <label for="interestRate">Annual Interest Rate (%)</label>
                <input type="number" id="interestRate" value="6.5" min="0" max="20" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="loanTerm">Loan Term (Years)</label>
                <select id="loanTerm">
                    <option value="15">15 years</option>
                    <option value="20">20 years</option>
                    <option value="25">25 years</option>
                    <option value="30" selected>30 years</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="propertyTax">Annual Property Tax ($)</label>
                <input type="number" id="propertyTax" value="3600" min="0" step="100">
            </div>
            
            <div class="form-group">
                <label for="homeInsurance">Annual Home Insurance ($)</label>
                <input type="number" id="homeInsurance" value="1200" min="0" step="50">
            </div>
            
            <div class="form-group">
                <label for="pmi">Monthly PMI ($)</label>
                <input type="number" id="pmi" value="200" min="0" step="10">
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.calculateMortgage()">Calculate Mortgage</button>
        </div>
        
        <div id="mortgageResults"></div>
    `;
};

ToolsApp.initMortgageCalculator = function() {
    // Auto-calculate on input change
    const inputs = ['loanAmount', 'interestRate', 'loanTerm', 'propertyTax', 'homeInsurance', 'pmi'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => this.calculateMortgage());
    });
    
    // Calculate initial values
    this.calculateMortgage();
};

ToolsApp.calculateMortgage = function() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const years = parseInt(document.getElementById('loanTerm').value) || 30;
    const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
    const insurance = parseFloat(document.getElementById('homeInsurance').value) || 0;
    const pmi = parseFloat(document.getElementById('pmi').value) || 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    
    // Calculate monthly principal and interest
    let monthlyPI = 0;
    if (monthlyRate > 0) {
        monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                   (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
        monthlyPI = loanAmount / totalPayments;
    }
    
    const monthlyTax = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + pmi;
    
    const totalInterest = (monthlyPI * totalPayments) - loanAmount;
    const totalCost = totalMonthlyPayment * totalPayments;
    
    const resultsHTML = `
        <div class="results">
            <h4>Mortgage Payment Breakdown</h4>
            <div class="result-item">
                <span class="result-label">Principal & Interest</span>
                <span class="result-value">${this.formatCurrency(monthlyPI)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Property Tax</span>
                <span class="result-value">${this.formatCurrency(monthlyTax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Home Insurance</span>
                <span class="result-value">${this.formatCurrency(monthlyInsurance)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">PMI</span>
                <span class="result-value">${this.formatCurrency(pmi)}</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Monthly Payment</span>
                <span class="result-value">${this.formatCurrency(totalMonthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Interest Paid</span>
                <span class="result-value">${this.formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Cost of Loan</span>
                <span class="result-value">${this.formatCurrency(totalCost)}</span>
            </div>
        </div>
    `;
    
    document.getElementById('mortgageResults').innerHTML = resultsHTML;
};

// Loan Calculator
ToolsApp.getLoanCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="loanAmountGeneral">Loan Amount ($)</label>
                <input type="number" id="loanAmountGeneral" value="25000" min="100" step="100">
            </div>
            
            <div class="form-group">
                <label for="loanInterestRate">Annual Interest Rate (%)</label>
                <input type="number" id="loanInterestRate" value="8.5" min="0" max="30" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="loanTermYears">Loan Term (Years)</label>
                <input type="number" id="loanTermYears" value="5" min="1" max="30" step="1">
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.calculateLoan()">Calculate Loan</button>
        </div>
        
        <div id="loanResults"></div>
        <div id="amortizationSchedule"></div>
    `;
};

ToolsApp.initLoanCalculator = function() {
    const inputs = ['loanAmountGeneral', 'loanInterestRate', 'loanTermYears'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => this.calculateLoan());
    });
    this.calculateLoan();
};

ToolsApp.calculateLoan = function() {
    const principal = parseFloat(document.getElementById('loanAmountGeneral').value) || 0;
    const annualRate = parseFloat(document.getElementById('loanInterestRate').value) || 0;
    const years = parseFloat(document.getElementById('loanTermYears').value) || 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
        monthlyPayment = principal / totalPayments;
    }
    
    const totalInterest = (monthlyPayment * totalPayments) - principal;
    const totalPaid = principal + totalInterest;
    
    // Generate amortization schedule
    let balance = principal;
    let scheduleHTML = `
        <div class="results mt-3">
            <h4>Amortization Schedule (First 12 Payments)</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Payment #</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Payment</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Principal</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Interest</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    for (let i = 1; i <= Math.min(12, totalPayments); i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        scheduleHTML += `
            <tr>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">${i}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(monthlyPayment)}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(principalPayment)}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(interestPayment)}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(balance)}</td>
            </tr>
        `;
    }
    
    scheduleHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    const resultsHTML = `
        <div class="results">
            <h4>Loan Summary</h4>
            <div class="result-item">
                <span class="result-label">Monthly Payment</span>
                <span class="result-value">${this.formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Interest</span>
                <span class="result-value">${this.formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Amount Paid</span>
                <span class="result-value">${this.formatCurrency(totalPaid)}</span>
            </div>
        </div>
    `;
    
    document.getElementById('loanResults').innerHTML = resultsHTML;
    document.getElementById('amortizationSchedule').innerHTML = scheduleHTML;
};

// Compound Interest Calculator
ToolsApp.getCompoundInterestHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="principal">Initial Investment ($)</label>
                <input type="number" id="principal" value="10000" min="1" step="100">
            </div>
            
            <div class="form-group">
                <label for="monthlyContribution">Monthly Contribution ($)</label>
                <input type="number" id="monthlyContribution" value="500" min="0" step="10">
            </div>
            
            <div class="form-group">
                <label for="annualRate">Annual Interest Rate (%)</label>
                <input type="number" id="annualRate" value="7" min="0" max="20" step="0.1">
            </div>
            
            <div class="form-group">
                <label for="compoundingFreq">Compounding Frequency</label>
                <select id="compoundingFreq">
                    <option value="1">Annually</option>
                    <option value="2">Semi-annually</option>
                    <option value="4">Quarterly</option>
                    <option value="12" selected>Monthly</option>
                    <option value="365">Daily</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="investmentYears">Investment Period (Years)</label>
                <input type="number" id="investmentYears" value="20" min="1" max="50" step="1">
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.calculateCompoundInterest()">Calculate Growth</button>
        </div>
        
        <div id="compoundResults"></div>
    `;
};

ToolsApp.initCompoundInterestCalculator = function() {
    const inputs = ['principal', 'monthlyContribution', 'annualRate', 'compoundingFreq', 'investmentYears'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => this.calculateCompoundInterest());
    });
    this.calculateCompoundInterest();
};

ToolsApp.calculateCompoundInterest = function() {
    const P = parseFloat(document.getElementById('principal').value) || 0;
    const PMT = parseFloat(document.getElementById('monthlyContribution').value) || 0;
    const r = parseFloat(document.getElementById('annualRate').value) / 100 || 0;
    const n = parseInt(document.getElementById('compoundingFreq').value) || 12;
    const t = parseFloat(document.getElementById('investmentYears').value) || 0;
    
    // Compound interest formula: A = P(1 + r/n)^(nt)
    const compoundAmount = P * Math.pow((1 + r/n), n * t);
    
    // Future value of annuity formula for monthly contributions
    const monthlyRate = r / 12;
    let annuityAmount = 0;
    if (monthlyRate > 0) {
        annuityAmount = PMT * (Math.pow(1 + monthlyRate, 12 * t) - 1) / monthlyRate;
    } else {
        annuityAmount = PMT * 12 * t;
    }
    
    const totalAmount = compoundAmount + annuityAmount;
    const totalContributions = P + (PMT * 12 * t);
    const totalInterest = totalAmount - totalContributions;
    
    // Generate yearly breakdown
    let yearlyData = [];
    for (let year = 1; year <= Math.min(10, t); year++) {
        const yearCompound = P * Math.pow((1 + r/n), n * year);
        let yearAnnuity = 0;
        if (monthlyRate > 0) {
            yearAnnuity = PMT * (Math.pow(1 + monthlyRate, 12 * year) - 1) / monthlyRate;
        } else {
            yearAnnuity = PMT * 12 * year;
        }
        const yearTotal = yearCompound + yearAnnuity;
        const yearContributions = P + (PMT * 12 * year);
        
        yearlyData.push({
            year: year,
            total: yearTotal,
            contributions: yearContributions,
            interest: yearTotal - yearContributions
        });
    }
    
    let breakdownHTML = `
        <div class="results mt-3">
            <h4>Year-by-Year Breakdown</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Year</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Total Value</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Contributions</th>
                            <th style="padding: 0.5rem; border: 1px solid #ddd;">Interest Earned</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    yearlyData.forEach(data => {
        breakdownHTML += `
            <tr>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">${data.year}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(data.total)}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(data.contributions)}</td>
                <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: right;">${this.formatCurrency(data.interest)}</td>
            </tr>
        `;
    });
    
    breakdownHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    const resultsHTML = `
        <div class="results">
            <h4>Investment Growth Summary</h4>
            <div class="result-item">
                <span class="result-label">Final Amount</span>
                <span class="result-value">${this.formatCurrency(totalAmount)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Contributions</span>
                <span class="result-value">${this.formatCurrency(totalContributions)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Interest Earned</span>
                <span class="result-value">${this.formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Effective Annual Return</span>
                <span class="result-value">${((totalAmount / totalContributions - 1) * 100 / t).toFixed(2)}%</span>
            </div>
        </div>
    `;
    
    document.getElementById('compoundResults').innerHTML = resultsHTML + breakdownHTML;
};

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
                <div class="debt-entry" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <input type="text" placeholder="Debt Name" class="debt-name" value="Credit Card 1">
                    <input type="number" placeholder="Balance" class="debt-balance" value="5000" min="0">
                    <input type="number" placeholder="Min Payment" class="debt-payment" value="100" min="0">
                    <input type="number" placeholder="Rate %" class="debt-rate" value="18.99" min="0" step="0.01">
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px;">×</button>
                </div>
                <div class="debt-entry" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <input type="text" placeholder="Debt Name" class="debt-name" value="Car Loan">
                    <input type="number" placeholder="Balance" class="debt-balance" value="15000" min="0">
                    <input type="number" placeholder="Min Payment" class="debt-payment" value="350" min="0">
                    <input type="number" placeholder="Rate %" class="debt-rate" value="4.5" min="0" step="0.01">
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px;">×</button>
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
    newEntry.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';
    newEntry.innerHTML = `
        <input type="text" placeholder="Debt Name" class="debt-name">
        <input type="number" placeholder="Balance" class="debt-balance" min="0">
        <input type="number" placeholder="Min Payment" class="debt-payment" min="0">
        <input type="number" placeholder="Rate %" class="debt-rate" min="0" step="0.01">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px;">×</button>
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
                rate: rate / 100 / 12
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
    
    // Simple payoff calculation
    let totalMinPayments = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    let totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    let totalInterest = 0;
    let months = 0;
    
    // Estimate payoff time and interest
    let remainingBalance = totalBalance;
    let monthlyPayment = totalMinPayments + extraPayment;
    
    while (remainingBalance > 0 && months < 600) {
        months++;
        let monthlyInterest = remainingBalance * 0.15 / 12; // Average rate estimate
        let principal = monthlyPayment - monthlyInterest;
        if (principal > remainingBalance) principal = remainingBalance;
        remainingBalance -= principal;
        totalInterest += monthlyInterest;
    }
    
    const resultsHTML = `
        <div class="results">
            <h4>Debt Payoff Plan (${method === 'snowball' ? 'Snowball' : 'Avalanche'} Method)</h4>
            <div class="result-item">
                <span class="result-label">Total Debt Balance</span>
                <span class="result-value">${this.formatCurrency(totalBalance)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Payment (Min + Extra)</span>
                <span class="result-value">${this.formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Estimated Payoff Time</span>
                <span class="result-value">${months} months (${Math.floor(months/12)} years, ${months%12} months)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Estimated Total Interest</span>
                <span class="result-value">${this.formatCurrency(totalInterest)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Recommended Payoff Order</h4>
            ${debts.map((debt, index) => `
                <div class="result-item">
                    <span class="result-label">${index + 1}. ${debt.name}</span>
                    <span class="result-value">${this.formatCurrency(debt.originalBalance)} @ ${(debt.rate * 12 * 100).toFixed(2)}%</span>
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
                </div>
                
                <div>
                    <h4 style="color: #e74c3c;">💳 Monthly Expenses</h4>
                    <div class="form-group">
                        <label for="housing">Housing (Rent/Mortgage)</label>
                        <input type="number" id="housing" value="1500" min="0" step="50">
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
                        <label for="otherExpenses">Other Expenses</label>
                        <input type="number" id="otherExpenses" value="500" min="0" step="25">
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <h4 style="color: #667eea;">💎 Monthly Savings</h4>
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

ToolsApp.calculateBudget = function() {
    const primaryIncome = parseFloat(document.getElementById('primaryIncome').value) || 0;
    const secondaryIncome = parseFloat(document.getElementById('secondaryIncome').value) || 0;
    const totalIncome = primaryIncome + secondaryIncome;
    
    const housing = parseFloat(document.getElementById('housing').value) || 0;
    const food = parseFloat(document.getElementById('food').value) || 0;
    const transportation = parseFloat(document.getElementById('transportation').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;
    const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 0;
    const retirement = parseFloat(document.getElementById('retirement').value) || 0;
    
    const totalExpenses = housing + food + transportation + otherExpenses;
    const totalSavings = emergencyFund + retirement;
    const remainingMoney = totalIncome - totalExpenses - totalSavings;
    
    const housingPercent = totalIncome > 0 ? (housing / totalIncome) * 100 : 0;
    const savingsPercent = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    
    let budgetHealth = 'Good';
    let healthColor = '#27ae60';
    
    if (remainingMoney < 0) {
        budgetHealth = 'Overspending';
        healthColor = '#e74c3c';
    } else if (remainingMoney < totalIncome * 0.05) {
        budgetHealth = 'Tight';
        healthColor = '#f39c12';
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
                <span class="result-label">Housing Percentage</span>
                <span class="result-value">${housingPercent.toFixed(1)}% ${housingPercent > 30 ? '(High - Should be <30%)' : '(Good)'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Savings Rate</span>
                <span class="result-value">${savingsPercent.toFixed(1)}% ${savingsPercent < 20 ? '(Consider 20%+)' : '(Excellent!)'}</span>
            </div>
        </div>
    `;
    
    document.getElementById('budgetResults').innerHTML = resultsHTML;
};

// Net Worth Tracker
ToolsApp.getNetWorthHTML = function() {
    return `
        <div class="calculator-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: #27ae60;">💰 Assets</h4>
                    <div class="form-group">
                        <label for="checking">Checking Accounts</label>
                        <input type="number" id="checking" value="5000" min="0" step="100" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="savings">Savings Accounts</label>
                        <input type="number" id="savings" value="15000" min="0" step="100" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="investments">Investments (401k, IRA, Stocks)</label>
                        <input type="number" id="investments" value="75000" min="0" step="1000" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="realEstate">Real Estate (Home Value)</label>
                        <input type="number" id="realEstate" value="300000" min="0" step="5000" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="vehicles">Vehicles</label>
                        <input type="number" id="vehicles" value="25000" min="0" step="1000" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="otherAssets">Other Assets</label>
                        <input type="number" id="otherAssets" value="10000" min="0" step="500" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #e74c3c;">💳 Liabilities</h4>
                    <div class="form-group">
                        <label for="mortgage">Mortgage Balance</label>
                        <input type="number" id="mortgage" value="250000" min="0" step="1000" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="carLoans">Car Loans</label>
                        <input type="number" id="carLoans" value="15000" min="0" step="500" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="creditCards">Credit Card Debt</label>
                        <input type="number" id="creditCards" value="8000" min="0" step="100" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="studentLoans">Student Loans</label>
                        <input type="number" id="studentLoans" value="35000" min="0" step="500" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                    <div class="form-group">
                        <label for="otherDebts">Other Debts</label>
                        <input type="number" id="otherDebts" value="5000" min="0" step="100" oninput="ToolsApp.calculateNetWorth()">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="netWorthResults"></div>
    `;
};

ToolsApp.calculateNetWorth = function() {
    const checking = parseFloat(document.getElementById('checking').value) || 0;
    const savings = parseFloat(document.getElementById('savings').value) || 0;
    const investments = parseFloat(document.getElementById('investments').value) || 0;
    const realEstate = parseFloat(document.getElementById('realEstate').value) || 0;
    const vehicles = parseFloat(document.getElementById('vehicles').value) || 0;
    const otherAssets = parseFloat(document.getElementById('otherAssets').value) || 0;
    
    const mortgage = parseFloat(document.getElementById('mortgage').value) || 0;
    const carLoans = parseFloat(document.getElementById('carLoans').value) || 0;
    const creditCards = parseFloat(document.getElementById('creditCards').value) || 0;
    const studentLoans = parseFloat(document.getElementById('studentLoans').value) || 0;
    const otherDebts = parseFloat(document.getElementById('otherDebts').value) || 0;
    
    const totalAssets = checking + savings + investments + realEstate + vehicles + otherAssets;
    const totalLiabilities = mortgage + carLoans + creditCards + studentLoans + otherDebts;
    const netWorth = totalAssets - totalLiabilities;
    
    const liquidAssets = checking + savings;
    const investmentAssets = investments;
    const physicalAssets = realEstate + vehicles + otherAssets;
    
    // Net worth analysis
    let analysis = [];
    let healthColor = '#27ae60';
    
    if (netWorth < 0) {
        analysis.push('⚠️ Negative net worth - Focus on debt reduction');
        healthColor = '#e74c3c';
    } else if (netWorth < 50000) {
        analysis.push('📈 Building wealth - Continue saving and investing');
        healthColor = '#f39c12';
    } else if (netWorth < 250000) {
        analysis.push('💪 Good progress - Consider diversifying investments');
        healthColor = '#27ae60';
    } else {
        analysis.push('🎉 Excellent net worth - Well on track for financial goals');
        healthColor = '#27ae60';
    }
    
    if (liquidAssets < totalLiabilities * 0.1) {
        analysis.push('💧 Consider building more liquid emergency funds');
    }
    
    if (creditCards > 10000) {
        analysis.push('💳 High credit card debt - Priority for payoff');
    }
    
    const resultsHTML = `
        <div class="results">
            <h4>Net Worth Summary</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600; font-size: 1.2rem;">
                <span class="result-label">Net Worth</span>
                <span class="result-value" style="color: ${healthColor};">${this.formatCurrency(netWorth)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Assets</span>
                <span class="result-value">${this.formatCurrency(totalAssets)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Liabilities</span>
                <span class="result-value">${this.formatCurrency(totalLiabilities)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Asset Breakdown</h4>
            <div class="result-item">
                <span class="result-label">Liquid Assets (Cash)</span>
                <span class="result-value">${this.formatCurrency(liquidAssets)} (${((liquidAssets/totalAssets)*100).toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Investment Assets</span>
                <span class="result-value">${this.formatCurrency(investmentAssets)} (${((investmentAssets/totalAssets)*100).toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Physical Assets</span>
                <span class="result-value">${this.formatCurrency(physicalAssets)} (${((physicalAssets/totalAssets)*100).toFixed(1)}%)</span>
            </div>
        </div>
        
        ${analysis.length > 0 ? `
        <div class="results mt-3">
            <h4>💡 Financial Health Analysis</h4>
            ${analysis.map(item => `<p style="margin: 0.5rem 0; color: #666;">• ${item}</p>`).join('')}
        </div>
        ` : ''}
    `;
    
    document.getElementById('netWorthResults').innerHTML = resultsHTML;
};

// Credit Card Payoff Calculator
ToolsApp.getCreditPayoffHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="cardBalance">Credit Card Balance ($)</label>
                <input type="number" id="cardBalance" value="5000" min="0" step="100" oninput="ToolsApp.calculateCreditPayoff()">
            </div>
            
            <div class="form-group">
                <label for="cardAPR">Annual Interest Rate (APR %)</label>
                <input type="number" id="cardAPR" value="18.99" min="0" max="30" step="0.01" oninput="ToolsApp.calculateCreditPayoff()">
            </div>
            
            <div class="form-group">
                <label for="minPayment">Minimum Monthly Payment ($)</label>
                <input type="number" id="minPayment" value="100" min="0" step="5" oninput="ToolsApp.calculateCreditPayoff()">
            </div>
            
            <div class="form-group">
                <label for="extraPayment">Extra Monthly Payment ($)</label>
                <input type="number" id="extraPayment" value="50" min="0" step="10" oninput="ToolsApp.calculateCreditPayoff()">
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="noNewCharges" checked> No new charges (recommended)
                </label>
            </div>
        </div>
        
        <div id="creditPayoffResults"></div>
    `;
};

ToolsApp.calculateCreditPayoff = function() {
    const balance = parseFloat(document.getElementById('cardBalance').value) || 0;
    const apr = parseFloat(document.getElementById('cardAPR').value) || 0;
    const minPayment = parseFloat(document.getElementById('minPayment').value) || 0;
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
    
    if (balance <= 0) {
        document.getElementById('creditPayoffResults').innerHTML = '<div class="results"><p style="color: #27ae60;">No balance to pay off! 🎉</p></div>';
        return;
    }
    
    const monthlyRate = apr / 100 / 12;
    const totalPayment = minPayment + extraPayment;
    
    // Calculate minimum payment scenario
    let minBalance = balance;
    let minMonths = 0;
    let minTotalInterest = 0;
    
    while (minBalance > 0 && minMonths < 600) { // Max 50 years
        minMonths++;
        const interestCharge = minBalance * monthlyRate;
        const principalPayment = Math.min(minPayment - interestCharge, minBalance);
        
        if (principalPayment <= 0) {
            minMonths = 999; // Never pays off
            break;
        }
        
        minBalance -= principalPayment;
        minTotalInterest += interestCharge;
    }
    
    // Calculate with extra payment scenario
    let extraBalance = balance;
    let extraMonths = 0;
    let extraTotalInterest = 0;
    
    while (extraBalance > 0 && extraMonths < 600) {
        extraMonths++;
        const interestCharge = extraBalance * monthlyRate;
        const principalPayment = Math.min(totalPayment - interestCharge, extraBalance);
        
        if (principalPayment <= 0) {
            extraMonths = 999;
            break;
        }
        
        extraBalance -= principalPayment;
        extraTotalInterest += interestCharge;
    }
    
    const interestSaved = minTotalInterest - extraTotalInterest;
    const timeSaved = minMonths - extraMonths;
    const totalPaidMin = balance + minTotalInterest;
    const totalPaidExtra = balance + extraTotalInterest;
    
    const resultsHTML = `
        <div class="results">
            <h4>Credit Card Payoff Comparison</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                    <h5 style="color: #e74c3c; margin-bottom: 1rem;">Minimum Payment Only</h5>
                    <div class="result-item">
                        <span class="result-label">Monthly Payment</span>
                        <span class="result-value">${this.formatCurrency(minPayment)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Payoff Time</span>
                        <span class="result-value">${minMonths < 999 ? `${minMonths} months (${Math.floor(minMonths/12)} years, ${minMonths%12} months)` : 'Never pays off!'}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Interest</span>
                        <span class="result-value">${this.formatCurrency(minTotalInterest)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Paid</span>
                        <span class="result-value">${this.formatCurrency(totalPaidMin)}</span>
                    </div>
                </div>
                
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 10px;">
                    <h5 style="color: #27ae60; margin-bottom: 1rem;">With Extra Payment</h5>
                    <div class="result-item">
                        <span class="result-label">Monthly Payment</span>
                        <span class="result-value">${this.formatCurrency(totalPayment)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Payoff Time</span>
                        <span class="result-value">${extraMonths < 999 ? `${extraMonths} months (${Math.floor(extraMonths/12)} years, ${extraMonths%12} months)` : 'Never pays off!'}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Interest</span>
                        <span class="result-value">${this.formatCurrency(extraTotalInterest)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Paid</span>
                        <span class="result-value">${this.formatCurrency(totalPaidExtra)}</span>
                    </div>
                </div>
            </div>
            
            ${extraPayment > 0 && extraMonths < 999 ? `
            <div style="background: #e8f4fd; padding: 1rem; border-radius: 10px; margin-top: 1rem;">
                <h5 style="color: #667eea; margin-bottom: 1rem;">💰 Savings with Extra Payment</h5>
                <div class="result-item">
                    <span class="result-label">Interest Saved</span>
                    <span class="result-value" style="color: #27ae60;">${this.formatCurrency(interestSaved)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Time Saved</span>
                    <span class="result-value" style="color: #27ae60;">${timeSaved} months (${Math.floor(timeSaved/12)} years, ${timeSaved%12} months)</span>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('creditPayoffResults').innerHTML = resultsHTML;
};

// Inflation Calculator
ToolsApp.getInflationCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="initialAmount">Initial Amount ($)</label>
                <input type="number" id="initialAmount" value="100" min="0" step="1" oninput="ToolsApp.calculateInflation()">
            </div>
            
            <div class="form-group">
                <label for="startYear">Start Year</label>
                <input type="number" id="startYear" value="1990" min="1900" max="2024" step="1" oninput="ToolsApp.calculateInflation()">
            </div>
            
            <div class="form-group">
                <label for="endYear">End Year</label>
                <input type="number" id="endYear" value="2024" min="1900" max="2024" step="1" oninput="ToolsApp.calculateInflation()">
            </div>
            
            <div class="form-group">
                <label for="inflationRate">Average Annual Inflation Rate (%)</label>
                <input type="number" id="inflationRate" value="2.5" min="0" max="20" step="0.1" oninput="ToolsApp.calculateInflation()">
                <small style="color: #666;">US historical average: ~2.5%</small>
            </div>
        </div>
        
        <div id="inflationResults"></div>
    `;
};

ToolsApp.calculateInflation = function() {
    const initialAmount = parseFloat(document.getElementById('initialAmount').value) || 0;
    const startYear = parseInt(document.getElementById('startYear').value) || 1990;
    const endYear = parseInt(document.getElementById('endYear').value) || 2024;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100 || 0.025;
    
    if (endYear <= startYear) {
        document.getElementById('inflationResults').innerHTML = '<div class="results"><p style="color: #e74c3c;">End year must be after start year.</p></div>';
        return;
    }
    
    const years = endYear - startYear;
    const futureValue = initialAmount * Math.pow(1 + inflationRate, years);
    const totalInflation = ((futureValue - initialAmount) / initialAmount) * 100;
    const purchasingPowerLoss = ((initialAmount - (initialAmount / Math.pow(1 + inflationRate, years))) / initialAmount) * 100;
    
    // Calculate what you'd need today to have the same purchasing power
    const equivalentToday = initialAmount / Math.pow(1 + inflationRate, years);
    
    // Example calculations for common scenarios
    const examples = [
        { item: 'Cup of Coffee', oldPrice: 1.25, newPrice: 1.25 * Math.pow(1 + inflationRate, years) },
        { item: 'Gallon of Gas', oldPrice: 1.25, newPrice: 1.25 * Math.pow(1 + inflationRate, years) },
        { item: 'Movie Ticket', oldPrice: 4.50, newPrice: 4.50 * Math.pow(1 + inflationRate, years) },
        { item: 'New Car (Average)', oldPrice: 16000, newPrice: 16000 * Math.pow(1 + inflationRate, years) }
    ];
    
    const resultsHTML = `
        <div class="results">
            <h4>Inflation Impact Analysis</h4>
            <div class="result-item">
                <span class="result-label">${this.formatCurrency(initialAmount)} in ${startYear}</span>
                <span class="result-value">= ${this.formatCurrency(futureValue)} in ${endYear}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Inflation</span>
                <span class="result-value">${totalInflation.toFixed(1)}% over ${years} years</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annual Inflation Rate Used</span>
                <span class="result-value">${(inflationRate * 100).toFixed(1)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Purchasing Power Loss</span>
                <span class="result-value" style="color: #e74c3c;">${purchasingPowerLoss.toFixed(1)}%</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>What This Means</h4>
            <div class="result-item">
                <span class="result-label">To buy what cost ${this.formatCurrency(initialAmount)} in ${startYear}</span>
                <span class="result-value">You need ${this.formatCurrency(futureValue)} in ${endYear}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${this.formatCurrency(initialAmount)} today has the buying power of</span>
                <span class="result-value">${this.formatCurrency(equivalentToday)} in ${startYear}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Price Examples (Estimated)</h4>
            ${examples.map(example => `
                <div class="result-item">
                    <span class="result-label">${example.item}</span>
                    <span class="result-value">${this.formatCurrency(example.oldPrice)} → ${this.formatCurrency(example.newPrice)}</span>
                </div>
            `).join('')}
            <small style="color: #666; display: block; margin-top: 1rem;">
                *Estimates based on ${(inflationRate * 100).toFixed(1)}% annual inflation. Actual prices may vary significantly.
            </small>
        </div>
    `;
    
    document.getElementById('inflationResults').innerHTML = resultsHTML;
}; 