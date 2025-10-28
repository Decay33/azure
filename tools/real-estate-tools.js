// Real Estate Tools Implementation

// Rent vs. Buy Analyzer
ToolsApp.getRentVsBuyHTML = function() {
    return `
        <div class="calculator-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: #667eea;">🏠 Buying</h4>
                    <div class="form-group">
                        <label for="homePrice">Home Price ($)</label>
                        <input type="number" id="homePrice" value="300000" min="50000" step="5000" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                    <div class="form-group">
                        <label for="downPayment">Down Payment (%)</label>
                        <input type="number" id="downPayment" value="20" min="5" max="50" step="1" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                    <div class="form-group">
                        <label for="mortgageRate">Mortgage Rate (%)</label>
                        <input type="number" id="mortgageRate" value="6.5" min="3" max="12" step="0.1" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                    <div class="form-group">
                        <label for="propertyTax">Property Tax (% annually)</label>
                        <input type="number" id="propertyTax" value="1.2" min="0" max="5" step="0.1" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #e74c3c;">🏘️ Renting</h4>
                    <div class="form-group">
                        <label for="monthlyRent">Monthly Rent ($)</label>
                        <input type="number" id="monthlyRent" value="2200" min="500" step="50" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                    <div class="form-group">
                        <label for="rentIncrease">Rent Increase (% annually)</label>
                        <input type="number" id="rentIncrease" value="3" min="0" max="10" step="0.1" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                    <div class="form-group">
                        <label for="timeHorizon">Time Horizon (Years)</label>
                        <input type="number" id="timeHorizon" value="7" min="1" max="20" step="1" oninput="ToolsApp.calculateRentVsBuy()">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="rentVsBuyResults"></div>
    `;
};

ToolsApp.calculateRentVsBuy = function() {
    const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
    const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) || 20;
    const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100 || 0.065;
    const propertyTax = parseFloat(document.getElementById('propertyTax').value) / 100 || 0.012;
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
    const rentIncrease = parseFloat(document.getElementById('rentIncrease').value) / 100 || 0.03;
    const timeHorizon = parseInt(document.getElementById('timeHorizon').value) || 7;
    
    // Calculate buying costs
    const downPaymentAmount = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPaymentAmount;
    const monthlyMortgageRate = mortgageRate / 12;
    const numPayments = 30 * 12;
    
    const monthlyMortgage = loanAmount * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, numPayments)) / 
                           (Math.pow(1 + monthlyMortgageRate, numPayments) - 1);
    
    const monthlyPropertyTax = (homePrice * propertyTax) / 12;
    const monthlyInsurance = homePrice * 0.004 / 12; // 0.4% annually
    const monthlyMaintenance = homePrice * 0.01 / 12; // 1% annually
    
    const totalMonthlyBuying = monthlyMortgage + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;
    
    // Calculate costs over time horizon
    let totalBuyingCosts = downPaymentAmount + (homePrice * 0.025); // Down payment + closing costs
    let totalRentingCosts = 0;
    let currentRent = monthlyRent;
    
    for (let year = 1; year <= timeHorizon; year++) {
        totalBuyingCosts += totalMonthlyBuying * 12;
        totalRentingCosts += currentRent * 12;
        currentRent *= (1 + rentIncrease);
    }
    
    // Home appreciation (assume 3% annually)
    const futureHomeValue = homePrice * Math.pow(1.03, timeHorizon);
    
    // Remaining mortgage balance
    const monthsElapsed = timeHorizon * 12;
    const remainingPayments = numPayments - monthsElapsed;
    let remainingBalance = 0;
    
    if (remainingPayments > 0) {
        remainingBalance = loanAmount * (Math.pow(1 + monthlyMortgageRate, numPayments) - Math.pow(1 + monthlyMortgageRate, monthsElapsed)) /
                          (Math.pow(1 + monthlyMortgageRate, numPayments) - 1);
    }
    
    const sellingCosts = futureHomeValue * 0.06; // 6% selling costs
    const netFromSale = futureHomeValue - remainingBalance - sellingCosts;
    const netBuyingCost = totalBuyingCosts - netFromSale;
    
    const difference = netBuyingCost - totalRentingCosts;
    const winner = difference < 0 ? 'Buying' : 'Renting';
    const savings = Math.abs(difference);
    
    const resultsHTML = `
        <div class="results">
            <h4>Rent vs. Buy Analysis (${timeHorizon} Years)</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">
                <div style="background: #e8f4fd; padding: 1rem; border-radius: 10px;">
                    <h5 style="color: #667eea;">🏠 Buying</h5>
                    <div class="result-item">
                        <span class="result-label">Monthly Payment</span>
                        <span class="result-value">${this.formatCurrency(totalMonthlyBuying)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Costs</span>
                        <span class="result-value">${this.formatCurrency(totalBuyingCosts)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Home Value</span>
                        <span class="result-value">${this.formatCurrency(futureHomeValue)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Net Cost</span>
                        <span class="result-value">${this.formatCurrency(netBuyingCost)}</span>
                    </div>
                </div>
                
                <div style="background: #fdf2e8; padding: 1rem; border-radius: 10px;">
                    <h5 style="color: #e67e22;">🏘️ Renting</h5>
                    <div class="result-item">
                        <span class="result-label">Starting Rent</span>
                        <span class="result-value">${this.formatCurrency(monthlyRent)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Final Rent</span>
                        <span class="result-value">${this.formatCurrency(currentRent / (1 + rentIncrease))}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Total Rent Paid</span>
                        <span class="result-value">${this.formatCurrency(totalRentingCosts)}</span>
                    </div>
                </div>
            </div>
            
            <div style="background: ${winner === 'Buying' ? '#e8f5e8' : '#fdf2e8'}; padding: 1.5rem; border-radius: 15px; text-align: center;">
                <h5 style="color: ${winner === 'Buying' ? '#27ae60' : '#e67e22'};">
                    🏆 ${winner} wins by ${this.formatCurrency(savings)}
                </h5>
            </div>
        </div>
    `;
    
    document.getElementById('rentVsBuyResults').innerHTML = resultsHTML;
};

// Property Tax Estimator
ToolsApp.getPropertyTaxHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="homeValue">Home Value ($)</label>
                <input type="number" id="homeValue" value="300000" min="50000" step="5000" oninput="ToolsApp.calculatePropertyTax()">
            </div>
            <div class="form-group">
                <label for="taxRate">Property Tax Rate (%)</label>
                <input type="number" id="taxRate" value="1.2" min="0" max="5" step="0.01" oninput="ToolsApp.calculatePropertyTax()">
            </div>
            <div class="form-group">
                <label for="exemptions">Exemptions ($)</label>
                <input type="number" id="exemptions" value="50000" min="0" step="1000" oninput="ToolsApp.calculatePropertyTax()">
            </div>
        </div>
        
        <div id="propertyTaxResults"></div>
    `;
};

ToolsApp.calculatePropertyTax = function() {
    const homeValue = parseFloat(document.getElementById('homeValue').value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;
    const exemptions = parseFloat(document.getElementById('exemptions').value) || 0;
    
    const taxableValue = Math.max(0, homeValue - exemptions);
    const annualTax = taxableValue * taxRate;
    const monthlyTax = annualTax / 12;
    
    document.getElementById('propertyTaxResults').innerHTML = `
        <div class="results">
            <h4>Property Tax Calculation</h4>
            <div class="result-item">
                <span class="result-label">Taxable Value</span>
                <span class="result-value">${this.formatCurrency(taxableValue)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annual Property Tax</span>
                <span class="result-value">${this.formatCurrency(annualTax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Property Tax</span>
                <span class="result-value">${this.formatCurrency(monthlyTax)}</span>
            </div>
        </div>
    `;
};

// Home Affordability Calculator
ToolsApp.getHomeAffordabilityHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="annualIncome">Annual Income ($)</label>
                <input type="number" id="annualIncome" value="75000" min="20000" step="1000" oninput="ToolsApp.calculateHomeAffordability()">
            </div>
            <div class="form-group">
                <label for="monthlyDebts">Monthly Debts ($)</label>
                <input type="number" id="monthlyDebts" value="500" min="0" step="50" oninput="ToolsApp.calculateHomeAffordability()">
            </div>
            <div class="form-group">
                <label for="downPaymentSaved">Down Payment Saved ($)</label>
                <input type="number" id="downPaymentSaved" value="60000" min="0" step="1000" oninput="ToolsApp.calculateHomeAffordability()">
            </div>
            <div class="form-group">
                <label for="interestRate">Interest Rate (%)</label>
                <input type="number" id="interestRate" value="6.5" min="3" max="12" step="0.1" oninput="ToolsApp.calculateHomeAffordability()">
            </div>
        </div>
        
        <div id="homeAffordabilityResults"></div>
    `;
};

ToolsApp.calculateHomeAffordability = function() {
    const annualIncome = parseFloat(document.getElementById('annualIncome').value) || 0;
    const monthlyDebts = parseFloat(document.getElementById('monthlyDebts').value) || 0;
    const downPaymentSaved = parseFloat(document.getElementById('downPaymentSaved').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0.065;
    
    const monthlyIncome = annualIncome / 12;
    const maxTotalDebt = monthlyIncome * 0.36; // 36% DTI ratio
    const maxHousingPayment = maxTotalDebt - monthlyDebts;
    
    // Calculate max home price based on payment capacity
    const monthlyRate = interestRate / 12;
    const numPayments = 30 * 12;
    
    // Estimate 80% of payment goes to P&I, 20% to taxes/insurance
    const maxPrincipalInterest = maxHousingPayment * 0.8;
    
    const maxLoanAmount = maxPrincipalInterest * (Math.pow(1 + monthlyRate, numPayments) - 1) /
                         (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    
    const maxHomePrice = maxLoanAmount + downPaymentSaved;
    const downPaymentPercent = (downPaymentSaved / maxHomePrice) * 100;
    
    document.getElementById('homeAffordabilityResults').innerHTML = `
        <div class="results">
            <h4>Home Affordability Analysis</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Maximum Home Price</span>
                <span class="result-value">${this.formatCurrency(maxHomePrice)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Down Payment</span>
                <span class="result-value">${this.formatCurrency(downPaymentSaved)} (${downPaymentPercent.toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Max Monthly Payment</span>
                <span class="result-value">${this.formatCurrency(maxHousingPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Income</span>
                <span class="result-value">${this.formatCurrency(monthlyIncome)}</span>
            </div>
        </div>
    `;
};

// Closing Costs Estimator
ToolsApp.getClosingCostsHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="purchasePrice">Purchase Price ($)</label>
                <input type="number" id="purchasePrice" value="300000" min="50000" step="5000" oninput="ToolsApp.calculateClosingCosts()">
            </div>
            <div class="form-group">
                <label for="loanAmount">Loan Amount ($)</label>
                <input type="number" id="loanAmount" value="240000" min="0" step="1000" oninput="ToolsApp.calculateClosingCosts()">
            </div>
            <div class="form-group">
                <label for="closingState">State</label>
                <select id="closingState" onchange="ToolsApp.calculateClosingCosts()">
                    <option value="average">National Average</option>
                    <option value="high">High-cost State</option>
                    <option value="low">Low-cost State</option>
                </select>
            </div>
        </div>
        
        <div id="closingCostsResults"></div>
    `;
};

ToolsApp.calculateClosingCosts = function() {
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const state = document.getElementById('closingState').value;
    
    // Base closing costs as percentage
    let closingCostPercent = 0.025; // 2.5% average
    
    switch(state) {
        case 'high':
            closingCostPercent = 0.035; // 3.5%
            break;
        case 'low':
            closingCostPercent = 0.02; // 2.0%
            break;
    }
    
    const totalClosingCosts = purchasePrice * closingCostPercent;
    
    // Breakdown
    const lenderFees = loanAmount * 0.005;
    const titleInsurance = purchasePrice * 0.005;
    const appraisal = 500;
    const inspection = 400;
    const attorneyFees = 800;
    const otherFees = totalClosingCosts - lenderFees - titleInsurance - appraisal - inspection - attorneyFees;
    
    document.getElementById('closingCostsResults').innerHTML = `
        <div class="results">
            <h4>Estimated Closing Costs</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Closing Costs</span>
                <span class="result-value">${this.formatCurrency(totalClosingCosts)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Percentage of Purchase Price</span>
                <span class="result-value">${(closingCostPercent * 100).toFixed(1)}%</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Closing Costs Breakdown</h4>
            <div class="result-item">
                <span class="result-label">Lender Fees</span>
                <span class="result-value">${this.formatCurrency(lenderFees)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Title Insurance</span>
                <span class="result-value">${this.formatCurrency(titleInsurance)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Appraisal</span>
                <span class="result-value">${this.formatCurrency(appraisal)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Home Inspection</span>
                <span class="result-value">${this.formatCurrency(inspection)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Attorney Fees</span>
                <span class="result-value">${this.formatCurrency(attorneyFees)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Other Fees</span>
                <span class="result-value">${this.formatCurrency(Math.max(0, otherFees))}</span>
            </div>
        </div>
    `;
}; 