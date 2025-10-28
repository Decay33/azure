// Daily Life Tools Implementation

// Calorie Calculator
ToolsApp.getCalorieCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="gender">Gender</label>
                <select id="gender" onchange="ToolsApp.calculateCalories()">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="age">Age (years)</label>
                <input type="number" id="age" value="30" min="10" max="100" oninput="ToolsApp.calculateCalories()">
            </div>
            
            <div class="form-group">
                <label for="weight">Weight</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="weight" value="70" min="30" max="300" step="0.1" style="flex: 1;" oninput="ToolsApp.calculateCalories()">
                    <select id="weightUnit" style="flex: 1;" onchange="ToolsApp.calculateCalories()">
                        <option value="kg" selected>kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="height">Height</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="height" value="170" min="100" max="250" step="0.1" style="flex: 1;" oninput="ToolsApp.calculateCalories()">
                    <select id="heightUnit" style="flex: 1;" onchange="ToolsApp.calculateCalories()">
                        <option value="cm" selected>cm</option>
                        <option value="ft">feet</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="activityLevel">Activity Level</label>
                <select id="activityLevel" onchange="ToolsApp.calculateCalories()">
                    <option value="1.2">Sedentary (little/no exercise)</option>
                    <option value="1.375" selected>Lightly active (light exercise 1-3 days/week)</option>
                    <option value="1.55">Moderately active (moderate exercise 3-5 days/week)</option>
                    <option value="1.725">Very active (hard exercise 6-7 days/week)</option>
                    <option value="1.9">Extremely active (very hard exercise, physical job)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="goal">Goal</label>
                <select id="goal" onchange="ToolsApp.calculateCalories()">
                    <option value="maintain">Maintain weight</option>
                    <option value="lose0.5">Lose 0.5 kg (1 lb) per week</option>
                    <option value="lose1" selected>Lose 1 kg (2 lbs) per week</option>
                    <option value="gain0.5">Gain 0.5 kg (1 lb) per week</option>
                    <option value="gain1">Gain 1 kg (2 lbs) per week</option>
                </select>
            </div>
        </div>
        
        <div id="calorieResults"></div>
    `;
};

ToolsApp.calculateCalories = function() {
    const genderElement = document.getElementById('gender');
    const ageElement = document.getElementById('age');
    const weightElement = document.getElementById('weight');
    const weightUnitElement = document.getElementById('weightUnit');
    const heightElement = document.getElementById('height');
    const heightUnitElement = document.getElementById('heightUnit');
    const activityLevelElement = document.getElementById('activityLevel');
    const goalElement = document.getElementById('goal');
    const resultsElement = document.getElementById('calorieResults');
    
    if (!genderElement || !ageElement || !weightElement || !heightElement || !resultsElement) return;
    
    const gender = genderElement.value;
    const age = parseFloat(ageElement.value) || 30;
    let weight = parseFloat(weightElement.value) || 70;
    let height = parseFloat(heightElement.value) || 170;
    const activityLevel = parseFloat(activityLevelElement.value) || 1.375;
    const goal = goalElement.value;
    
    // Convert to metric if needed
    if (weightUnitElement.value === 'lbs') {
        weight = weight * 0.453592; // Convert lbs to kg
    }
    if (heightUnitElement.value === 'ft') {
        height = height * 30.48; // Convert feet to cm
    }
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityLevel;
    
    // Adjust calories based on goal
    let targetCalories = tdee;
    let weeklyChange = 0;
    switch(goal) {
        case 'lose0.5':
            targetCalories = tdee - 500; // 500 cal deficit = ~0.5kg/week
            weeklyChange = -0.5;
            break;
        case 'lose1':
            targetCalories = tdee - 1000; // 1000 cal deficit = ~1kg/week
            weeklyChange = -1;
            break;
        case 'gain0.5':
            targetCalories = tdee + 500; // 500 cal surplus = ~0.5kg/week
            weeklyChange = 0.5;
            break;
        case 'gain1':
            targetCalories = tdee + 1000; // 1000 cal surplus = ~1kg/week
            weeklyChange = 1;
            break;
    }
    
    // Calculate BMI
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    
    let bmiCategory = '';
    let bmiColor = '';
    if (bmi < 18.5) {
        bmiCategory = 'Underweight';
        bmiColor = '#3498db';
    } else if (bmi < 25) {
        bmiCategory = 'Normal weight';
        bmiColor = '#27ae60';
    } else if (bmi < 30) {
        bmiCategory = 'Overweight';
        bmiColor = '#f39c12';
    } else {
        bmiCategory = 'Obese';
        bmiColor = '#e74c3c';
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Calorie Calculation Results</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Daily Calorie Target</span>
                <span class="result-value">${Math.round(targetCalories)} calories</span>
            </div>
            <div class="result-item">
                <span class="result-label">BMR (Base Metabolic Rate)</span>
                <span class="result-value">${Math.round(bmr)} calories</span>
            </div>
            <div class="result-item">
                <span class="result-label">TDEE (Maintenance)</span>
                <span class="result-value">${Math.round(tdee)} calories</span>
            </div>
            <div class="result-item">
                <span class="result-label">BMI</span>
                <span class="result-value" style="color: ${bmiColor};">${bmi.toFixed(1)} (${bmiCategory})</span>
            </div>
            ${weeklyChange !== 0 ? `
            <div class="result-item">
                <span class="result-label">Expected Weekly Change</span>
                <span class="result-value">${weeklyChange > 0 ? '+' : ''}${weeklyChange} kg</span>
            </div>
            ` : ''}
        </div>
        
        <div class="results mt-3">
            <h4>💡 Nutrition Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Focus on whole foods: fruits, vegetables, lean proteins, whole grains</p>
            <p style="color: #666; margin: 0.5rem 0;">• Stay hydrated with 8-10 glasses of water daily</p>
            <p style="color: #666; margin: 0.5rem 0;">• Eat regular meals to maintain stable energy levels</p>
            <p style="color: #666; margin: 0.5rem 0;">• Consult a healthcare professional for personalized advice</p>
        </div>
    `;
};

// Macro Tracker
ToolsApp.getMacroTrackerHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="macroCalories">Daily Calorie Target</label>
                <input type="number" id="macroCalories" value="2000" min="800" max="5000" step="50" oninput="ToolsApp.calculateMacros()">
                <small style="color: #666;">Use calorie calculator above to determine your target</small>
            </div>
            
            <div class="form-group">
                <label for="macroGoal">Macro Split Goal</label>
                <select id="macroGoal" onchange="ToolsApp.updateMacroSplit()">
                    <option value="balanced">Balanced (30% protein, 35% carbs, 35% fat)</option>
                    <option value="lowcarb">Low Carb (35% protein, 20% carbs, 45% fat)</option>
                    <option value="highprotein">High Protein (40% protein, 30% carbs, 30% fat)</option>
                    <option value="keto">Keto (25% protein, 5% carbs, 70% fat)</option>
                    <option value="custom">Custom Split</option>
                </select>
            </div>
            
            <div id="macroSliders" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                <div>
                    <label for="proteinPercent">Protein: <span id="proteinValue">30</span>%</label>
                    <input type="range" id="proteinPercent" min="10" max="60" value="30" oninput="ToolsApp.updateMacroValues()">
                </div>
                <div>
                    <label for="carbPercent">Carbs: <span id="carbValue">35</span>%</label>
                    <input type="range" id="carbPercent" min="5" max="70" value="35" oninput="ToolsApp.updateMacroValues()">
                </div>
                <div>
                    <label for="fatPercent">Fat: <span id="fatValue">35</span>%</label>
                    <input type="range" id="fatPercent" min="15" max="80" value="35" oninput="ToolsApp.updateMacroValues()">
                </div>
            </div>
            
            <div style="text-align: center; margin: 1rem 0;">
                <span id="totalPercent" style="font-weight: 600; color: #667eea;">Total: 100%</span>
            </div>
        </div>
        
        <div id="macroResults"></div>
    `;
};

ToolsApp.updateMacroSplit = function() {
    const goal = document.getElementById('macroGoal').value;
    let protein, carbs, fat;
    
    switch(goal) {
        case 'balanced':
            protein = 30; carbs = 35; fat = 35;
            break;
        case 'lowcarb':
            protein = 35; carbs = 20; fat = 45;
            break;
        case 'highprotein':
            protein = 40; carbs = 30; fat = 30;
            break;
        case 'keto':
            protein = 25; carbs = 5; fat = 70;
            break;
        default:
            return; // Custom - don't change sliders
    }
    
    document.getElementById('proteinPercent').value = protein;
    document.getElementById('carbPercent').value = carbs;
    document.getElementById('fatPercent').value = fat;
    
    this.updateMacroValues();
};

ToolsApp.updateMacroValues = function() {
    const protein = parseInt(document.getElementById('proteinPercent').value);
    const carbs = parseInt(document.getElementById('carbPercent').value);
    const fat = parseInt(document.getElementById('fatPercent').value);
    
    document.getElementById('proteinValue').textContent = protein;
    document.getElementById('carbValue').textContent = carbs;
    document.getElementById('fatValue').textContent = fat;
    
    const total = protein + carbs + fat;
    document.getElementById('totalPercent').textContent = `Total: ${total}%`;
    document.getElementById('totalPercent').style.color = total === 100 ? '#27ae60' : '#e74c3c';
    
    this.calculateMacros();
};

ToolsApp.calculateMacros = function() {
    const caloriesElement = document.getElementById('macroCalories');
    const proteinPercentElement = document.getElementById('proteinPercent');
    const carbPercentElement = document.getElementById('carbPercent');
    const fatPercentElement = document.getElementById('fatPercent');
    const resultsElement = document.getElementById('macroResults');
    
    if (!caloriesElement || !proteinPercentElement || !resultsElement) return;
    
    const calories = parseFloat(caloriesElement.value) || 2000;
    const proteinPercent = parseInt(proteinPercentElement.value) || 30;
    const carbPercent = parseInt(carbPercentElement.value) || 35;
    const fatPercent = parseInt(fatPercentElement.value) || 35;
    
    // Calculate calories from each macro
    const proteinCalories = calories * (proteinPercent / 100);
    const carbCalories = calories * (carbPercent / 100);
    const fatCalories = calories * (fatPercent / 100);
    
    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const proteinGrams = proteinCalories / 4;
    const carbGrams = carbCalories / 4;
    const fatGrams = fatCalories / 9;
    
    const total = proteinPercent + carbPercent + fatPercent;
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Daily Macro Targets</h4>
            <div class="result-item">
                <span class="result-label">🥩 Protein</span>
                <span class="result-value">${Math.round(proteinGrams)}g (${proteinPercent}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">🍞 Carbohydrates</span>
                <span class="result-value">${Math.round(carbGrams)}g (${carbPercent}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">🥑 Fats</span>
                <span class="result-value">${Math.round(fatGrams)}g (${fatPercent}%)</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Calories</span>
                <span class="result-value">${calories} calories</span>
            </div>
            ${total !== 100 ? `
            <div style="color: #e74c3c; text-align: center; margin-top: 1rem;">
                ⚠️ Warning: Percentages don't add up to 100%
            </div>
            ` : ''}
        </div>
        
        <div class="results mt-3">
            <h4>🍽️ Meal Planning Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Protein: Chicken, fish, eggs, beans, tofu, Greek yogurt</p>
            <p style="color: #666; margin: 0.5rem 0;">• Carbs: Oats, rice, quinoa, fruits, vegetables</p>
            <p style="color: #666; margin: 0.5rem 0;">• Fats: Nuts, oils, avocado, fatty fish, seeds</p>
            <p style="color: #666; margin: 0.5rem 0;">• Use a food tracking app to monitor your daily intake</p>
        </div>
    `;
};

// Water Intake Calculator
ToolsApp.getWaterIntakeHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="waterWeight">Body Weight</label>
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="waterWeight" value="70" min="30" max="300" step="0.1" style="flex: 1;" oninput="ToolsApp.calculateWaterIntake()">
                    <select id="waterWeightUnit" style="flex: 1;" onchange="ToolsApp.calculateWaterIntake()">
                        <option value="kg" selected>kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="activityMinutes">Exercise Duration (minutes/day)</label>
                <input type="number" id="activityMinutes" value="30" min="0" max="300" step="15" oninput="ToolsApp.calculateWaterIntake()">
            </div>
            
            <div class="form-group">
                <label for="climate">Climate/Environment</label>
                <select id="climate" onchange="ToolsApp.calculateWaterIntake()">
                    <option value="normal" selected>Normal (moderate temperature)</option>
                    <option value="hot">Hot/Humid climate</option>
                    <option value="dry">Dry/High altitude</option>
                    <option value="cold">Cold climate</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="healthStatus">Health Status</label>
                <select id="healthStatus" onchange="ToolsApp.calculateWaterIntake()">
                    <option value="normal" selected>Healthy</option>
                    <option value="fever">Fever/Illness</option>
                    <option value="breastfeeding">Breastfeeding</option>
                    <option value="pregnant">Pregnant</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="caffeineIntake">Daily Caffeine Intake</label>
                <select id="caffeineIntake" onchange="ToolsApp.calculateWaterIntake()">
                    <option value="none" selected>None</option>
                    <option value="low">1-2 cups coffee/tea</option>
                    <option value="moderate">3-4 cups coffee/tea</option>
                    <option value="high">5+ cups coffee/tea</option>
                </select>
            </div>
        </div>
        
        <div id="waterResults"></div>
    `;
};

ToolsApp.calculateWaterIntake = function() {
    const weightElement = document.getElementById('waterWeight');
    const weightUnitElement = document.getElementById('waterWeightUnit');
    const activityElement = document.getElementById('activityMinutes');
    const climateElement = document.getElementById('climate');
    const healthElement = document.getElementById('healthStatus');
    const caffeineElement = document.getElementById('caffeineIntake');
    const resultsElement = document.getElementById('waterResults');
    
    if (!weightElement || !resultsElement) return;
    
    let weight = parseFloat(weightElement.value) || 70;
    const activityMinutes = parseFloat(activityElement.value) || 0;
    const climate = climateElement.value;
    const health = healthElement.value;
    const caffeine = caffeineElement.value;
    
    // Convert to kg if needed
    if (weightUnitElement.value === 'lbs') {
        weight = weight * 0.453592;
    }
    
    // Base water intake: 35ml per kg of body weight
    let waterIntake = weight * 35;
    
    // Add for exercise: 500-750ml per hour of exercise
    const exerciseHours = activityMinutes / 60;
    waterIntake += exerciseHours * 625; // 625ml per hour average
    
    // Climate adjustments
    switch(climate) {
        case 'hot':
            waterIntake *= 1.2; // 20% more in hot climate
            break;
        case 'dry':
            waterIntake *= 1.15; // 15% more in dry/high altitude
            break;
        case 'cold':
            waterIntake *= 0.95; // 5% less in cold climate
            break;
    }
    
    // Health status adjustments
    switch(health) {
        case 'fever':
            waterIntake *= 1.3; // 30% more when sick
            break;
        case 'breastfeeding':
            waterIntake += 700; // Additional 700ml for breastfeeding
            break;
        case 'pregnant':
            waterIntake += 300; // Additional 300ml for pregnancy
            break;
    }
    
    // Caffeine adjustments
    switch(caffeine) {
        case 'low':
            waterIntake += 200; // 200ml extra for 1-2 cups
            break;
        case 'moderate':
            waterIntake += 400; // 400ml extra for 3-4 cups
            break;
        case 'high':
            waterIntake += 600; // 600ml extra for 5+ cups
            break;
    }
    
    // Convert to different units
    const liters = waterIntake / 1000;
    const cups = waterIntake / 240; // 240ml per cup
    const ounces = waterIntake / 29.5735; // ml to fl oz
    const glasses = waterIntake / 250; // 250ml glasses
    
    let recommendations = [];
    if (liters < 1.5) {
        recommendations.push('Consider increasing your water intake');
    }
    if (activityMinutes > 60) {
        recommendations.push('Drink water before, during, and after exercise');
    }
    if (climate === 'hot') {
        recommendations.push('Monitor urine color to check hydration');
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Daily Water Intake Target</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Total Daily Water</span>
                <span class="result-value">${liters.toFixed(1)} liters</span>
            </div>
            <div class="result-item">
                <span class="result-label">In Cups (240ml)</span>
                <span class="result-value">${cups.toFixed(1)} cups</span>
            </div>
            <div class="result-item">
                <span class="result-label">In Glasses (250ml)</span>
                <span class="result-value">${glasses.toFixed(1)} glasses</span>
            </div>
            <div class="result-item">
                <span class="result-label">In Fluid Ounces</span>
                <span class="result-value">${ounces.toFixed(0)} fl oz</span>
            </div>
            <div class="result-item">
                <span class="result-label">Hourly Target (16 hours)</span>
                <span class="result-value">${(waterIntake/16).toFixed(0)} ml/hour</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>💧 Hydration Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Start your day with a glass of water</p>
            <p style="color: #666; margin: 0.5rem 0;">• Keep a water bottle with you throughout the day</p>
            <p style="color: #666; margin: 0.5rem 0;">• Eat water-rich foods like fruits and vegetables</p>
            <p style="color: #666; margin: 0.5rem 0;">• Monitor urine color: pale yellow indicates good hydration</p>
            ${recommendations.length > 0 ? `
            <div style="margin-top: 1rem;">
                <strong>Personalized Recommendations:</strong>
                ${recommendations.map(rec => `<p style="color: #667eea; margin: 0.25rem 0;">• ${rec}</p>`).join('')}
            </div>
            ` : ''}
        </div>
    `;
};

// Pregnancy Due Date Calculator
ToolsApp.getPregnancyCalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="calculationMethod">Calculation Method</label>
                <select id="calculationMethod" onchange="ToolsApp.togglePregnancyMethod()">
                    <option value="lmp" selected>Last Menstrual Period (LMP)</option>
                    <option value="conception">Conception Date</option>
                    <option value="ultrasound">Ultrasound Date</option>
                </select>
            </div>
            
            <div id="lmpMethod">
                <div class="form-group">
                    <label for="lmpDate">First Day of Last Menstrual Period</label>
                    <input type="date" id="lmpDate" onchange="ToolsApp.calculatePregnancy()">
                </div>
                <div class="form-group">
                    <label for="cycleLength">Average Cycle Length (days)</label>
                    <input type="number" id="cycleLength" value="28" min="21" max="35" oninput="ToolsApp.calculatePregnancy()">
                </div>
            </div>
            
            <div id="conceptionMethod" style="display: none;">
                <div class="form-group">
                    <label for="conceptionDate">Conception Date</label>
                    <input type="date" id="conceptionDate" onchange="ToolsApp.calculatePregnancy()">
                </div>
            </div>
            
            <div id="ultrasoundMethod" style="display: none;">
                <div class="form-group">
                    <label for="ultrasoundDate">Ultrasound Date</label>
                    <input type="date" id="ultrasoundDate" onchange="ToolsApp.calculatePregnancy()">
                </div>
                <div class="form-group">
                    <label for="gestationalAge">Gestational Age at Ultrasound</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="gestationalWeeks" value="12" min="0" max="42" style="flex: 1;" oninput="ToolsApp.calculatePregnancy()">
                        <span style="padding: 0.5rem;">weeks</span>
                        <input type="number" id="gestationalDays" value="0" min="0" max="6" style="flex: 1;" oninput="ToolsApp.calculatePregnancy()">
                        <span style="padding: 0.5rem;">days</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="pregnancyResults"></div>
    `;
};

ToolsApp.togglePregnancyMethod = function() {
    const method = document.getElementById('calculationMethod').value;
    
    document.getElementById('lmpMethod').style.display = method === 'lmp' ? 'block' : 'none';
    document.getElementById('conceptionMethod').style.display = method === 'conception' ? 'block' : 'none';
    document.getElementById('ultrasoundMethod').style.display = method === 'ultrasound' ? 'block' : 'none';
    
    // Set default dates
    const today = new Date();
    if (method === 'lmp' && !document.getElementById('lmpDate').value) {
        const lmpDate = new Date(today);
        lmpDate.setDate(today.getDate() - 28);
        document.getElementById('lmpDate').value = lmpDate.toISOString().split('T')[0];
    }
    
    this.calculatePregnancy();
};

ToolsApp.calculatePregnancy = function() {
    const method = document.getElementById('calculationMethod').value;
    const resultsElement = document.getElementById('pregnancyResults');
    
    let dueDate, lmpDate, conceptionDate, currentWeeks, currentDays;
    const today = new Date();
    
    if (method === 'lmp') {
        const lmpInput = document.getElementById('lmpDate').value;
        if (!lmpInput) return;
        
        lmpDate = new Date(lmpInput);
        dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 280); // 280 days = 40 weeks
        
        conceptionDate = new Date(lmpDate);
        conceptionDate.setDate(conceptionDate.getDate() + 14); // Ovulation ~14 days after LMP
        
    } else if (method === 'conception') {
        const conceptionInput = document.getElementById('conceptionDate').value;
        if (!conceptionInput) return;
        
        conceptionDate = new Date(conceptionInput);
        dueDate = new Date(conceptionDate);
        dueDate.setDate(dueDate.getDate() + 266); // 266 days from conception
        
        lmpDate = new Date(conceptionDate);
        lmpDate.setDate(lmpDate.getDate() - 14);
        
    } else if (method === 'ultrasound') {
        const ultrasoundInput = document.getElementById('ultrasoundDate').value;
        const weeks = parseInt(document.getElementById('gestationalWeeks').value) || 0;
        const days = parseInt(document.getElementById('gestationalDays').value) || 0;
        
        if (!ultrasoundInput) return;
        
        const ultrasoundDate = new Date(ultrasoundInput);
        const gestationalDays = (weeks * 7) + days;
        
        lmpDate = new Date(ultrasoundDate);
        lmpDate.setDate(lmpDate.getDate() - gestationalDays);
        
        dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 280);
        
        conceptionDate = new Date(lmpDate);
        conceptionDate.setDate(conceptionDate.getDate() + 14);
    }
    
    // Calculate current gestational age
    const timeDiff = today - lmpDate;
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    currentWeeks = Math.floor(totalDays / 7);
    currentDays = totalDays % 7;
    
    // Calculate days until due date
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    // Determine trimester
    let trimester;
    if (currentWeeks < 13) {
        trimester = '1st Trimester';
    } else if (currentWeeks < 27) {
        trimester = '2nd Trimester';
    } else {
        trimester = '3rd Trimester';
    }
    
    // Calculate important dates
    const firstTrimesterEnd = new Date(lmpDate);
    firstTrimesterEnd.setDate(firstTrimesterEnd.getDate() + (12 * 7));
    
    const secondTrimesterEnd = new Date(lmpDate);
    secondTrimesterEnd.setDate(secondTrimesterEnd.getDate() + (26 * 7));
    
    const viabilityDate = new Date(lmpDate);
    viabilityDate.setDate(viabilityDate.getDate() + (24 * 7));
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Pregnancy Calculator Results</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Due Date</span>
                <span class="result-value">${dueDate.toLocaleDateString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Current Gestational Age</span>
                <span class="result-value">${currentWeeks} weeks, ${currentDays} days</span>
            </div>
            <div class="result-item">
                <span class="result-label">Trimester</span>
                <span class="result-value">${trimester}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Days Until Due Date</span>
                <span class="result-value">${daysUntilDue > 0 ? `${daysUntilDue} days` : 'Past due date'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Estimated Conception Date</span>
                <span class="result-value">${conceptionDate.toLocaleDateString()}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Important Milestones</h4>
            <div class="result-item">
                <span class="result-label">End of 1st Trimester</span>
                <span class="result-value">${firstTrimesterEnd.toLocaleDateString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">End of 2nd Trimester</span>
                <span class="result-value">${secondTrimesterEnd.toLocaleDateString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Viability (24 weeks)</span>
                <span class="result-value">${viabilityDate.toLocaleDateString()}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>👶 Pregnancy Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Take prenatal vitamins with folic acid</p>
            <p style="color: #666; margin: 0.5rem 0;">• Attend regular prenatal appointments</p>
            <p style="color: #666; margin: 0.5rem 0;">• Maintain a healthy diet and stay hydrated</p>
            <p style="color: #666; margin: 0.5rem 0;">• This calculator provides estimates - consult your healthcare provider</p>
        </div>
    `;
};

// Ovulation Calendar
ToolsApp.getOvulationCalendarHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="lastPeriodDate">First Day of Last Period</label>
                <input type="date" id="lastPeriodDate" onchange="ToolsApp.calculateOvulation()">
            </div>
            
            <div class="form-group">
                <label for="ovulationCycleLength">Average Cycle Length (days)</label>
                <input type="number" id="ovulationCycleLength" value="28" min="21" max="35" oninput="ToolsApp.calculateOvulation()">
                <small style="color: #666;">Count from first day of period to day before next period starts</small>
            </div>
            
            <div class="form-group">
                <label for="lutealPhase">Luteal Phase Length (days)</label>
                <input type="number" id="lutealPhase" value="14" min="10" max="16" oninput="ToolsApp.calculateOvulation()">
                <small style="color: #666;">Time from ovulation to next period (usually 12-16 days)</small>
            </div>
            
            <div class="form-group">
                <label for="cyclesToShow">Number of Cycles to Show</label>
                <select id="cyclesToShow" onchange="ToolsApp.calculateOvulation()">
                    <option value="3" selected>3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                </select>
            </div>
        </div>
        
        <div id="ovulationResults"></div>
    `;
};

ToolsApp.calculateOvulation = function() {
    const lastPeriodInput = document.getElementById('lastPeriodDate').value;
    const cycleLength = parseInt(document.getElementById('ovulationCycleLength').value) || 28;
    const lutealPhase = parseInt(document.getElementById('lutealPhase').value) || 14;
    const cyclesToShow = parseInt(document.getElementById('cyclesToShow').value) || 3;
    const resultsElement = document.getElementById('ovulationResults');
    
    if (!lastPeriodInput) {
        // Set default to today if no date selected
        const today = new Date();
        document.getElementById('lastPeriodDate').value = today.toISOString().split('T')[0];
        return;
    }
    
    const lastPeriod = new Date(lastPeriodInput);
    const ovulationDay = cycleLength - lutealPhase; // Days after period starts
    
    let calendarHTML = '';
    
    for (let cycle = 0; cycle < cyclesToShow; cycle++) {
        const cycleStart = new Date(lastPeriod);
        cycleStart.setDate(lastPeriod.getDate() + (cycle * cycleLength));
        
        const ovulationDate = new Date(cycleStart);
        ovulationDate.setDate(cycleStart.getDate() + ovulationDay);
        
        const fertileStart = new Date(ovulationDate);
        fertileStart.setDate(ovulationDate.getDate() - 5); // Fertile window starts 5 days before ovulation
        
        const fertileEnd = new Date(ovulationDate);
        fertileEnd.setDate(ovulationDate.getDate() + 1); // Fertile window ends 1 day after ovulation
        
        const nextPeriod = new Date(cycleStart);
        nextPeriod.setDate(cycleStart.getDate() + cycleLength);
        
        const monthName = cycleStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        calendarHTML += `
            <div class="results mt-3">
                <h4>${monthName} - Cycle ${cycle + 1}</h4>
                <div class="result-item">
                    <span class="result-label">Period Starts</span>
                    <span class="result-value">${cycleStart.toLocaleDateString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Fertile Window</span>
                    <span class="result-value">${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}</span>
                </div>
                <div class="result-item" style="border-left: 3px solid #e74c3c; padding-left: 1rem;">
                    <span class="result-label">Ovulation Day</span>
                    <span class="result-value" style="color: #e74c3c; font-weight: 600;">${ovulationDate.toLocaleDateString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Next Period</span>
                    <span class="result-value">${nextPeriod.toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Ovulation Calendar</h4>
            <div class="result-item">
                <span class="result-label">Cycle Length</span>
                <span class="result-value">${cycleLength} days</span>
            </div>
            <div class="result-item">
                <span class="result-label">Ovulation Day</span>
                <span class="result-value">Day ${ovulationDay} of cycle</span>
            </div>
            <div class="result-item">
                <span class="result-label">Fertile Window</span>
                <span class="result-value">6 days (5 days before + ovulation day)</span>
            </div>
        </div>
        
        ${calendarHTML}
        
        <div class="results mt-3">
            <h4>🌸 Fertility Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Track your cycle for 3-6 months to identify patterns</p>
            <p style="color: #666; margin: 0.5rem 0;">• Monitor cervical mucus and basal body temperature</p>
            <p style="color: #666; margin: 0.5rem 0;">• Consider ovulation predictor kits for more accuracy</p>
            <p style="color: #666; margin: 0.5rem 0;">• Maintain a healthy lifestyle and manage stress</p>
            <p style="color: #666; margin: 0.5rem 0;"><strong>Note:</strong> This is an estimate. Consult healthcare providers for personalized advice</p>
        </div>
    `;
}; 