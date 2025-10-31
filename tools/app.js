// Extend ToolsApp Object with main functionality
Object.assign(ToolsApp, {
    currentTool: null,
    modal: null,
    
    init() {
        this.setupEventListeners();
        this.setupModal();
        this.setupSearch();
        this.setupNavigation();
    },

    setupEventListeners() {
        // Tool card clicks and keyboard navigation
        document.querySelectorAll('.tool-card').forEach(card => {
            // Make cards focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Open ${card.querySelector('h4').textContent} calculator`);
            
            const handleToolOpen = () => {
                this.lastFocusedElement = card;
                const toolName = card.dataset.tool;
                this.openTool(toolName);
            };
            
            card.addEventListener('click', handleToolOpen);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToolOpen();
                }
            });
        });

        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            });

            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    },

    setupModal() {
        this.modal = document.getElementById('toolModal');
        const closeBtn = document.getElementById('closeModal');
        
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    },

    setupSearch() {
        const searchInput = document.getElementById('searchTools');
        
        searchInput.addEventListener('input', (e) => {
            this.filterTools(e.target.value);
        });
    },

    setupNavigation() {
        // Smooth scrolling for navigation links
        const categoryLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        if (!categoryLinks.length) {
            return;
        }

        const activateLink = (activeLink) => {
            categoryLinks.forEach(link => link.classList.remove('active-category'));
            activeLink.classList.add('active-category');
        };

        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    activateLink(link);
                }
            });
        });

        // Mark the first category as active on load
        activateLink(categoryLinks[0]);
    },

    filterTools(searchTerm) {
        const toolCards = document.querySelectorAll('.tool-card');
        const categorySections = document.querySelectorAll('.category-section');
        
        searchTerm = searchTerm.toLowerCase().trim();
        
        // If no search term, show all tools
        if (!searchTerm) {
            toolCards.forEach(card => {
                card.style.display = 'block';
            });
            categorySections.forEach(section => {
                section.style.display = 'block';
            });
            return;
        }
        
        // Filter tools based on search term
        toolCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                card.classList.add('search-match');
            } else {
                card.style.display = 'none';
                card.classList.remove('search-match');
            }
        });

        // Show/hide categories based on whether they have visible tools
        categorySections.forEach(section => {
            const visibleCards = section.querySelectorAll('.tool-card[style*="block"]');
            if (visibleCards.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    },

    openTool(toolName) {
        this.currentTool = toolName;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        // Set title and load tool content
        const toolInfo = this.getToolInfo(toolName);
        modalTitle.textContent = toolInfo.title;
        
        // Show loading state
        modalBody.innerHTML = '<div class="loading"><div class="spinner"></div> Loading calculator...</div>';
        
        // Show modal with animation
        this.modal.style.display = 'block';
        this.modal.classList.remove('closing');
        this.modal.setAttribute('aria-hidden', 'false');
        // Force reflow
        this.modal.offsetHeight;
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Trap focus in modal
        this.trapFocus(this.modal);
        
        // Load content after animation starts
        setTimeout(() => {
            const content = typeof toolInfo.content === 'function' ? toolInfo.content() : toolInfo.content;
            const disclaimerNotice = `
                <div class="modal-disclaimer">
                    <i class="fas fa-info-circle"></i>
                    <span><strong>Educational Tool:</strong> Results are estimates only. <a href="terms-of-service.html" target="_blank">Always consult professionals</a> for important decisions.</span>
                </div>
            `;
            modalBody.innerHTML = disclaimerNotice + content;
            
            // Initialize tool-specific functionality
            this.initializeTool(toolName);
            
            // Show success notification
            this.showToast('Calculator loaded successfully!', 'success');
        }, 150);
    },

    closeModal() {
        // Add closing animation
        this.modal.classList.add('closing');
        this.modal.classList.remove('show');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('closing');
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            this.currentTool = null;
            
            // Return focus to triggering element
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
                this.lastFocusedElement = null;
            }
        }, 300);
    },
    
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show with animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    },
    
    validateForm(formElement) {
        let isValid = true;
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            const value = input.value.trim();
            
            // Remove existing validation classes and messages
            formGroup.classList.remove('error', 'success');
            const existingMessage = formGroup.querySelector('.error-message, .success-message');
            if (existingMessage) existingMessage.remove();
            
            if (!value) {
                this.showFieldError(formGroup, input, 'This field is required');
                isValid = false;
            } else if (input.type === 'number') {
                const num = parseFloat(value);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                
                if (isNaN(num)) {
                    this.showFieldError(formGroup, input, 'Please enter a valid number');
                    isValid = false;
                } else if (min !== undefined && num < min) {
                    this.showFieldError(formGroup, input, `Value must be at least ${min}`);
                    isValid = false;
                } else if (max !== undefined && num > max) {
                    this.showFieldError(formGroup, input, `Value must be no more than ${max}`);
                    isValid = false;
                } else {
                    this.showFieldSuccess(formGroup);
                }
            } else {
                this.showFieldSuccess(formGroup);
            }
        });
        
        return isValid;
    },
    
    showFieldError(formGroup, input, message) {
        formGroup.classList.add('error');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(errorMessage);
        
        // Focus on first error field
        if (!document.querySelector('.form-group.error input:focus')) {
            input.focus();
        }
    },
    
    showFieldSuccess(formGroup) {
        formGroup.classList.add('success');
    },
    
    addLoadingState(element, text = 'Loading...') {
        element.classList.add('loading');
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.innerHTML = `<div class="spinner"></div> ${text}`;
    },
    
    removeLoadingState(element) {
        element.classList.remove('loading');
        element.disabled = false;
        element.textContent = element.dataset.originalText || 'Submit';
        delete element.dataset.originalText;
    },
    
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
        
        // Handle tab trapping
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };
        
        element.addEventListener('keydown', handleTabKey);
        
        // Store handler for cleanup
        element._focusTrapHandler = handleTabKey;
    },

    getToolInfo(toolName) {
        const toolsData = {
            // Finance Tools
            'mortgage': {
                title: 'Mortgage Calculator',
                content: () => ToolsApp.getMortgageCalculatorHTML ? ToolsApp.getMortgageCalculatorHTML() : '<p>Loading...</p>'
            },
            'loan': {
                title: 'Loan Calculator',
                content: () => ToolsApp.getLoanCalculatorHTML ? ToolsApp.getLoanCalculatorHTML() : '<p>Loading...</p>'
            },
            'debt-snowball': {
                title: 'Debt Snowball Tool',
                content: () => ToolsApp.getDebtSnowballHTML ? ToolsApp.getDebtSnowballHTML() : '<p>Loading...</p>'
            },
            'compound-interest': {
                title: 'Compound Interest Calculator',
                content: () => ToolsApp.getCompoundInterestHTML ? ToolsApp.getCompoundInterestHTML() : '<p>Loading...</p>'
            },
            'budget': {
                title: 'Budget Planner',
                content: () => ToolsApp.getBudgetPlannerHTML ? ToolsApp.getBudgetPlannerHTML() : '<p>Loading...</p>'
            },
            'retirement': {
                title: 'Retirement Calculator',
                content: () => ToolsApp.getRetirementCalculatorHTML ? ToolsApp.getRetirementCalculatorHTML() : '<p>Loading...</p>'
            },
            'net-worth': {
                title: 'Net Worth Tracker',
                content: () => ToolsApp.getNetWorthHTML ? ToolsApp.getNetWorthHTML() : '<p>Loading...</p>'
            },
            'credit-payoff': {
                title: 'Credit Card Payoff Calculator',
                content: () => ToolsApp.getCreditPayoffHTML ? ToolsApp.getCreditPayoffHTML() : '<p>Loading...</p>'
            },
            'wage-converter': {
                title: 'Wage Converter',
                content: () => ToolsApp.getWageConverterHTML ? ToolsApp.getWageConverterHTML() : '<p>Loading...</p>'
            },
            'inflation': {
                title: 'Inflation Calculator',
                content: () => ToolsApp.getInflationCalculatorHTML ? ToolsApp.getInflationCalculatorHTML() : '<p>Loading...</p>'
            },
            
            // Real Estate Tools
            'rent-vs-buy': {
                title: 'Rent vs. Buy Analyzer',
                content: () => ToolsApp.getRentVsBuyHTML ? ToolsApp.getRentVsBuyHTML() : '<p>Loading...</p>'
            },
            'property-tax': {
                title: 'Property Tax Estimator',
                content: () => ToolsApp.getPropertyTaxHTML ? ToolsApp.getPropertyTaxHTML() : '<p>Loading...</p>'
            },
            'home-affordability': {
                title: 'Home Affordability Calculator',
                content: () => ToolsApp.getHomeAffordabilityHTML ? ToolsApp.getHomeAffordabilityHTML() : '<p>Loading...</p>'
            },
            'closing-costs': {
                title: 'Closing Costs Estimator',
                content: () => ToolsApp.getClosingCostsHTML ? ToolsApp.getClosingCostsHTML() : '<p>Loading...</p>'
            },
            
            // Business Tools
            'break-even': {
                title: 'Break-Even Calculator',
                content: () => ToolsApp.getBreakEvenHTML ? ToolsApp.getBreakEvenHTML() : '<p>Loading...</p>'
            },
            'roi': {
                title: 'ROI Calculator',
                content: () => ToolsApp.getROICalculatorHTML ? ToolsApp.getROICalculatorHTML() : '<p>Loading...</p>'
            },
            'invoice': {
                title: 'Invoice Generator',
                content: () => ToolsApp.getInvoiceGeneratorHTML ? ToolsApp.getInvoiceGeneratorHTML() : '<p>Loading...</p>'
            },
            'timecard': {
                title: 'Time Card Calculator',
                content: () => ToolsApp.getTimeCardHTML ? ToolsApp.getTimeCardHTML() : '<p>Loading...</p>'
            },
            'sales-tax': {
                title: 'Sales Tax Calculator',
                content: () => ToolsApp.getSalesTaxHTML ? ToolsApp.getSalesTaxHTML() : '<p>Loading...</p>'
            },
            'currency': {
                title: 'Currency Converter',
                content: () => ToolsApp.getCurrencyConverterHTML ? ToolsApp.getCurrencyConverterHTML() : '<p>Loading...</p>'
            },
            
            // Education Tools
            'gpa': {
                title: 'GPA Calculator',
                content: () => ToolsApp.getGPACalculatorHTML ? ToolsApp.getGPACalculatorHTML() : '<p>Loading...</p>'
            },
            'typing-test': {
                title: 'Typing Speed Test',
                content: () => ToolsApp.getTypingTestHTML ? ToolsApp.getTypingTestHTML() : '<p>Loading...</p>'
            },
            'flashcards': {
                title: 'Flashcard Generator',
                content: () => ToolsApp.getFlashcardHTML ? ToolsApp.getFlashcardHTML() : '<p>Loading...</p>'
            },
            'reading-time': {
                title: 'Reading Time Estimator',
                content: () => ToolsApp.getReadingTimeHTML ? ToolsApp.getReadingTimeHTML() : '<p>Loading...</p>'
            },
            
            // Daily Life Tools
            'calorie': {
                title: 'Calorie Calculator',
                content: () => ToolsApp.getCalorieCalculatorHTML ? ToolsApp.getCalorieCalculatorHTML() : '<p>Loading...</p>'
            },
            'macro': {
                title: 'Macro Tracker',
                content: () => ToolsApp.getMacroTrackerHTML ? ToolsApp.getMacroTrackerHTML() : '<p>Loading...</p>'
            },
            'water': {
                title: 'Water Intake Calculator',
                content: () => ToolsApp.getWaterIntakeHTML ? ToolsApp.getWaterIntakeHTML() : '<p>Loading...</p>'
            },
            'pregnancy': {
                title: 'Pregnancy Due Date Calculator',
                content: () => ToolsApp.getPregnancyCalculatorHTML ? ToolsApp.getPregnancyCalculatorHTML() : '<p>Loading...</p>'
            },
            'ovulation': {
                title: 'Ovulation Calendar',
                content: () => ToolsApp.getOvulationCalendarHTML ? ToolsApp.getOvulationCalendarHTML() : '<p>Loading...</p>'
            },
            
            // Tech Tools
            'password': {
                title: 'Password Generator',
                content: () => ToolsApp.getPasswordGeneratorHTML ? ToolsApp.getPasswordGeneratorHTML() : '<p>Loading...</p>'
            },
            'unit-converter': {
                title: 'Unit Converter',
                content: () => ToolsApp.getUnitConverterHTML ? ToolsApp.getUnitConverterHTML() : '<p>Loading...</p>'
            },
            'ip-lookup': {
                title: 'IP Address Lookup',
                content: () => ToolsApp.getIPLookupHTML ? ToolsApp.getIPLookupHTML() : '<p>Loading...</p>'
            },
            'qr-generator': {
                title: 'QR Code Generator',
                content: () => ToolsApp.getQRGeneratorHTML ? ToolsApp.getQRGeneratorHTML() : '<p>Loading...</p>'
            },
            'text-converter': {
                title: 'Text Case Converter',
                content: () => ToolsApp.getTextCaseConverterHTML ? ToolsApp.getTextCaseConverterHTML() : '<p>Loading...</p>'
            }
        };
        
        return toolsData[toolName] || { title: 'Tool Not Found', content: '<p>This tool is not implemented yet.</p>' };
    },

    initializeTool(toolName) {
        // Initialize tool-specific event listeners and functionality
        switch(toolName) {
            case 'mortgage':
                this.initMortgageCalculator();
                break;
            case 'loan':
                this.initLoanCalculator();
                break;
            case 'compound-interest':
                this.initCompoundInterestCalculator();
                break;
            case 'debt-snowball':
                // No special initialization needed
                break;
            case 'budget':
                // No special initialization needed
                break;
            case 'wage-converter':
                this.initWageConverter();
                break;
            case 'retirement':
                // No special initialization needed
                break;
            case 'net-worth':
                // Auto-calculate on load
                if (typeof this.calculateNetWorth === 'function') {
                    this.calculateNetWorth();
                }
                break;
            case 'credit-payoff':
                // Auto-calculate on load
                if (typeof this.calculateCreditPayoff === 'function') {
                    this.calculateCreditPayoff();
                }
                break;
            case 'inflation':
                // Auto-calculate on load
                if (typeof this.calculateInflation === 'function') {
                    this.calculateInflation();
                }
                break;
            case 'password':
                this.initPasswordGenerator();
                break;
            case 'unit-converter':
                this.initUnitConverter();
                break;
            case 'qr-generator':
                this.initQRGenerator();
                break;
            case 'text-converter':
                this.initTextConverter();
                break;
            case 'ip-lookup':
                this.initIPLookup();
                break;
            case 'rent-vs-buy':
                // Auto-calculate on load
                if (typeof this.calculateRentVsBuy === 'function') {
                    this.calculateRentVsBuy();
                }
                break;
            case 'property-tax':
                // Auto-calculate on load
                if (typeof this.calculatePropertyTax === 'function') {
                    this.calculatePropertyTax();
                }
                break;
            case 'home-affordability':
                // Auto-calculate on load
                if (typeof this.calculateHomeAffordability === 'function') {
                    this.calculateHomeAffordability();
                }
                break;
            case 'closing-costs':
                // Auto-calculate on load
                if (typeof this.calculateClosingCosts === 'function') {
                    this.calculateClosingCosts();
                }
                break;
            case 'break-even':
                // Business tools don't need auto-calculation, they show form first
                break;
            case 'roi':
                // Business tools don't need auto-calculation, they show form first
                break;
            case 'sales-tax':
                // Business tools don't need auto-calculation, they show form first
                break;
            case 'timecard':
                // Business tools don't need auto-calculation, they show form first
                break;
            case 'invoice':
                // Initialize invoice functionality
                if (typeof this.setupInvoiceCalculation === 'function') {
                    this.setupInvoiceCalculation();
                }
                break;
            case 'currency':
                // Currency converter shows form first, calculations on user input
                break;
            case 'gpa':
                // Initialize GPA calculator with delay to ensure DOM is ready
                if (typeof this.setupGPACalculation === 'function') {
                    setTimeout(() => this.setupGPACalculation(), 100);
                }
                break;
            case 'typing-test':
                // Initialize typing test
                this.typingTestData = {
                    isActive: false,
                    startTime: null,
                    duration: 60,
                    timer: null,
                    originalText: ''
                };
                break;
            case 'flashcards':
                // Auto-update flashcard count
                if (typeof this.updateFlashcardCount === 'function') {
                    this.updateFlashcardCount();
                }
                break;
            case 'reading-time':
                // Reading time calculator shows form first, calculations on user input
                break;
            case 'calorie':
                // Auto-calculate calories on load
                if (typeof this.calculateCalories === 'function') {
                    setTimeout(() => this.calculateCalories(), 100);
                }
                break;
            case 'macro':
                // Initialize macro tracking
                if (typeof this.updateMacroValues === 'function') {
                    setTimeout(() => this.updateMacroValues(), 100);
                }
                break;
            case 'water':
                // Auto-calculate water intake on load
                if (typeof this.calculateWaterIntake === 'function') {
                    setTimeout(() => this.calculateWaterIntake(), 100);
                }
                break;
            case 'pregnancy':
                // Initialize pregnancy calculator
                if (typeof this.togglePregnancyMethod === 'function') {
                    setTimeout(() => this.togglePregnancyMethod(), 100);
                }
                break;
            case 'ovulation':
                // Auto-calculate ovulation on load
                if (typeof this.calculateOvulation === 'function') {
                    setTimeout(() => this.calculateOvulation(), 100);
                }
                break;
            // Add more tool initializations as needed
        }
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ToolsApp.init();
}); 
