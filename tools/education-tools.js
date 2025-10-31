// Education & Study Tools Implementation

// GPA Calculator
ToolsApp.getGPACalculatorHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="gpaScale">GPA Scale</label>
                <select id="gpaScale" onchange="ToolsApp.updateGPAScale()">
                    <option value="4.0" selected>4.0 Scale (Standard)</option>
                    <option value="5.0">5.0 Scale (Weighted)</option>
                    <option value="100">100 Point Scale</option>
                </select>
            </div>
            
            <div id="gradesContainer">
                <h5>Course Grades</h5>
                <div class="grade-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;">
                    <div class="form-group">
                        <label>Course Name</label>
                        <input type="text" class="course-name" value="Math 101">
                    </div>
                    <div class="form-group">
                        <label>Grade</label>
                        <select class="course-grade">
                            <option value="4.0">A (4.0)</option>
                            <option value="3.7">A- (3.7)</option>
                            <option value="3.3">B+ (3.3)</option>
                            <option value="3.0" selected>B (3.0)</option>
                            <option value="2.7">B- (2.7)</option>
                            <option value="2.3">C+ (2.3)</option>
                            <option value="2.0">C (2.0)</option>
                            <option value="1.7">C- (1.7)</option>
                            <option value="1.3">D+ (1.3)</option>
                            <option value="1.0">D (1.0)</option>
                            <option value="0.0">F (0.0)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Credits</label>
                        <input type="number" class="course-credits" value="3" min="0" max="10" step="0.5">
                    </div>
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove(); ToolsApp.calculateGPA();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary" onclick="ToolsApp.addGradeItem()">Add Course</button>
        </div>
        
        <div id="gpaResults"></div>
    `;
};

ToolsApp.addGradeItem = function() {
    const container = document.getElementById('gradesContainer');
    const newItem = document.createElement('div');
    newItem.className = 'grade-item';
    newItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Course Name</label>
            <input type="text" class="course-name" value="Course">
        </div>
        <div class="form-group">
            <label>Grade</label>
            <select class="course-grade">
                <option value="4.0">A (4.0)</option>
                <option value="3.7">A- (3.7)</option>
                <option value="3.3">B+ (3.3)</option>
                <option value="3.0">B (3.0)</option>
                <option value="2.7">B- (2.7)</option>
                <option value="2.3">C+ (2.3)</option>
                <option value="2.0">C (2.0)</option>
                <option value="1.7">C- (1.7)</option>
                <option value="1.3">D+ (1.3)</option>
                <option value="1.0">D (1.0)</option>
                <option value="0.0">F (0.0)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Credits</label>
            <input type="number" class="course-credits" value="3" min="0" max="10" step="0.5">
        </div>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove(); ToolsApp.calculateGPA();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
    `;
    container.appendChild(newItem);
    this.setupGPACalculation();
};

ToolsApp.setupGPACalculation = function() {
    document.querySelectorAll('.course-grade, .course-credits').forEach(input => {
        input.addEventListener('change', () => ToolsApp.calculateGPA());
    });
    // Use setTimeout to ensure DOM is fully loaded before calculating
    setTimeout(() => this.calculateGPA(), 100);
};

ToolsApp.calculateGPA = function() {
    // Check if elements exist before proceeding
    const resultsElement = document.getElementById('gpaResults');
    if (!resultsElement) return;
    
    const gradeItems = document.querySelectorAll('.grade-item');
    let totalPoints = 0;
    let totalCredits = 0;
    let courseBreakdown = [];
    
    gradeItems.forEach(item => {
        const courseName = item.querySelector('.course-name').value || 'Course';
        const gradePoints = parseFloat(item.querySelector('.course-grade').value) || 0;
        const credits = parseFloat(item.querySelector('.course-credits').value) || 0;
        
        totalPoints += gradePoints * credits;
        totalCredits += credits;
        
        courseBreakdown.push({
            name: courseName,
            grade: gradePoints,
            credits: credits,
            points: gradePoints * credits
        });
    });
    
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    let gpaRating = '';
    let ratingColor = '';
    
    if (gpa >= 3.7) {
        gpaRating = 'Excellent (Dean\'s List)';
        ratingColor = '#27ae60';
    } else if (gpa >= 3.0) {
        gpaRating = 'Good Standing';
        ratingColor = '#2ecc71';
    } else if (gpa >= 2.0) {
        gpaRating = 'Academic Probation Risk';
        ratingColor = '#f39c12';
    } else {
        gpaRating = 'Academic Probation';
        ratingColor = '#e74c3c';
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>GPA Calculation</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600; font-size: 1.2rem;">
                <span class="result-label">Cumulative GPA</span>
                <span class="result-value" style="color: ${ratingColor};">${gpa.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Credits</span>
                <span class="result-value">${totalCredits.toFixed(1)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Quality Points</span>
                <span class="result-value">${totalPoints.toFixed(1)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Academic Standing</span>
                <span class="result-value" style="color: ${ratingColor};">${gpaRating}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Course Breakdown</h4>
            ${courseBreakdown.map(course => `
                <div class="result-item">
                    <span class="result-label">${course.name}</span>
                    <span class="result-value">${course.grade.toFixed(1)} × ${course.credits} = ${course.points.toFixed(1)} pts</span>
                </div>
            `).join('')}
        </div>
    `;
};

// Typing Speed Test
ToolsApp.getTypingTestHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="testDuration">Test Duration</label>
                <select id="testDuration">
                    <option value="30">30 seconds</option>
                    <option value="60" selected>1 minute</option>
                    <option value="120">2 minutes</option>
                    <option value="300">5 minutes</option>
                </select>
            </div>
            
            <div id="typingTextContainer" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 1rem 0; font-family: 'Courier New', monospace; line-height: 1.6;">
                <p id="typingText">The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for typing practice. Focus on accuracy first, then speed will naturally follow.</p>
            </div>
            
            <div class="form-group">
                <label for="userInput">Type the text above:</label>
                <textarea id="userInput" rows="4" placeholder="Click here and start typing..." disabled style="font-family: 'Courier New', monospace; font-size: 1rem;"></textarea>
            </div>
            
            <div style="text-align: center; margin: 1rem 0;">
                <button id="startTest" class="btn" onclick="ToolsApp.startTypingTest()">Start Test</button>
                <button id="resetTest" class="btn btn-secondary" onclick="ToolsApp.resetTypingTest()" style="display: none;">Reset</button>
            </div>
            
            <div id="typingTimer" style="text-align: center; font-size: 1.5rem; font-weight: 600; color: #667eea; margin: 1rem 0;"></div>
        </div>
        
        <div id="typingResults"></div>
    `;
};

ToolsApp.typingTestData = {
    isActive: false,
    startTime: null,
    duration: 60,
    timer: null,
    originalText: ''
};

ToolsApp.startTypingTest = function() {
    const duration = parseInt(document.getElementById('testDuration').value);
    const userInput = document.getElementById('userInput');
    const startBtn = document.getElementById('startTest');
    const resetBtn = document.getElementById('resetTest');
    const timerDisplay = document.getElementById('typingTimer');
    
    this.typingTestData.duration = duration;
    this.typingTestData.isActive = true;
    this.typingTestData.startTime = Date.now();
    this.typingTestData.originalText = document.getElementById('typingText').textContent;
    
    userInput.disabled = false;
    userInput.value = '';
    userInput.focus();
    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    
    // Start countdown timer
    let timeLeft = duration;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    
    this.typingTestData.timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            this.endTypingTest();
        }
    }, 1000);
    
    // Real-time typing feedback
    userInput.addEventListener('input', () => {
        if (this.typingTestData.isActive) {
            this.updateTypingProgress();
        }
    });
};

ToolsApp.updateTypingProgress = function() {
    const userText = document.getElementById('userInput').value;
    const originalText = this.typingTestData.originalText;
    const elapsedTime = (Date.now() - this.typingTestData.startTime) / 1000 / 60; // minutes
    
    const wordsTyped = userText.trim().split(/\s+/).length;
    const wpm = Math.round(wordsTyped / elapsedTime) || 0;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < Math.min(userText.length, originalText.length); i++) {
        if (userText[i] === originalText[i]) {
            correctChars++;
        }
    }
    const accuracy = userText.length > 0 ? Math.round((correctChars / userText.length) * 100) : 100;
    
    document.getElementById('typingResults').innerHTML = `
        <div class="results">
            <h4>Live Progress</h4>
            <div class="result-item">
                <span class="result-label">Current WPM</span>
                <span class="result-value">${wpm}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Accuracy</span>
                <span class="result-value">${accuracy}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Characters Typed</span>
                <span class="result-value">${userText.length}</span>
            </div>
        </div>
    `;
};

ToolsApp.endTypingTest = function() {
    clearInterval(this.typingTestData.timer);
    this.typingTestData.isActive = false;
    
    const userText = document.getElementById('userInput').value;
    const originalText = this.typingTestData.originalText;
    const duration = this.typingTestData.duration / 60; // minutes
    
    // Calculate final stats
    const wordsTyped = userText.trim().split(/\s+/).length;
    const wpm = Math.round(wordsTyped / duration);
    
    let correctChars = 0;
    let errors = 0;
    for (let i = 0; i < Math.min(userText.length, originalText.length); i++) {
        if (userText[i] === originalText[i]) {
            correctChars++;
        } else {
            errors++;
        }
    }
    
    const accuracy = userText.length > 0 ? Math.round((correctChars / userText.length) * 100) : 0;
    const netWPM = Math.max(0, wpm - errors);
    
    let skillLevel = '';
    let levelColor = '';
    if (wpm >= 70) {
        skillLevel = 'Expert Typist';
        levelColor = '#27ae60';
    } else if (wpm >= 50) {
        skillLevel = 'Advanced';
        levelColor = '#2ecc71';
    } else if (wpm >= 30) {
        skillLevel = 'Intermediate';
        levelColor = '#f39c12';
    } else {
        skillLevel = 'Beginner';
        levelColor = '#e74c3c';
    }
    
    document.getElementById('typingResults').innerHTML = `
        <div class="results">
            <h4>Typing Test Results</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Words Per Minute</span>
                <span class="result-value">${wpm} WPM</span>
            </div>
            <div class="result-item">
                <span class="result-label">Net WPM (after errors)</span>
                <span class="result-value">${netWPM} WPM</span>
            </div>
            <div class="result-item">
                <span class="result-label">Accuracy</span>
                <span class="result-value">${accuracy}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Errors</span>
                <span class="result-value">${errors}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Skill Level</span>
                <span class="result-value" style="color: ${levelColor};">${skillLevel}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>💡 Improvement Tips</h4>
            <p style="color: #666; margin: 0.5rem 0;">• Focus on accuracy first - speed comes naturally</p>
            <p style="color: #666; margin: 0.5rem 0;">• Keep your fingers on home row keys</p>
            <p style="color: #666; margin: 0.5rem 0;">• Practice regularly for 15-20 minutes daily</p>
            <p style="color: #666; margin: 0.5rem 0;">• Use proper posture and finger positioning</p>
        </div>
    `;
    
    document.getElementById('userInput').disabled = true;
    document.getElementById('typingTimer').textContent = 'Test Complete!';
};

ToolsApp.resetTypingTest = function() {
    clearInterval(this.typingTestData.timer);
    this.typingTestData.isActive = false;
    
    document.getElementById('userInput').value = '';
    document.getElementById('userInput').disabled = true;
    document.getElementById('startTest').style.display = 'inline-block';
    document.getElementById('resetTest').style.display = 'none';
    document.getElementById('typingTimer').textContent = '';
    document.getElementById('typingResults').innerHTML = '';
};

// Flashcard Generator
ToolsApp.getFlashcardHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="flashcardTopic">Study Topic</label>
                <input type="text" id="flashcardTopic" value="Math Formulas" placeholder="e.g., Spanish Vocabulary, History Dates">
            </div>
            
            <div id="flashcardsContainer">
                <h5>Flashcards</h5>
                <div class="flashcard-item" style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: start;">
                        <div class="form-group">
                            <label>Front (Question)</label>
                            <textarea class="card-front" rows="2" placeholder="What is the formula for area of a circle?">Area of Circle</textarea>
                        </div>
                        <div class="form-group">
                            <label>Back (Answer)</label>
                            <textarea class="card-back" rows="2" placeholder="π × r²">π × r²</textarea>
                        </div>
                        <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove(); ToolsApp.updateFlashcardCount();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 1rem 0;">
                <button type="button" class="btn btn-secondary" onclick="ToolsApp.addFlashcard()">Add Flashcard</button>
                <button type="button" class="btn" onclick="ToolsApp.generateFlashcards()">Generate Printable Cards</button>
            </div>
        </div>
        
        <div id="flashcardResults"></div>
    `;
};

ToolsApp.addFlashcard = function() {
    const container = document.getElementById('flashcardsContainer');
    const newCard = document.createElement('div');
    newCard.className = 'flashcard-item';
    newCard.style.cssText = 'background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;';
    newCard.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: start;">
            <div class="form-group">
                <label>Front (Question)</label>
                <textarea class="card-front" rows="2" placeholder="Enter question or term"></textarea>
            </div>
            <div class="form-group">
                <label>Back (Answer)</label>
                <textarea class="card-back" rows="2" placeholder="Enter answer or definition"></textarea>
            </div>
            <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove(); ToolsApp.updateFlashcardCount();" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-top: 1.5rem;">×</button>
        </div>
    `;
    container.appendChild(newCard);
    this.updateFlashcardCount();
};

ToolsApp.updateFlashcardCount = function() {
    const cardCount = document.querySelectorAll('.flashcard-item').length;
    // Update count display if needed
};

ToolsApp.generateFlashcards = function() {
    const topic = document.getElementById('flashcardTopic').value || 'Study Cards';
    const flashcards = document.querySelectorAll('.flashcard-item');
    let cardsHTML = '';
    
    flashcards.forEach((card, index) => {
        const front = card.querySelector('.card-front').value;
        const back = card.querySelector('.card-back').value;
        
        if (front.trim() && back.trim()) {
            cardsHTML += `
                <div class="flashcard-printable" style="page-break-inside: avoid; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div class="card-side" style="border: 2px solid #667eea; border-radius: 10px; padding: 2rem; min-height: 150px; background: white;">
                            <h5 style="margin: 0 0 1rem 0; color: #667eea;">Card ${index + 1} - Front</h5>
                            <p style="font-size: 1.1rem; margin: 0;">${front}</p>
                        </div>
                        <div class="card-side" style="border: 2px solid #764ba2; border-radius: 10px; padding: 2rem; min-height: 150px; background: #f8f9fa;">
                            <h5 style="margin: 0 0 1rem 0; color: #764ba2;">Card ${index + 1} - Back</h5>
                            <p style="font-size: 1.1rem; margin: 0;">${back}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    if (cardsHTML) {
        document.getElementById('flashcardResults').innerHTML = `
            <div class="results">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h4>${topic} - Flashcards</h4>
                    <button onclick="window.print()" class="btn">Print Cards</button>
                </div>
                ${cardsHTML}
                <div style="text-align: center; margin-top: 2rem;">
                    <p style="color: #666;">💡 <strong>Study Tips:</strong> Review cards daily, focus on difficult ones, and test yourself regularly</p>
                </div>
            </div>
        `;
    } else {
        document.getElementById('flashcardResults').innerHTML = `
            <div class="results">
                <p style="color: #e74c3c;">Please add at least one flashcard with both front and back content.</p>
            </div>
        `;
    }
};

// Reading Time Estimator
ToolsApp.getReadingTimeHTML = function() {
    return `
        <div class="calculator-form">
            <div class="form-group">
                <label for="readingSpeed">Reading Speed (words per minute)</label>
                <input type="number" id="readingSpeed" value="200" min="50" max="1000" step="25" oninput="ToolsApp.calculateReadingTime()">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
                    <button type="button" class="btn-small" onclick="ToolsApp.setReadingSpeed(150)">Slow (150)</button>
                    <button type="button" class="btn-small" onclick="ToolsApp.setReadingSpeed(200)">Average (200)</button>
                    <button type="button" class="btn-small" onclick="ToolsApp.setReadingSpeed(300)">Fast (300)</button>
                    <button type="button" class="btn-small" onclick="ToolsApp.setReadingSpeed(400)">Speed Reader (400)</button>
                </div>
            </div>
            
            <div class="form-group">
                <label for="textContent">Text to Analyze</label>
                <textarea id="textContent" rows="10" placeholder="Paste your text here to calculate reading time..." oninput="ToolsApp.calculateReadingTime()">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div class="form-group">
                    <label for="pageCount">Or Enter Page Count</label>
                    <input type="number" id="pageCount" value="" min="1" step="1" placeholder="Number of pages" oninput="ToolsApp.calculateFromPages()">
                    <small style="color: #666;">~250 words per page</small>
                </div>
                <div class="form-group">
                    <label for="wordCount">Or Enter Word Count</label>
                    <input type="number" id="wordCount" value="" min="1" step="1" placeholder="Total words" oninput="ToolsApp.calculateFromWords()">
                </div>
            </div>
        </div>
        
        <div id="readingTimeResults"></div>
    `;
};

ToolsApp.setReadingSpeed = function(speed) {
    const element = document.getElementById('readingSpeed');
    if (element) {
        element.value = speed;
        this.calculateReadingTime();
    }
};

ToolsApp.calculateFromPages = function() {
    const pageCountElement = document.getElementById('pageCount');
    const wordCountElement = document.getElementById('wordCount');
    const textContentElement = document.getElementById('textContent');
    
    if (!pageCountElement || !wordCountElement || !textContentElement) return;
    
    const pageCount = parseInt(pageCountElement.value);
    if (pageCount > 0) {
        const estimatedWords = pageCount * 250;
        wordCountElement.value = estimatedWords;
        textContentElement.value = `[${pageCount} pages × 250 words per page = ${estimatedWords} words]`;
        this.calculateReadingTime();
    }
};

ToolsApp.calculateFromWords = function() {
    const wordCountElement = document.getElementById('wordCount');
    const textContentElement = document.getElementById('textContent');
    
    if (!wordCountElement || !textContentElement) return;
    
    const wordCount = parseInt(wordCountElement.value);
    if (wordCount > 0) {
        textContentElement.value = `[${wordCount} words entered manually]`;
        this.calculateReadingTime();
    }
};

ToolsApp.calculateReadingTime = function() {
    // Check if elements exist before proceeding
    const readingSpeedElement = document.getElementById('readingSpeed');
    const textContentElement = document.getElementById('textContent');
    const wordCountElement = document.getElementById('wordCount');
    const resultsElement = document.getElementById('readingTimeResults');
    
    if (!readingSpeedElement || !textContentElement || !wordCountElement || !resultsElement) return;
    
    const readingSpeed = parseInt(readingSpeedElement.value) || 200;
    const textContent = textContentElement.value;
    const manualWordCount = parseInt(wordCountElement.value);
    
    let wordCount;
    if (manualWordCount > 0) {
        wordCount = manualWordCount;
    } else {
        wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    
    if (wordCount === 0) {
        resultsElement.innerHTML = '';
        return;
    }
    
    const readingTimeMinutes = wordCount / readingSpeed;
    const hours = Math.floor(readingTimeMinutes / 60);
    const minutes = Math.round(readingTimeMinutes % 60);
    
    // Calculate different reading speeds for comparison
    const slowTime = wordCount / 150;
    const averageTime = wordCount / 200;
    const fastTime = wordCount / 300;
    const speedTime = wordCount / 400;
    
    const formatTime = (totalMinutes) => {
        const h = Math.floor(totalMinutes / 60);
        const m = Math.round(totalMinutes % 60);
        if (h > 0) {
            return `${h}h ${m}m`;
        } else {
            return `${m}m`;
        }
    };
    
    // Text complexity analysis
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? (wordCount / sentences).toFixed(1) : 0;
    const avgCharsPerWord = textContent.length > 0 ? (textContent.replace(/\s/g, '').length / wordCount).toFixed(1) : 0;
    
    let complexity = 'Easy';
    let complexityColor = '#27ae60';
    if (avgWordsPerSentence > 20 || avgCharsPerWord > 6) {
        complexity = 'Difficult';
        complexityColor = '#e74c3c';
    } else if (avgWordsPerSentence > 15 || avgCharsPerWord > 5) {
        complexity = 'Moderate';
        complexityColor = '#f39c12';
    }
    
    resultsElement.innerHTML = `
        <div class="results">
            <h4>Reading Time Analysis</h4>
            <div class="result-item" style="border-top: 2px solid #667eea; font-weight: 600;">
                <span class="result-label">Reading Time (${readingSpeed} WPM)</span>
                <span class="result-value">${hours > 0 ? hours + 'h ' : ''}${minutes}m</span>
            </div>
            <div class="result-item">
                <span class="result-label">Word Count</span>
                <span class="result-value">${wordCount.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Character Count</span>
                <span class="result-value">${textContent.length.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Different Reading Speeds</h4>
            <div class="result-item">
                <span class="result-label">Slow Reader (150 WPM)</span>
                <span class="result-value">${formatTime(slowTime)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Average Reader (200 WPM)</span>
                <span class="result-value">${formatTime(averageTime)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Fast Reader (300 WPM)</span>
                <span class="result-value">${formatTime(fastTime)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Speed Reader (400 WPM)</span>
                <span class="result-value">${formatTime(speedTime)}</span>
            </div>
        </div>
        
        <div class="results mt-3">
            <h4>Text Complexity</h4>
            <div class="result-item">
                <span class="result-label">Difficulty Level</span>
                <span class="result-value" style="color: ${complexityColor};">${complexity}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Avg Words per Sentence</span>
                <span class="result-value">${avgWordsPerSentence}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Avg Characters per Word</span>
                <span class="result-value">${avgCharsPerWord}</span>
            </div>
        </div>
    `;
}; 