// Business & Productivity Tools Implementation

// Break-Even Calculator
ToolsApp.getBreakEvenHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="fixedCosts">Fixed Costs (Monthly $)</label>
                <input type="number" id="fixedCosts" value="5000" min="0" step="100" oninput="ToolsApp.calculateBreakEven()">
                <small style="color: #666;">Rent, salaries, insurance, etc.</small>
            </div>
            
            <div class="form-group">
                <label for="pricePerUnit">Price per Unit ($)</label>
                <input type="number" id="pricePerUnit" value="25" min="0" step="0.01" oninput="ToolsApp.calculateBreakEven()">
            </div>
            
            <div class="form-group">
                <label for="variableCostPerUnit">Variable Cost per Unit ($)</label>
                <input type="number" id="variableCostPerUnit" value="10" min="0" step="0.01" oninput="ToolsApp.calculateBreakEven()">
                <small style="color: #666;">Materials, direct labor, etc.</small>
            </div>
        </div>
        
        <div id="breakEvenResults"></div>
    `;
};

ToolsApp.calculateBreakEven = function() {
    // Check if elements exist before proceeding
    const fixedCostsElement = document.getElementById('fixedCosts');
    const pricePerUnitElement = document.getElementById('pricePerUnit');
    const variableCostPerUnitElement = document.getElementById('variableCostPerUnit');
    const resultsElement = document.getElementById('breakEvenResults');
    
    if (!fixedCostsElement || !pricePerUnitElement || !variableCostPerUnitElement || !resultsElement) return;
    
    const fixedCosts = parseFloat(fixedCostsElement.value) || 0;
    const pricePerUnit = parseFloat(pricePerUnitElement.value) || 0;
    const variableCostPerUnit = parseFloat(variableCostPerUnitElement.value) || 0;
    
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    const contributionMarginPercent = pricePerUnit > 0 ? (contributionMargin / pricePerUnit) * 100 : 0;
    
    if (contributionMargin <= 0) {
        resultsElement.innerHTML = '<div class="results"><p style="color: #e74c3c;">⚠️ Price must be higher than variable cost per unit.</p></div>';
        return;
    }
    
    const breakEvenUnits = fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Break-Even Analysis</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Break-Even Units</span>
                <span class="result-value">${Math.ceil(breakEvenUnits).toLocaleString()} units</span>
            </div>
            <div class="result-item">
                <span class="result-label">Break-Even Revenue</span>
                <span class="result-value">${this.formatCurrency(breakEvenRevenue)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Contribution Margin</span>
                <span class="result-value">${this.formatCurrency(contributionMargin)} (${contributionMarginPercent.toFixed(1)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Fixed Costs</span>
                <span class="result-value">${this.formatCurrency(fixedCosts)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>💡 Business Insights</h4>
            <p style="color: #666; margin: 0.5rem 0;">• You need to sell ${Math.ceil(breakEvenUnits).toLocaleString()} units to cover all costs</p>
            <p style="color: #666; margin: 0.5rem 0;">• Each unit contributes ${this.formatCurrency(contributionMargin)} toward fixed costs</p>
            <p style="color: #666; margin: 0.5rem 0;">• After break-even, each additional unit adds ${this.formatCurrency(contributionMargin)} profit</p>
        </div>
    `;
};

// ROI Calculator
ToolsApp.getROICalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="initialInvestment">Initial Investment ($)</label>
                <input type="number" id="initialInvestment" value="10000" min="0" step="100" oninput="ToolsApp.calculateROI()">
            </div>
            
            <div class="form-group">
                <label for="finalValue">Final Value ($)</label>
                <input type="number" id="finalValue" value="15000" min="0" step="100" oninput="ToolsApp.calculateROI()">
            </div>
            
            <div class="form-group">
                <label for="timePeriod">Time Period</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="timePeriodValue" value="2" min="0" step="0.1" style="flex: 1;" oninput="ToolsApp.calculateROI()">
                    <select id="timePeriodUnit" style="flex: 1;" onchange="ToolsApp.calculateROI()">
                        <option value="years" selected>Years</option>
                        <option value="months">Months</option>
                        <option value="days">Days</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="additionalCosts">Additional Costs ($)</label>
                <input type="number" id="additionalCosts" value="500" min="0" step="50" oninput="ToolsApp.calculateROI()">
                <small style="color: #666;">Fees, maintenance, etc.</small>
            </div>
        </div>
        
        <div id="roiResults"></div>
    `;
};

ToolsApp.calculateROI = function() {
    // Check if elements exist before proceeding
    const initialInvestmentElement = document.getElementById('initialInvestment');
    const finalValueElement = document.getElementById('finalValue');
    const timePeriodValueElement = document.getElementById('timePeriodValue');
    const timePeriodUnitElement = document.getElementById('timePeriodUnit');
    const additionalCostsElement = document.getElementById('additionalCosts');
    const resultsElement = document.getElementById('roiResults');
    
    if (!initialInvestmentElement || !finalValueElement || !timePeriodValueElement || !timePeriodUnitElement || !additionalCostsElement || !resultsElement) return;
    
    const initialInvestment = parseFloat(initialInvestmentElement.value) || 0;
    const finalValue = parseFloat(finalValueElement.value) || 0;
    const timePeriodValue = parseFloat(timePeriodValueElement.value) || 0;
    const timePeriodUnit = timePeriodUnitElement.value;
    const additionalCosts = parseFloat(additionalCostsElement.value) || 0;
    
    const totalInvestment = initialInvestment + additionalCosts;
    const gain = finalValue - totalInvestment;
    const roiPercent = totalInvestment > 0 ? (gain / totalInvestment) * 100 : 0;
    
    // Convert time period to years for annualized calculation
    let timeInYears = timePeriodValue;
    switch(timePeriodUnit) {
        case 'months':
            timeInYears = timePeriodValue / 12;
            break;
        case 'days':
            timeInYears = timePeriodValue / 365;
            break;
    }
    
    const annualizedROI = timeInYears > 0 ? (Math.pow(finalValue / totalInvestment, 1 / timeInYears) - 1) * 100 : 0;
    
    let roiRating = '';
    let ratingColor = '';
    if (roiPercent < 0) {
        roiRating = 'Loss';
        ratingColor = '#e74c3c';
    } else if (roiPercent < 5) {
        roiRating = 'Low Return';
        ratingColor = '#f39c12';
    } else if (roiPercent < 15) {
        roiRating = 'Good Return';
        ratingColor = '#27ae60';
    } else {
        roiRating = 'Excellent Return';
        ratingColor = '#27ae60';
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>ROI Analysis</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Return on Investment</span>
                <span class="result-value" style="color: ${ratingColor};">${roiPercent.toFixed(2)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annualized ROI</span>
                <span class="result-value">${annualizedROI.toFixed(2)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Gain/Loss</span>
                <span class="result-value" style="color: ${gain >= 0 ? '#27ae60' : '#e74c3c'};">${this.formatCurrency(gain)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Investment</span>
                <span class="result-value">${this.formatCurrency(totalInvestment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Performance Rating</span>
                <span class="result-value" style="color: ${ratingColor};">${roiRating}</span>
            </div>
        </div>
    `;
};

// Sales Tax Calculator
ToolsApp.getSalesTaxHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="purchaseAmount">Purchase Amount ($)</label>
                <input type="number" id="purchaseAmount" value="100" min="0" step="0.01" oninput="ToolsApp.calculateSalesTax()">
            </div>
            
            <div class="form-group">
                <label for="salesTaxRate">Sales Tax Rate (%)</label>
                <input type="number" id="salesTaxRate" value="8.25" min="0" max="15" step="0.01" oninput="ToolsApp.calculateSalesTax()">
            </div>
            
            <div class="form-group">
                <label for="taxState">Quick Select State</label>
                <select id="taxState" onchange="ToolsApp.updateSalesTaxRate()">
                    <option value="">Select State...</option>
                    <option value="0">Delaware (0%)</option>
                    <option value="2.9">Colorado (2.9%)</option>
                    <option value="4">New York (4%)</option>
                    <option value="6">Florida (6%)</option>
                    <option value="6.25">Texas (6.25%)</option>
                    <option value="7.25">California (7.25%)</option>
                    <option value="8.25">Illinois (8.25%)</option>
                    <option value="9.45">Tennessee (9.45%)</option>
                </select>
                <small style="color: #666;">Base state rates (local taxes may apply)</small>
            </div>
        </div>
        
        <div id="salesTaxResults"></div>
    `;
};

ToolsApp.updateSalesTaxRate = function() {
    const taxStateElement = document.getElementById('taxState');
    const salesTaxRateElement = document.getElementById('salesTaxRate');
    
    if (!taxStateElement || !salesTaxRateElement) return;
    
    const selectedRate = taxStateElement.value;
    if (selectedRate !== '') {
        salesTaxRateElement.value = selectedRate;
        this.calculateSalesTax();
    }
};

ToolsApp.calculateSalesTax = function() {
    // Check if elements exist before proceeding
    const purchaseAmountElement = document.getElementById('purchaseAmount');
    const salesTaxRateElement = document.getElementById('salesTaxRate');
    const resultsElement = document.getElementById('salesTaxResults');
    
    if (!purchaseAmountElement || !salesTaxRateElement || !resultsElement) return;
    
    const purchaseAmount = parseFloat(purchaseAmountElement.value) || 0;
    const taxRate = parseFloat(salesTaxRateElement.value) / 100 || 0;
    
    const taxAmount = purchaseAmount * taxRate;
    const totalAmount = purchaseAmount + taxAmount;
    
    // Calculate what the pre-tax amount would be if user entered total with tax
    const preTaxAmount = purchaseAmount / (1 + taxRate);
    const impliedTax = purchaseAmount - preTaxAmount;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Sales Tax Calculation</h4>
            <div class="result-item">
                <span class="result-label">Purchase Amount</span>
                <span class="result-value">${this.formatCurrency(purchaseAmount)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Sales Tax (${(taxRate * 100).toFixed(2)}%)</span>
                <span class="result-value">${this.formatCurrency(taxAmount)}</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Amount</span>
                <span class="result-value">${this.formatCurrency(totalAmount)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Reverse Calculation</h4>
            <p style="color: #666; margin-bottom: 1rem;">If ${this.formatCurrency(purchaseAmount)} includes tax:</p>
            <div class="result-item">
                <span class="result-label">Pre-tax Amount</span>
                <span class="result-value">${this.formatCurrency(preTaxAmount)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Tax Included</span>
                <span class="result-value">${this.formatCurrency(impliedTax)}</span>
            </div>
        </div>
    `;
};

// Time Card Calculator
ToolsApp.getTimeCardHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="hourlyRate">Hourly Rate ($)</label>
                <input type="number" id="hourlyRate" value="15" min="0" step="0.25" oninput="ToolsApp.calculateTimeCard()">
            </div>
            
            <div class="form-group">
                <label for="overtimeRate">Overtime Multiplier</label>
                <input type="number" id="overtimeRate" value="1.5" min="1" max="3" step="0.1" oninput="ToolsApp.calculateTimeCard()">
                <small style="color: #666;">Usually 1.5x for hours over 40</small>
            </div>
            
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <h5>Daily Hours</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem;">
                    <div>
                        <label>Monday</label>
                        <input type="number" id="monday" value="8" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Tuesday</label>
                        <input type="number" id="tuesday" value="8" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Wednesday</label>
                        <input type="number" id="wednesday" value="8" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Thursday</label>
                        <input type="number" id="thursday" value="8" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Friday</label>
                        <input type="number" id="friday" value="8" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Saturday</label>
                        <input type="number" id="saturday" value="0" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                    <div>
                        <label>Sunday</label>
                        <input type="number" id="sunday" value="0" min="0" max="24" step="0.25" oninput="ToolsApp.calculateTimeCard()">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="timeCardResults"></div>
    `;
};

ToolsApp.calculateTimeCard = function() {
    // Check if elements exist before proceeding
    const hourlyRateElement = document.getElementById('hourlyRate');
    const overtimeRateElement = document.getElementById('overtimeRate');
    const resultsElement = document.getElementById('timeCardResults');
    
    if (!hourlyRateElement || !overtimeRateElement || !resultsElement) return;
    
    const hourlyRate = parseFloat(hourlyRateElement.value) || 0;
    const overtimeMultiplier = parseFloat(overtimeRateElement.value) || 1.5;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let totalHours = 0;
    let dailyBreakdown = [];
    
    days.forEach(day => {
        const dayElement = document.getElementById(day);
        const hours = dayElement ? parseFloat(dayElement.value) || 0 : 0;
        totalHours += hours;
        dailyBreakdown.push({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            hours: hours,
            pay: hours * hourlyRate
        });
    });
    
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);
    const overtimeRate = hourlyRate * overtimeMultiplier;
    
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * overtimeRate;
    const totalPay = regularPay + overtimePay;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Weekly Timecard Summary</h4>
            <div class="result-item">
                <span class="result-label">Total Hours</span>
                <span class="result-value">${totalHours.toFixed(2)} hours</span>
            </div>
            <div class="result-item">
                <span class="result-label">Regular Hours (${hourlyRate.toFixed(2)}/hr)</span>
                <span class="result-value">${regularHours.toFixed(2)} hours = ${this.formatCurrency(regularPay)}</span>
            </div>
            ${overtimeHours > 0 ? `
            <div class="result-item">
                <span class="result-label">Overtime Hours (${overtimeRate.toFixed(2)}/hr)</span>
                <span class="result-value">${overtimeHours.toFixed(2)} hours = ${this.formatCurrency(overtimePay)}</span>
            </div>
            ` : ''}
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Weekly Pay</span>
                <span class="result-value">${this.formatCurrency(totalPay)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Daily Breakdown</h4>
            ${dailyBreakdown.map(day => `
                <div class="result-item">
                    <span class="result-label">${day.day}</span>
                    <span class="result-value">${day.hours} hrs = ${this.formatCurrency(day.pay)}</span>
                </div>
            `).join('')}
        </div>
    `;
};

// Invoice Generator
ToolsApp.getInvoiceGeneratorHTML = function() {
    return `
        <div class="calculator-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h5>Business Information</h5>
                    <div class="form-group">
                        <label for="businessName">Business Name</label>
                        <input type="text" id="businessName" value="Your Business Name">
                    </div>
                    <div class="form-group">
                        <label for="businessAddress">Address</label>
                        <textarea id="businessAddress" rows="3">123 Business St\nCity, State 12345</textarea>
                    </div>
                </div>
                
                <div>
                    <h5>Client Information</h5>
                    <div class="form-group">
                        <label for="clientName">Client Name</label>
                        <input type="text" id="clientName" value="Client Company">
                    </div>
                    <div class="form-group">
                        <label for="clientAddress">Client Address</label>
                        <textarea id="clientAddress" rows="3">456 Client Ave\nCity, State 67890</textarea>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="invoiceNumber">Invoice Number</label>
                    <input type="text" id="invoiceNumber" value="INV-001">
                </div>
                <div class="form-group">
                    <label for="invoiceDate">Invoice Date</label>
                    <input type="date" id="invoiceDate">
                </div>
                <div class="form-group">
                    <label for="dueDate">Due Date</label>
                    <input type="date" id="dueDate">
                </div>
            </div>
            
            <div id="invoiceItems">
                <h5>Invoice Items</h5>
                <div class="invoice-item" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;">
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" class="item-description" value="Web Design Services">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" class="item-quantity" value="1" min="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Rate ($)</label>
                        <input type="number" class="item-rate" value="1500" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="text" class="item-amount" readonly style="background: #f8f9fa;">
                    </div>
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove(); ToolsApp.calculateInvoice();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary" onclick="ToolsApp.addInvoiceItem()">Add Item</button>
            <button type="button" class="btn" onclick="ToolsApp.generateInvoicePreview()">Generate Invoice</button>
        </div>
        
        <div id="invoiceResults"></div>
    `;
};

ToolsApp.addInvoiceItem = function() {
    const itemsContainer = document.getElementById('invoiceItems');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.style.cssText = 'display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Description</label>
            <input type="text" class="item-description">
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" class="item-quantity" value="1" min="0" step="0.1">
        </div>
        <div class="form-group">
            <label>Rate ($)</label>
            <input type="number" class="item-rate" value="0" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="text" class="item-amount" readonly style="background: #f8f9fa;">
        </div>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove(); ToolsApp.calculateInvoice();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
    `;
    itemsContainer.appendChild(newItem);
    ToolsApp.setupInvoiceCalculation();
};

ToolsApp.setupInvoiceCalculation = function() {
    // Add event listeners to all invoice items
    document.querySelectorAll('.item-quantity, .item-rate').forEach(input => {
        input.addEventListener('input', () => ToolsApp.calculateInvoice());
    });
    ToolsApp.calculateInvoice();
};

ToolsApp.calculateInvoice = function() {
    const items = document.querySelectorAll('.invoice-item');
    let subtotal = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const amount = quantity * rate;
        item.querySelector('.item-amount').value = this.formatCurrency(amount);
        subtotal += amount;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    // Update the preview if it exists
    if (document.getElementById('invoicePreview')) {
        ToolsApp.generateInvoicePreview();
    }
};

ToolsApp.generateInvoicePreview = function() {
    // Set default dates if empty
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    if (!document.getElementById('invoiceDate').value) {
        document.getElementById('invoiceDate').value = today;
    }
    if (!document.getElementById('dueDate').value) {
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    }
    
    // Calculate totals
    const items = document.querySelectorAll('.invoice-item');
    let subtotal = 0;
    let itemsHTML = '';
    
    items.forEach(item => {
        const description = item.querySelector('.item-description').value;
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const amount = quantity * rate;
        subtotal += amount;
        
        itemsHTML += `
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #ddd;">${description}</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: right;">${this.formatCurrency(rate)}</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: right;">${this.formatCurrency(amount)}</td>
            </tr>
        `;
    });
    
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    const invoiceHTML = `
        <div class="results" id="invoicePreview">
            <div style="background: white; padding: 2rem; border: 1px solid #ddd; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
                    <div>
                        <h2 style="margin: 0; color: #667eea;">INVOICE</h2>
                        <p style="margin: 0.5rem 0;"><strong>${document.getElementById('businessName').value}</strong></p>
                        <p style="margin: 0; white-space: pre-line;">${document.getElementById('businessAddress').value}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0.25rem 0;"><strong>Invoice #:</strong> ${document.getElementById('invoiceNumber').value}</p>
                        <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${document.getElementById('invoiceDate').value}</p>
                        <p style="margin: 0.25rem 0;"><strong>Due:</strong> ${document.getElementById('dueDate').value}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <p style="margin: 0;"><strong>Bill To:</strong></p>
                    <p style="margin: 0.5rem 0;"><strong>${document.getElementById('clientName').value}</strong></p>
                    <p style="margin: 0; white-space: pre-line;">${document.getElementById('clientAddress').value}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 0.75rem 0.5rem; border-bottom: 2px solid #ddd; text-align: left;">Description</th>
                            <th style="padding: 0.75rem 0.5rem; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                            <th style="padding: 0.75rem 0.5rem; border-bottom: 2px solid #ddd; text-align: right;">Rate</th>
                            <th style="padding: 0.75rem 0.5rem; border-bottom: 2px solid #ddd; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div style="display: flex; justify-content: flex-end;">
                    <div style="width: 300px;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
                            <span>Subtotal:</span>
                            <span>${this.formatCurrency(subtotal)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
                            <span>Tax (8%):</span>
                            <span>${this.formatCurrency(tax)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 3px solid #667eea; font-weight: bold; font-size: 1.2rem;">
                            <span>Total:</span>
                            <span>${this.formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="window.print()" class="btn">Print Invoice</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceResults').innerHTML = invoiceHTML;
    
    // Setup calculation for new items
    this.setupInvoiceCalculation();
};

// Currency Converter
ToolsApp.getCurrencyConverterHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="currencyAmount">Amount</label>
                <input type="number" id="currencyAmount" value="100" min="0" step="0.01" oninput="ToolsApp.convertCurrency()">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: end;">
                <div class="form-group">
                    <label for="fromCurrency">From</label>
                    <select id="fromCurrency" onchange="ToolsApp.convertCurrency()">
                        <option value="USD" selected>USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                </div>
                
                <button type="button" onclick="ToolsApp.swapCurrencies()" style="background: #667eea; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; margin-bottom: 1rem;">⇄</button>
                
                <div class="form-group">
                    <label for="toCurrency">To</label>
                    <select id="toCurrency" onchange="ToolsApp.convertCurrency()">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR" selected>EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                </div>
            </div>
            
            <div style="text-align: center; margin: 1rem 0;">
                <small style="color: #666;">Exchange rates are estimated and may not reflect current market rates</small>
            </div>
        </div>
        
        <div id="currencyResults"></div>
    `;
};

ToolsApp.swapCurrencies = function() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    if (!fromCurrency || !toCurrency) return;
    
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    this.convertCurrency();
};

ToolsApp.convertCurrency = function() {
    // Check if elements exist before proceeding
    const amountElement = document.getElementById('currencyAmount');
    const fromCurrencyElement = document.getElementById('fromCurrency');
    const toCurrencyElement = document.getElementById('toCurrency');
    const resultsElement = document.getElementById('currencyResults');
    
    if (!amountElement || !fromCurrencyElement || !toCurrencyElement || !resultsElement) return;
    
    const amount = parseFloat(amountElement.value) || 0;
    const fromCurrency = fromCurrencyElement.value;
    const toCurrency = toCurrencyElement.value;
    
    // Static exchange rates (in real app, would fetch from API)
    const exchangeRates = {
        'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'CAD': 1.25, 'AUD': 1.35, 'CHF': 0.92, 'CNY': 6.45 },
        'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 129, 'CAD': 1.47, 'AUD': 1.59, 'CHF': 1.08, 'CNY': 7.59 },
        'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 150, 'CAD': 1.71, 'AUD': 1.85, 'CHF': 1.26, 'CNY': 8.84 },
        'JPY': { 'USD': 0.0091, 'EUR': 0.0077, 'GBP': 0.0067, 'CAD': 0.011, 'AUD': 0.012, 'CHF': 0.0084, 'CNY': 0.059 },
        'CAD': { 'USD': 0.80, 'EUR': 0.68, 'GBP': 0.58, 'JPY': 88, 'AUD': 1.08, 'CHF': 0.74, 'CNY': 5.16 },
        'AUD': { 'USD': 0.74, 'EUR': 0.63, 'GBP': 0.54, 'JPY': 81, 'CAD': 0.93, 'CHF': 0.68, 'CNY': 4.78 },
        'CHF': { 'USD': 1.09, 'EUR': 0.93, 'GBP': 0.79, 'JPY': 120, 'CAD': 1.36, 'AUD': 1.47, 'CNY': 7.02 },
        'CNY': { 'USD': 0.155, 'EUR': 0.132, 'GBP': 0.113, 'JPY': 17.05, 'CAD': 0.194, 'AUD': 0.209, 'CHF': 0.142 }
    };
    
    let convertedAmount = amount;
    let rate = 1;
    
    if (fromCurrency !== toCurrency) {
        rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
        convertedAmount = amount * rate;
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Currency Conversion</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600; font-size: 1.2rem;">
                <span class="result-label">${amount.toFixed(2)} ${fromCurrency}</span>
                <span class="result-value">${convertedAmount.toFixed(2)} ${toCurrency}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Exchange Rate</span>
                <span class="result-value">1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Reverse Rate</span>
                <span class="result-value">1 ${toCurrency} = ${(1/rate).toFixed(4)} ${fromCurrency}</span>
            </div>
        </div>
    `;
}; 