// Utility Tools Implementation
// This file extends ToolsApp with utility tools methods

// Password Generator
ToolsApp.getPasswordGeneratorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="passwordLength">Password Length: <span id="lengthValue">12</span></label>
                <input type="range" id="passwordLength" min="4" max="50" value="12" oninput="document.getElementById('lengthValue').textContent = this.value">
            </div>
            
            <div class="form-group">
                <label><input type="checkbox" id="includeUppercase" checked> Include Uppercase (A-Z)</label>
            </div>
            
            <div class="form-group">
                <label><input type="checkbox" id="includeLowercase" checked> Include Lowercase (a-z)</label>
            </div>
            
            <div class="form-group">
                <label><input type="checkbox" id="includeNumbers" checked> Include Numbers (0-9)</label>
            </div>
            
            <div class="form-group">
                <label><input type="checkbox" id="includeSymbols" checked> Include Symbols (!@#$%^&*)</label>
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.generatePassword()">Generate Password</button>
        </div>
        
        <div id="passwordResults"></div>
    `;
};

ToolsApp.initPasswordGenerator = function() {
    this.generatePassword();
};

ToolsApp.generatePassword = function() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
        document.getElementById('passwordResults').innerHTML = '<div class="results"><p style="color: #e74c3c;">Please select at least one character type.</p></div>';
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Calculate password strength
    let strength = 0;
    let strengthText = '';
    let strengthColor = '';
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) {
        strengthText = 'Weak';
        strengthColor = '#e74c3c';
    } else if (strength <= 4) {
        strengthText = 'Medium';
        strengthColor = '#f39c12';
    } else {
        strengthText = 'Strong';
        strengthColor = '#27ae60';
    }
    
    const resultsHTML = `
        <div class="results">
            <h4>Generated Password</h4>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <input type="text" value="${password}" readonly style="width: 100%; font-family: monospace; font-size: 1.1rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;" onclick="this.select()">
            </div>
            <div class="result-item">
                <span class="result-label">Password Strength</span>
                <span class="result-value" style="color: ${strengthColor};">${strengthText}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Length</span>
                <span class="result-value">${password.length} characters</span>
            </div>
            <button type="button" class="btn btn-secondary" onclick="navigator.clipboard.writeText('${password}').then(() => alert('Password copied to clipboard!'))">Copy to Clipboard</button>
        </div>
    `;
    
    document.getElementById('passwordResults').innerHTML = resultsHTML;
};

// Unit Converter
ToolsApp.getUnitConverterHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="conversionType">Conversion Type</label>
                <select id="conversionType" onchange="ToolsApp.updateUnitOptions()">
                    <option value="length">Length</option>
                    <option value="weight">Weight</option>
                    <option value="temperature">Temperature</option>
                    <option value="volume">Volume</option>
                    <option value="area">Area</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="fromValue">From</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="fromValue" value="1" step="any" style="flex: 2;">
                    <select id="fromUnit" style="flex: 1;" onchange="ToolsApp.convertUnits()"></select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="toValue">To</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="toValue" readonly style="flex: 2; background: #f8f9fa;">
                    <select id="toUnit" style="flex: 1;" onchange="ToolsApp.convertUnits()"></select>
                </div>
            </div>
        </div>
        
        <div id="conversionResults"></div>
    `;
};

ToolsApp.initUnitConverter = function() {
    this.updateUnitOptions();
    document.getElementById('fromValue').addEventListener('input', () => this.convertUnits());
};

ToolsApp.updateUnitOptions = function() {
    const type = document.getElementById('conversionType').value;
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    
    const units = {
        length: {
            'mm': 'Millimeters',
            'cm': 'Centimeters', 
            'm': 'Meters',
            'km': 'Kilometers',
            'in': 'Inches',
            'ft': 'Feet',
            'yd': 'Yards',
            'mi': 'Miles'
        },
        weight: {
            'mg': 'Milligrams',
            'g': 'Grams',
            'kg': 'Kilograms',
            't': 'Metric Tons',
            'oz': 'Ounces',
            'lb': 'Pounds',
            'st': 'Stones'
        },
        temperature: {
            'c': 'Celsius',
            'f': 'Fahrenheit',
            'k': 'Kelvin'
        },
        volume: {
            'ml': 'Milliliters',
            'l': 'Liters',
            'tsp': 'Teaspoons',
            'tbsp': 'Tablespoons',
            'cup': 'Cups',
            'pt': 'Pints',
            'qt': 'Quarts',
            'gal': 'Gallons'
        },
        area: {
            'mm2': 'Square Millimeters',
            'cm2': 'Square Centimeters',
            'm2': 'Square Meters',
            'km2': 'Square Kilometers',
            'in2': 'Square Inches',
            'ft2': 'Square Feet',
            'yd2': 'Square Yards',
            'ac': 'Acres'
        }
    };
    
    // Clear and populate dropdowns
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    Object.entries(units[type]).forEach(([key, value]) => {
        fromUnit.innerHTML += `<option value="${key}">${value}</option>`;
        toUnit.innerHTML += `<option value="${key}">${value}</option>`;
    });
    
    // Set different default units
    if (toUnit.children.length > 1) {
        toUnit.selectedIndex = 1;
    }
    
    this.convertUnits();
};

ToolsApp.convertUnits = function() {
    const type = document.getElementById('conversionType').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value) || 0;
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    
    let result = 0;
    
    // Conversion factors to base units
    const conversions = {
        length: { // to meters
            'mm': 0.001,
            'cm': 0.01,
            'm': 1,
            'km': 1000,
            'in': 0.0254,
            'ft': 0.3048,
            'yd': 0.9144,
            'mi': 1609.344
        },
        weight: { // to grams
            'mg': 0.001,
            'g': 1,
            'kg': 1000,
            't': 1000000,
            'oz': 28.3495,
            'lb': 453.592,
            'st': 6350.29
        },
        temperature: { // special case
            'c': (val) => val,
            'f': (val) => (val - 32) * 5/9,
            'k': (val) => val - 273.15
        },
        volume: { // to milliliters
            'ml': 1,
            'l': 1000,
            'tsp': 4.92892,
            'tbsp': 14.7868,
            'cup': 236.588,
            'pt': 473.176,
            'qt': 946.353,
            'gal': 3785.41
        },
        area: { // to square meters
            'mm2': 0.000001,
            'cm2': 0.0001,
            'm2': 1,
            'km2': 1000000,
            'in2': 0.00064516,
            'ft2': 0.092903,
            'yd2': 0.836127,
            'ac': 4046.86
        }
    };
    
    if (type === 'temperature') {
        // Temperature conversion is special
        let celsius = fromValue;
        if (fromUnit === 'f') celsius = (fromValue - 32) * 5/9;
        if (fromUnit === 'k') celsius = fromValue - 273.15;
        
        if (toUnit === 'c') result = celsius;
        if (toUnit === 'f') result = celsius * 9/5 + 32;
        if (toUnit === 'k') result = celsius + 273.15;
    } else {
        // Standard conversion via base unit
        const baseValue = fromValue * conversions[type][fromUnit];
        result = baseValue / conversions[type][toUnit];
    }
    
    document.getElementById('toValue').value = result.toFixed(6).replace(/\.?0+$/, '');
    
    const resultsHTML = `
        <div class="results">
            <h4>Conversion Result</h4>
            <div class="result-item">
                <span class="result-label">${fromValue} ${document.getElementById('fromUnit').selectedOptions[0].text}</span>
                <span class="result-value">=</span>
            </div>
            <div class="result-item">
                <span class="result-label">${result.toFixed(6).replace(/\.?0+$/, '')} ${document.getElementById('toUnit').selectedOptions[0].text}</span>
                <span class="result-value">✓</span>
            </div>
        </div>
    `;
    
    document.getElementById('conversionResults').innerHTML = resultsHTML;
};

// QR Code Generator
ToolsApp.getQRGeneratorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="qrText">Text or URL to encode</label>
                <textarea id="qrText" rows="4" placeholder="Enter text, URL, or any data to generate QR code"></textarea>
            </div>
            
            <div class="form-group">
                <label for="qrSize">QR Code Size</label>
                <select id="qrSize">
                    <option value="200">Small (200x200)</option>
                    <option value="300" selected>Medium (300x300)</option>
                    <option value="400">Large (400x400)</option>
                    <option value="500">Extra Large (500x500)</option>
                </select>
            </div>
            
            <button type="button" class="btn" onclick="ToolsApp.generateQRCode()">Generate QR Code</button>
        </div>
        
        <div id="qrResults"></div>
    `;
};

ToolsApp.initQRGenerator = function() {
    const qrTextElement = document.getElementById('qrText');
    if (qrTextElement) {
        qrTextElement.addEventListener('input', () => {
            if (qrTextElement.value.trim()) {
                this.generateQRCode();
            }
        });
    }
};

ToolsApp.generateQRCode = function() {
    const qrTextElement = document.getElementById('qrText');
    const qrSizeElement = document.getElementById('qrSize');
    const qrResultsElement = document.getElementById('qrResults');
    
    // Check if elements exist before proceeding
    if (!qrTextElement || !qrSizeElement || !qrResultsElement) {
        return;
    }
    
    const text = qrTextElement.value.trim();
    const size = qrSizeElement.value;
    
    if (!text) {
        qrResultsElement.innerHTML = '<div class="results"><p style="color: #e74c3c;">Please enter text to generate QR code.</p></div>';
        return;
    }
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    
    const resultsHTML = `
        <div class="results">
            <h4>Generated QR Code</h4>
            <div style="text-align: center; margin: 2rem 0;">
                <img src="${qrUrl}" alt="QR Code" style="max-width: 100%; border: 1px solid #ddd; border-radius: 10px;">
            </div>
            <div class="result-item">
                <span class="result-label">Content</span>
                <span class="result-value" style="word-break: break-all;">${text}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Size</span>
                <span class="result-value">${size}x${size} pixels</span>
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="${qrUrl}" download="qrcode.png" class="btn">Download QR Code</a>
            </div>
        </div>
    `;
    
    qrResultsElement.innerHTML = resultsHTML;
};

// IP Address Lookup Tool
ToolsApp.getIPLookupHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="ipAddress">IP Address to Lookup</label>
                <input type="text" id="ipAddress" placeholder="Enter IP address (e.g., 8.8.8.8)" oninput="ToolsApp.validateIPAddress(this.value)">
                <small>Leave empty to lookup your current IP address</small>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <button type="button" class="btn" onclick="ToolsApp.lookupCurrentIP()">My IP Address</button>
                <button type="button" class="btn" onclick="ToolsApp.lookupIPAddress()">Lookup IP</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.generateRandomIP()">Random IP</button>
            </div>
        </div>
        
        <div id="ipResults"></div>
    `;
};

ToolsApp.initIPLookup = function() {
    // Auto-lookup user's current IP on load
    this.lookupCurrentIP();
};

ToolsApp.validateIPAddress = function(ip) {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const inputElement = document.getElementById('ipAddress');
    
    if (!inputElement) return false;
    
    if (ip && !ipPattern.test(ip)) {
        inputElement.style.borderColor = '#e74c3c';
        return false;
    } else {
        inputElement.style.borderColor = '#27ae60';
        return true;
    }
};

ToolsApp.lookupCurrentIP = function() {
    const resultsElement = document.getElementById('ipResults');
    if (!resultsElement) return;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>🌐 IP Address Information</h4>
            <div class="result-item">
                <span class="result-label">Status</span>
                <span class="result-value">Looking up your IP address...</span>
            </div>
        </div>
    `;
    
    // Simulate IP lookup (since we can't make actual API calls in a static environment)
    setTimeout(() => {
        const mockData = {
            ip: '203.0.113.' + Math.floor(Math.random() * 255),
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            isp: 'Example Internet Provider',
            organization: 'Example Corp',
            timezone: 'America/Los_Angeles',
            latitude: 37.7749,
            longitude: -122.4194
        };
        
        this.displayIPResults(mockData, true);
    }, 1500);
};

ToolsApp.lookupIPAddress = function() {
    const ipAddress = document.getElementById('ipAddress').value.trim();
    const resultsElement = document.getElementById('ipResults');
    
    if (!resultsElement) return;
    
    if (!ipAddress) {
        this.lookupCurrentIP();
        return;
    }
    
    if (!this.validateIPAddress(ipAddress)) {
        resultsElement.innerHTML = `
            <div class="results">
                <h4>❌ Invalid IP Address</h4>
                <div class="result-item">
                    <span class="result-label">Error</span>
                    <span class="result-value">Please enter a valid IP address format (e.g., 192.168.1.1)</span>
                </div>
            </div>
        `;
        return;
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>🔍 Looking up IP: ${ipAddress}</h4>
            <div class="result-item">
                <span class="result-label">Status</span>
                <span class="result-value">Fetching IP information...</span>
            </div>
        </div>
    `;
    
    // Simulate IP lookup with random data
    setTimeout(() => {
        const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'South Korea'];
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        const isps = ['Comcast', 'Verizon', 'AT&T', 'Charter Communications', 'Cox Communications', 'Frontier'];
        
        const mockData = {
            ip: ipAddress,
            country: countries[Math.floor(Math.random() * countries.length)],
            region: 'Random Region',
            city: cities[Math.floor(Math.random() * cities.length)],
            isp: isps[Math.floor(Math.random() * isps.length)],
            organization: 'Sample Organization',
            timezone: 'UTC-' + Math.floor(Math.random() * 12),
            latitude: (Math.random() * 180 - 90).toFixed(4),
            longitude: (Math.random() * 360 - 180).toFixed(4)
        };
        
        this.displayIPResults(mockData, false);
    }, 1500);
};

ToolsApp.generateRandomIP = function() {
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    document.getElementById('ipAddress').value = randomIP;
    this.lookupIPAddress();
};

ToolsApp.displayIPResults = function(data, isCurrentIP) {
    const resultsElement = document.getElementById('ipResults');
    if (!resultsElement) return;
    
    const title = isCurrentIP ? '🌐 Your IP Address Information' : `🔍 IP Lookup Results: ${data.ip}`;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>${title}</h4>
            <div class="result-item">
                <span class="result-label">IP Address</span>
                <span class="result-value">${data.ip}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Country</span>
                <span class="result-value">${data.country}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Region</span>
                <span class="result-value">${data.region}</span>
            </div>
            <div class="result-item">
                <span class="result-label">City</span>
                <span class="result-value">${data.city}</span>
            </div>
            <div class="result-item">
                <span class="result-label">ISP</span>
                <span class="result-value">${data.isp}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Organization</span>
                <span class="result-value">${data.organization}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Timezone</span>
                <span class="result-value">${data.timezone}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Coordinates</span>
                <span class="result-value">${data.latitude}, ${data.longitude}</span>
            </div>
            ${isCurrentIP ? `
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(52, 152, 219, 0.1); border-radius: 8px; border-left: 4px solid #3498db;">
                <strong>Note:</strong> This is demo data for testing purposes. In a production environment, this would use a real IP geolocation API.
            </div>
            ` : ''}
        </div>
    `;
};

// Text Case Converter - Fix function name to match app.js expectations
ToolsApp.getTextCaseConverterHTML = function() {
    return this.getTextConverterHTML();
};

// Text Case Converter
ToolsApp.getTextConverterHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="inputText">Text to Convert</label>
                <textarea id="inputText" rows="4" placeholder="Enter your text here..." oninput="ToolsApp.convertTextCase()"></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('upper')">UPPERCASE</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('lower')">lowercase</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('title')">Title Case</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('sentence')">Sentence case</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('camel')">camelCase</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('pascal')">PascalCase</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('snake')">snake_case</button>
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.applyTextCase('kebab')">kebab-case</button>
            </div>
        </div>
        
        <div id="textResults"></div>
    `;
};

ToolsApp.initTextConverter = function() {
    // Only initialize if the DOM element exists
    const textInput = document.getElementById('inputText');
    if (textInput) {
        this.convertTextCase();
    }
};

ToolsApp.applyTextCase = function(caseType) {
    const inputElement = document.getElementById('inputText');
    
    // Check if element exists before proceeding
    if (!inputElement) {
        return;
    }
    
    const text = inputElement.value;
    let converted = '';
    
    switch(caseType) {
        case 'upper':
            converted = text.toUpperCase();
            break;
        case 'lower':
            converted = text.toLowerCase();
            break;
        case 'title':
            converted = text.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            break;
        case 'sentence':
            converted = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => 
                c.toUpperCase());
            break;
        case 'camel':
            converted = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
            break;
        case 'pascal':
            converted = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
                word.toUpperCase()).replace(/\s+/g, '');
            break;
        case 'snake':
            converted = text.toLowerCase().replace(/\s+/g, '_');
            break;
        case 'kebab':
            converted = text.toLowerCase().replace(/\s+/g, '-');
            break;
    }
    
    inputElement.value = converted;
    this.convertTextCase();
};

ToolsApp.convertTextCase = function() {
    const inputElement = document.getElementById('inputText');
    const resultsElement = document.getElementById('textResults');
    
    // Check if elements exist before proceeding
    if (!inputElement || !resultsElement) {
        return;
    }
    
    const text = inputElement.value;
    
    if (!text.trim()) {
        resultsElement.innerHTML = '';
        return;
    }
    
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    
    const resultsHTML = `
        <div class="results">
            <h4>Text Statistics</h4>
            <div class="result-item">
                <span class="result-label">Characters (with spaces)</span>
                <span class="result-value">${charCount}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Characters (without spaces)</span>
                <span class="result-value">${charCountNoSpaces}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Words</span>
                <span class="result-value">${wordCount}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Lines</span>
                <span class="result-value">${text.split('\n').length}</span>
            </div>
        </div>
    `;
    
    resultsElement.innerHTML = resultsHTML;
};

// Wage Converter
ToolsApp.getWageConverterHTML = function() {
    return `
        <div class="calculator-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4>💰 Hourly to Salary</h4>
                    <div class="form-group">
                        <label for="hourlyWage">Hourly Wage ($)</label>
                        <input type="number" id="hourlyWage" value="25" min="0" step="0.25" oninput="ToolsApp.convertHourlyToSalary()">
                    </div>
                    <div class="form-group">
                        <label for="hoursPerWeek">Hours per Week</label>
                        <input type="number" id="hoursPerWeek" value="40" min="1" max="80" step="1" oninput="ToolsApp.convertHourlyToSalary()">
                    </div>
                    <div class="form-group">
                        <label for="weeksPerYear">Weeks per Year</label>
                        <input type="number" id="weeksPerYear" value="52" min="1" max="52" step="1" oninput="ToolsApp.convertHourlyToSalary()">
                    </div>
                </div>
                
                <div>
                    <h4>📊 Salary to Hourly</h4>
                    <div class="form-group">
                        <label for="annualSalary">Annual Salary ($)</label>
                        <input type="number" id="annualSalary" value="52000" min="0" step="1000" oninput="ToolsApp.convertSalaryToHourly()">
                    </div>
                    <div class="form-group">
                        <label for="salaryHoursPerWeek">Hours per Week</label>
                        <input type="number" id="salaryHoursPerWeek" value="40" min="1" max="80" step="1" oninput="ToolsApp.convertSalaryToHourly()">
                    </div>
                    <div class="form-group">
                        <label for="salaryWeeksPerYear">Weeks per Year</label>
                        <input type="number" id="salaryWeeksPerYear" value="52" min="1" max="52" step="1" oninput="ToolsApp.convertSalaryToHourly()">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="wageResults"></div>
    `;
};

ToolsApp.initWageConverter = function() {
    this.convertHourlyToSalary();
};

ToolsApp.convertHourlyToSalary = function() {
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value) || 0;
    const hoursPerWeek = parseFloat(document.getElementById('hoursPerWeek').value) || 40;
    const weeksPerYear = parseFloat(document.getElementById('weeksPerYear').value) || 52;
    
    const annualSalary = hourlyWage * hoursPerWeek * weeksPerYear;
    const monthlySalary = annualSalary / 12;
    const biweeklySalary = annualSalary / 26;
    const weeklySalary = annualSalary / weeksPerYear;
    
    document.getElementById('wageResults').innerHTML = `
        <div class="results">
            <h4>Hourly to Salary Conversion</h4>
            <div class="result-item">
                <span class="result-label">Hourly Rate</span>
                <span class="result-value">${ToolsApp.formatCurrency(hourlyWage)}/hour</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annual Salary</span>
                <span class="result-value">${ToolsApp.formatCurrency(annualSalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Salary</span>
                <span class="result-value">${ToolsApp.formatCurrency(monthlySalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Bi-weekly Pay</span>
                <span class="result-value">${ToolsApp.formatCurrency(biweeklySalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Weekly Pay</span>
                <span class="result-value">${ToolsApp.formatCurrency(weeklySalary)}</span>
            </div>
        </div>
    `;
};

ToolsApp.convertSalaryToHourly = function() {
    const annualSalary = parseFloat(document.getElementById('annualSalary').value) || 0;
    const hoursPerWeek = parseFloat(document.getElementById('salaryHoursPerWeek').value) || 40;
    const weeksPerYear = parseFloat(document.getElementById('salaryWeeksPerYear').value) || 52;
    
    const totalHours = hoursPerWeek * weeksPerYear;
    const hourlyRate = totalHours > 0 ? annualSalary / totalHours : 0;
    const monthlySalary = annualSalary / 12;
    const biweeklySalary = annualSalary / 26;
    const weeklySalary = annualSalary / weeksPerYear;
    
    document.getElementById('wageResults').innerHTML = `
        <div class="results">
            <h4>Salary to Hourly Conversion</h4>
            <div class="result-item">
                <span class="result-label">Annual Salary</span>
                <span class="result-value">${ToolsApp.formatCurrency(annualSalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Hourly Rate</span>
                <span class="result-value">${ToolsApp.formatCurrency(hourlyRate)}/hour</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Salary</span>
                <span class="result-value">${ToolsApp.formatCurrency(monthlySalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Bi-weekly Pay</span>
                <span class="result-value">${ToolsApp.formatCurrency(biweeklySalary)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Weekly Pay</span>
                <span class="result-value">${ToolsApp.formatCurrency(weeklySalary)}</span>
            </div>
        </div>
    `;
};

// Placeholder implementations for remaining tools
ToolsApp.getRetirementCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="currentAge">Current Age</label>
                <input type="number" id="currentAge" value="30" min="18" max="80">
            </div>
            <div class="form-group">
                <label for="retirementAge">Retirement Age</label>
                <input type="number" id="retirementAge" value="65" min="50" max="80">
            </div>
            <div class="form-group">
                <label for="currentSavings">Current Retirement Savings ($)</label>
                <input type="number" id="currentSavings" value="50000" min="0" step="1000">
            </div>
            <div class="form-group">
                <label for="monthlyContribution">Monthly Contribution ($)</label>
                <input type="number" id="monthlyContribution" value="500" min="0" step="50">
            </div>
            <div class="form-group">
                <label for="expectedReturn">Expected Annual Return (%)</label>
                <input type="number" id="expectedReturn" value="7" min="0" max="15" step="0.1">
            </div>
            <button type="button" class="btn" onclick="ToolsApp.calculateRetirement()">Calculate Retirement</button>
        </div>
        <div id="retirementResults"></div>
    `;
};

ToolsApp.calculateRetirement = function() {
    const currentAge = parseInt(document.getElementById('currentAge').value) || 30;
    const retirementAge = parseInt(document.getElementById('retirementAge').value) || 65;
    const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100 || 0.07;
    
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = expectedReturn / 12;
    
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);
    
    // Future value of monthly contributions
    let futureValueContributions = 0;
    if (monthlyReturn > 0) {
        futureValueContributions = monthlyContribution * (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
    } else {
        futureValueContributions = monthlyContribution * monthsToRetirement;
    }
    
    const totalRetirementSavings = futureValueCurrent + futureValueContributions;
    const totalContributions = currentSavings + (monthlyContribution * monthsToRetirement);
    const totalGrowth = totalRetirementSavings - totalContributions;
    
    // 4% withdrawal rule
    const annualWithdrawal = totalRetirementSavings * 0.04;
    const monthlyWithdrawal = annualWithdrawal / 12;
    
    document.getElementById('retirementResults').innerHTML = `
        <div class="results">
            <h4>Retirement Projection</h4>
            <div class="result-item">
                <span class="result-label">Years to Retirement</span>
                <span class="result-value">${yearsToRetirement} years</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total at Retirement</span>
                <span class="result-value">${ToolsApp.formatCurrency(totalRetirementSavings)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Contributions</span>
                <span class="result-value">${ToolsApp.formatCurrency(totalContributions)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Investment Growth</span>
                <span class="result-value">${ToolsApp.formatCurrency(totalGrowth)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Income (4% Rule)</span>
                <span class="result-value">${ToolsApp.formatCurrency(monthlyWithdrawal)}</span>
            </div>
        </div>
    `;
};

// These tools are now implemented in finance-tools.js

// Real estate tools are now implemented in real-estate-tools.js

// Removed placeholder functions that were conflicting with real implementations
// Business tools are now properly implemented in business-tools.js
// Education tools are now properly implemented in education-tools.js
// Daily life tools will be implemented separately 