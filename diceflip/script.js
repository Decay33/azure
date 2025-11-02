const GAME_ID = 'diceflip';
const LOCAL_HS_KEY = 'flipDiceHighScore';

const signInLink = document.getElementById('sign-in-link');
const signOutLink = document.getElementById('sign-out-link');
const authStatus = document.getElementById('auth-status');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const leaderboardSelf = document.getElementById('leaderboard-self');
const selfRank = document.getElementById('self-rank');
const selfName = document.getElementById('self-name');
const selfScore = document.getElementById('self-score');
const selfUpdated = document.getElementById('self-updated');
const scoreboardMessage = document.getElementById('diceflip-signin-message');
const scoreboardCallout = document.getElementById('diceflip-signin-callout');

let currentUser = null;
let usingRemoteScores = false;
let leaderboardLoaded = false;
let authRetryCount = 0;
let remoteBestScore = 0;
let gameInstance = null;

let localHighScore = parseInt(localStorage.getItem(LOCAL_HS_KEY) || '0', 10);
if (!Number.isFinite(localHighScore)) {
    localHighScore = 0;
}

function sanitizeNameValue(raw) {
    if (!raw && raw !== 0) {
        return null;
    }
    let value = String(raw).trim();
    if (!value) {
        return null;
    }
    const atIndex = value.indexOf('@');
    if (atIndex > 0) {
        value = value.slice(0, atIndex);
    }
    value = value.split(/\s+/)[0];
    value = value.replace(/[^A-Za-z0-9_-]/g, '');
    if (!value) {
        return null;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function deriveFirstName(...candidates) {
    for (const candidate of candidates) {
        const sanitized = sanitizeNameValue(candidate);
        if (sanitized) {
            return sanitized;
        }
    }
    return 'Player';
}

function firstNameFromPrincipal(principal) {
    if (!principal) {
        return 'Player';
    }
    let nameClaim;
    if (Array.isArray(principal.claims)) {
        nameClaim = principal.claims.find((claim) => {
            const type = String(claim?.typ || '').toLowerCase();
            return type === 'name' || type === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
        });
    }
    return deriveFirstName(nameClaim?.val, principal.userDetails, principal.userId);
}

function firstNameFromEntry(entry) {
    if (!entry) {
        return 'Player';
    }
    return deriveFirstName(entry.displayName, entry.userId);
}

function formatUpdatedAt(isoString) {
    if (!isoString) {
        return '';
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const dateText = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeText = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return 'Updated ' + dateText + ' · ' + timeText;
}

function updateScoreboardMessage(text) {
    if (!scoreboardMessage) {
        return;
    }
    if (text) {
        scoreboardMessage.textContent = text;
        scoreboardMessage.classList.remove('hidden');
    } else {
        scoreboardMessage.classList.add('hidden');
    }
}

function setCalloutMessage(text) {
    if (!scoreboardCallout) {
        return;
    }
    if (text) {
        scoreboardCallout.textContent = text;
        scoreboardCallout.classList.remove('hidden');
    } else {
        scoreboardCallout.classList.add('hidden');
    }
}

function renderSelfEntry(entry, rank) {
    if (!leaderboardSelf || !selfRank || !selfName || !selfScore) {
        return;
    }
    if (currentUser && entry && Number.isFinite(entry.bestScore)) {
        leaderboardSelf.classList.remove('hidden');
        if (rank && Number.isFinite(rank)) {
            selfRank.textContent = '#' + rank;
        } else {
            selfRank.textContent = '—';
        }
        selfName.textContent = firstNameFromEntry(entry);
        selfScore.textContent = Number(entry.bestScore || 0).toLocaleString();
        if (selfUpdated) {
            const stamp = formatUpdatedAt(entry.updatedAt);
            if (stamp) {
                selfUpdated.textContent = stamp;
                selfUpdated.classList.remove('hidden');
            } else {
                selfUpdated.textContent = '';
                selfUpdated.classList.add('hidden');
            }
        }
    } else {
        leaderboardSelf.classList.add('hidden');
        if (selfUpdated) {
            selfUpdated.textContent = '';
        }
    }
}

function renderLeaderboard(entries, myEntry) {
    if (!leaderboardList || !leaderboardEmpty) {
        return;
    }
    leaderboardList.innerHTML = '';
    const emptyMessage = currentUser
        ? 'No scores yet. Finish a run to claim the top spot.'
        : 'Sign in to see the top rollers.';
    if (!entries || entries.length === 0) {
        leaderboardEmpty.textContent = emptyMessage;
        leaderboardEmpty.classList.remove('hidden');
        renderSelfEntry(myEntry, null);
        return;
    }
    leaderboardEmpty.classList.add('hidden');
    let detectedRank = null;
    entries.forEach(function (entry, index) {
        const li = document.createElement('li');

        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = index + 1;

        const name = document.createElement('span');
        name.className = 'player-name';
        name.textContent = firstNameFromEntry(entry);

        const scoreValue = document.createElement('span');
        scoreValue.className = 'score';
        scoreValue.textContent = Number(entry.bestScore || 0).toLocaleString();

        li.appendChild(rank);
        li.appendChild(name);
        li.appendChild(scoreValue);

        if (entry.updatedAt) {
            const meta = document.createElement('small');
            meta.textContent = formatUpdatedAt(entry.updatedAt);
            li.appendChild(meta);
        }

        if (currentUser && entry.userId === currentUser.userId) {
            li.classList.add('diceflip-me');
            detectedRank = index + 1;
        }

        leaderboardList.appendChild(li);
    });
    renderSelfEntry(myEntry, detectedRank);
}

function setLocalHighScore(value) {
    const numeric = Math.max(0, Math.round(Number(value) || 0));
    localHighScore = numeric;
    localStorage.setItem(LOCAL_HS_KEY, numeric.toString());
    if (gameInstance && typeof gameInstance.syncHighScore === 'function') {
        gameInstance.syncHighScore(numeric);
    }
}

function setRemoteHighScore(value) {
    const numeric = Math.max(0, Math.round(Number(value) || 0));
    remoteBestScore = numeric;
    if (numeric > localHighScore) {
        localHighScore = numeric;
        localStorage.setItem(LOCAL_HS_KEY, numeric.toString());
    }
    if (gameInstance && typeof gameInstance.syncHighScore === 'function') {
        gameInstance.syncHighScore(Math.max(localHighScore, numeric));
    }
}

async function getMe() {
    try {
        const response = await fetch('/.auth/me', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) {
            return null;
        }
        const payload = await response.json();
        return (payload && payload.clientPrincipal) || null;
    } catch (_error) {
        return null;
    }
}

function updateAuthUi(user) {
    if (user) {
        const displayName = firstNameFromPrincipal(user);
        if (signInLink) {
            signInLink.classList.add('hidden');
        }
        if (signOutLink) {
            signOutLink.classList.remove('hidden');
        }
        if (authStatus) {
            authStatus.innerHTML = 'Signed in as <strong>' + displayName + '</strong>.';
        }
        updateScoreboardMessage('Scores sync automatically after each game.');
        setCalloutMessage('');
    } else {
        if (signInLink) {
            signInLink.classList.remove('hidden');
        }
        if (signOutLink) {
            signOutLink.classList.add('hidden');
        }
        if (authStatus) {
            authStatus.innerHTML =
                'You&#39;re browsing as a guest. <a href="/.auth/login/google?post_login_redirect_uri=/diceflip/index.html">Sign in with Google</a> to record your high scores.';
        }
        updateScoreboardMessage('Sign in with Google to view the global leaderboard.');
        setCalloutMessage('Sign in to save your high scores to the global leaderboard.');
        renderSelfEntry(null, null);
    }
}

async function loadLeaderboard() {
    if (!currentUser) {
        renderLeaderboard([], null);
        return;
    }
    if (leaderboardEmpty) {
        leaderboardEmpty.textContent = 'Loading leaderboard...';
        leaderboardEmpty.classList.remove('hidden');
    }
    try {
        const response = await fetch('/api/scores?gameId=' + GAME_ID, { credentials: 'include', cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load scores');
        }
        const data = await response.json();
        const entries = (data && data.entries) || [];
        const myScore = data && data.myScore ? data.myScore : null;
        if (myScore && Number.isFinite(myScore.bestScore)) {
            setRemoteHighScore(myScore.bestScore);
        }
        renderLeaderboard(entries, myScore);
        leaderboardLoaded = true;
    } catch (error) {
        console.warn('Unable to load leaderboard', error);
        leaderboardLoaded = false;
        if (leaderboardEmpty) {
            leaderboardEmpty.textContent = 'Leaderboard unavailable right now.';
            leaderboardEmpty.classList.remove('hidden');
        }
    }
}

async function submitRemoteScore(score) {
    const response = await fetch('/api/scores', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: GAME_ID, score })
    });
    if (!response.ok) {
        throw new Error('Score submission failed');
    }
    const payload = await response.json();
    if (payload && Number.isFinite(payload.bestScore)) {
        setRemoteHighScore(payload.bestScore);
    }
    return payload;
}

async function bootstrapAuth() {
    currentUser = await getMe();
    updateAuthUi(currentUser);

    if (currentUser) {
        usingRemoteScores = true;
        authRetryCount = 0;
        if (!leaderboardLoaded) {
            await loadLeaderboard();
        } else {
            loadLeaderboard();
        }
        if (localHighScore > remoteBestScore) {
            try {
                await submitRemoteScore(localHighScore);
            } catch (error) {
                console.warn('Unable to sync local high score', error);
            }
        }
    } else {
        usingRemoteScores = false;
        renderLeaderboard([], null);
        leaderboardLoaded = false;
        if (authRetryCount < 2) {
            authRetryCount += 1;
            setTimeout(bootstrapAuth, 1500);
        }
    }
}

function processFinalScore(score) {
    if (!Number.isFinite(score) || score <= 0) {
        if (!usingRemoteScores) {
            setCalloutMessage('');
        }
        return;
    }
    if (usingRemoteScores && currentUser) {
        submitRemoteScore(score)
            .then(function (payload) {
                if (payload && payload.updated) {
                    setCalloutMessage('New high score saved to the cloud!');
                } else {
                    setCalloutMessage('');
                }
                loadLeaderboard();
            })
            .catch(function (error) {
                console.warn('Score submission failed', error);
                setCalloutMessage('Could not sync your score. We\'ll try again next time.');
            });
    } else {
        if (score > localHighScore) {
            setLocalHighScore(score);
            setCalloutMessage('New high score saved locally. Sign in to back it up.');
        } else {
            setCalloutMessage('');
        }
    }
}

// Game State
class FlipDiceGame {
    constructor() {
        this.board = [];
        this.score = 0;
        this.runningScore = 0;  // Total score across all levels
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.goalScore = 1000;
        this.baseArrows = { up: 3, down: 3, left: 3, right: 3 }; // Base arrow counts that increase every 3 levels
        this.arrows = { up: 3, down: 3, left: 3, right: 3 };
        this.selectedDice = null;
        this.isAnimating = false;
        this.moves = [];
        this.comboCount = 0;
        this.levelCompleting = false; // Flag to prevent multiple level completions
        
        // Power-up system
        this.powerups = {
            freeMove: 0,
            bomb3x3: 0,
            wildBomb: 0
        };
        this.selectedPowerup = null;
        this.powerupMode = false;
        
        // Game stats tracking
        this.gameStats = {
            matches3: 0,
            matches4: 0,
            matches5: 0,
            matches6Plus: 0,
            numbersMatched: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            }
        };
        
        // High score stats
        this.allTimeStats = this.loadAllTimeStats();
        
        // Dice skins system
        this.unlockedSkins = this.loadUnlockedSkins();
        this.currentSkin = this.loadCurrentSkin();
        
        // Initialize sound system
        this.soundSystem = new SoundSystem();
        
        // Hide game container initially
        document.querySelector('.game-container').style.display = 'none';
        
        // Start with start screen
        this.showStartScreen();
        this.bindStartScreenEvents();
        
        // Check for saved game and update continue button
        this.updateContinueButtonVisibility();
    }

    // Load all-time stats from localStorage
    loadAllTimeStats() {
        const saved = localStorage.getItem('flipDiceAllTimeStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            highestScore: 0,
            bestLevel: 1,
            totalGames: 0,
            bestMatches3: 0,
            bestMatches4: 0,
            bestMatches5: 0,
            bestMatches6Plus: 0,
            bestNumbersMatched: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            }
        };
    }

    // Save all-time stats to localStorage
    saveAllTimeStats() {
        localStorage.setItem('flipDiceAllTimeStats', JSON.stringify(this.allTimeStats));
    }

    // Update all-time stats with current game stats
    updateAllTimeStats() {
        // Update game count
        this.allTimeStats.totalGames++;
        
        // Update high scores
        if (this.runningScore > this.allTimeStats.highestScore) {
            this.allTimeStats.highestScore = this.runningScore;
        }
        
        if (this.level > this.allTimeStats.bestLevel) {
            this.allTimeStats.bestLevel = this.level;
        }
        
        // Update match records
        if (this.gameStats.matches3 > this.allTimeStats.bestMatches3) {
            this.allTimeStats.bestMatches3 = this.gameStats.matches3;
        }
        if (this.gameStats.matches4 > this.allTimeStats.bestMatches4) {
            this.allTimeStats.bestMatches4 = this.gameStats.matches4;
        }
        if (this.gameStats.matches5 > this.allTimeStats.bestMatches5) {
            this.allTimeStats.bestMatches5 = this.gameStats.matches5;
        }
        if (this.gameStats.matches6Plus > this.allTimeStats.bestMatches6Plus) {
            this.allTimeStats.bestMatches6Plus = this.gameStats.matches6Plus;
        }
        
        // Update number match records
        for (let num = 1; num <= 6; num++) {
            if (this.gameStats.numbersMatched[num] > this.allTimeStats.bestNumbersMatched[num]) {
                this.allTimeStats.bestNumbersMatched[num] = this.gameStats.numbersMatched[num];
            }
        }
        
        this.saveAllTimeStats();
        
        // Check for skin unlocks after updating stats
        this.checkSkinUnlocks();
    }

    // Show start screen
    showStartScreen() {
        document.getElementById('start-screen').classList.remove('hidden');
        document.body.classList.add('screen-active');
        document.querySelector('.game-container').style.display = 'none';
        this.updateStartScreenStats();
    }

    // Hide start screen
    hideStartScreen() {
        document.getElementById('start-screen').classList.add('hidden');
        document.body.classList.remove('screen-active');
    }

    // Update start screen with latest stats
    updateStartScreenStats() {
        document.getElementById('best-total-score').textContent = this.allTimeStats.highestScore;
        document.getElementById('best-level').textContent = this.allTimeStats.bestLevel;
        document.getElementById('total-games').textContent = this.allTimeStats.totalGames;
        document.getElementById('best-3-matches').textContent = this.allTimeStats.bestMatches3;
        document.getElementById('best-4-matches').textContent = this.allTimeStats.bestMatches4;
        document.getElementById('best-5-matches').textContent = this.allTimeStats.bestMatches5;
        document.getElementById('best-6-matches').textContent = this.allTimeStats.bestMatches6Plus;
        document.getElementById('best-ones-matched').textContent = this.allTimeStats.bestNumbersMatched[1];
        document.getElementById('best-twos-matched').textContent = this.allTimeStats.bestNumbersMatched[2];
        document.getElementById('best-threes-matched').textContent = this.allTimeStats.bestNumbersMatched[3];
        document.getElementById('best-fours-matched').textContent = this.allTimeStats.bestNumbersMatched[4];
        document.getElementById('best-fives-matched').textContent = this.allTimeStats.bestNumbersMatched[5];
        document.getElementById('best-sixes-matched').textContent = this.allTimeStats.bestNumbersMatched[6];
    }

    // Show enhanced game over screen
    showEnhancedGameOver() {
        // Check for new records
        const hasNewRecord = this.runningScore > this.highScore;
        
        // Update stats
        this.updateAllTimeStats();
        
        document.getElementById('enhanced-final-score').textContent = this.runningScore;
        document.getElementById('enhanced-level-reached').textContent = this.level;
        
        // Update game stats display
        document.getElementById('game-3-matches').textContent = this.gameStats.matches3;
        document.getElementById('game-4-matches').textContent = this.gameStats.matches4;
        document.getElementById('game-5-matches').textContent = this.gameStats.matches5;
        document.getElementById('game-6-matches').textContent = this.gameStats.matches6Plus;
        document.getElementById('game-ones-matched').textContent = this.gameStats.numbersMatched[1];
        document.getElementById('game-twos-matched').textContent = this.gameStats.numbersMatched[2];
        document.getElementById('game-threes-matched').textContent = this.gameStats.numbersMatched[3];
        document.getElementById('game-fours-matched').textContent = this.gameStats.numbersMatched[4];
        document.getElementById('game-fives-matched').textContent = this.gameStats.numbersMatched[5];
        document.getElementById('game-sixes-matched').textContent = this.gameStats.numbersMatched[6];
        
        // Show new record banner if applicable
        if (hasNewRecord) {
            document.getElementById('new-record').classList.remove('hidden');
        } else {
            document.getElementById('new-record').classList.add('hidden');
        }
        
        document.getElementById('enhanced-game-over').classList.remove('hidden');
        document.body.classList.add('screen-active');
        
        // Play game over sound
        this.soundSystem.playGameOver();
    }

    // Hide enhanced game over screen
    hideEnhancedGameOver() {
        document.getElementById('enhanced-game-over').classList.add('hidden');
        document.body.classList.remove('screen-active');
    }

    // Start new game
    startNewGame() {
        this.hideStartScreen();
        this.hideEnhancedGameOver();
        
        // Show game container
        document.querySelector('.game-container').style.display = 'block';
        
        // Clear any existing save when starting fresh
        this.clearSavedGame();
        
        // Reset all game state
        this.score = 0;
        this.runningScore = 0;
        this.level = 1;
        this.goalScore = 1000;
        this.baseArrows = { up: 3, down: 3, left: 3, right: 3 };
        this.arrows = { up: 3, down: 3, left: 3, right: 3 };
        this.moves = [];
        this.comboCount = 0;
        this.levelCompleting = false;
        
        // Reset power-ups
        this.resetPowerups();
        
        // Reset game stats
        this.gameStats = {
            matches3: 0,
            matches4: 0,
            matches5: 0,
            matches6Plus: 0,
            numbersMatched: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            }
        };
        
        this.initializeBoard();
        this.bindEvents();
        this.updateUI();
    }

    // Bind start screen events
    bindStartScreenEvents() {
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.startNewGame();
        });

        document.getElementById('continue-game-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.continueGame();
        });

        document.getElementById('view-stats-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('high-scores-panel').classList.remove('hidden');
        });

        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('how-to-play-panel').classList.remove('hidden');
        });

        document.getElementById('close-stats-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('high-scores-panel').classList.add('hidden');
        });

        document.getElementById('close-how-to-play-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('how-to-play-panel').classList.add('hidden');
        });

        document.getElementById('close-skins-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('dice-skins-panel').classList.add('hidden');
        });

        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.startNewGame();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.hideEnhancedGameOver();
            this.showStartScreen();
        });

        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.saveGameState();
        });

        document.getElementById('dice-skins-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            document.getElementById('dice-skins-panel').classList.remove('hidden');
            this.updateSkinsPanel();
        });

        // Skin selection handlers
        document.querySelectorAll('.skin-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skinName = btn.dataset.skin;
                this.selectSkin(skinName);
            });
        });
    }

    // Track match statistics
    trackMatchStats(matchGroups) {
        matchGroups.forEach(group => {
            const size = group.length;
            const number = this.board[group[0].row][group[0].col].top;
            
            // Track match size
            if (size === 3) {
                this.gameStats.matches3++;
            } else if (size === 4) {
                this.gameStats.matches4++;
            } else if (size === 5) {
                this.gameStats.matches5++;
            } else if (size >= 6) {
                this.gameStats.matches6Plus++;
            }
            
            // Track numbers matched
            this.gameStats.numbersMatched[number] += size;
        });
    }

    // Load high score from localStorage
    loadHighScore() {
        return Math.max(0, Number(localHighScore) || 0);
    }

    // Save high score to localStorage
    saveHighScore() {
        if (this.runningScore > this.highScore) {
            this.highScore = this.runningScore;
            localHighScore = this.highScore;
            localStorage.setItem(LOCAL_HS_KEY, this.highScore.toString());
        }
    }

    syncHighScore(value) {
        const numeric = Math.max(0, Number(value) || 0);
        if (numeric > this.highScore) {
            this.highScore = numeric;
            this.updateUI();
        } else if (numeric === 0 && this.highScore === 0) {
            this.updateUI();
        }
    }

    // Initialize 8x8 board with random dice
    initializeBoard() {
        this.board = [];
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = this.createRandomDice();
            }
        }
        this.renderBoard();
        // Ensure no initial matches
        while (this.findMatches().length > 0) {
            this.initializeBoard();
        }
        
        // Apply current skin to the board
        this.applySkinToBoard();
    }

    // Create a dice with random orientation
    createRandomDice() {
        // Standard dice: opposite faces sum to 7 (1-6, 2-5, 3-4)
        // Create multiple random orientations for more variety
        const orientations = [
            // Top = 1
            { top: 1, front: 2, right: 3, back: 5, left: 4, bottom: 6 },
            { top: 1, front: 3, right: 5, back: 4, left: 2, bottom: 6 },
            { top: 1, front: 4, right: 2, back: 3, left: 5, bottom: 6 },
            { top: 1, front: 5, right: 4, back: 2, left: 3, bottom: 6 },
            
            // Top = 2  
            { top: 2, front: 1, right: 4, back: 6, left: 3, bottom: 5 },
            { top: 2, front: 3, right: 1, back: 4, left: 6, bottom: 5 },
            { top: 2, front: 4, right: 6, back: 3, left: 1, bottom: 5 },
            { top: 2, front: 6, right: 3, back: 1, left: 4, bottom: 5 },
            
            // Top = 3
            { top: 3, front: 1, right: 2, back: 6, left: 5, bottom: 4 },
            { top: 3, front: 2, right: 6, back: 5, left: 1, bottom: 4 },
            { top: 3, front: 5, right: 1, back: 2, left: 6, bottom: 4 },
            { top: 3, front: 6, right: 5, back: 1, left: 2, bottom: 4 },
            
            // Top = 4
            { top: 4, front: 1, right: 5, back: 6, left: 2, bottom: 3 },
            { top: 4, front: 2, right: 1, back: 5, left: 6, bottom: 3 },
            { top: 4, front: 5, right: 6, back: 2, left: 1, bottom: 3 },
            { top: 4, front: 6, right: 2, back: 1, left: 5, bottom: 3 },
            
            // Top = 5
            { top: 5, front: 1, right: 3, back: 6, left: 4, bottom: 2 },
            { top: 5, front: 3, right: 6, back: 4, left: 1, bottom: 2 },
            { top: 5, front: 4, right: 1, back: 3, left: 6, bottom: 2 },
            { top: 5, front: 6, right: 4, back: 1, left: 3, bottom: 2 },
            
            // Top = 6
            { top: 6, front: 2, right: 4, back: 5, left: 3, bottom: 1 },
            { top: 6, front: 3, right: 2, back: 4, left: 5, bottom: 1 },
            { top: 6, front: 4, right: 5, back: 3, left: 2, bottom: 1 },
            { top: 6, front: 5, right: 3, back: 2, left: 4, bottom: 1 }
        ];
        
        return orientations[Math.floor(Math.random() * orientations.length)];
    }

    // Flip dice in specified direction
    flipDice(dice, direction) {
        const newDice = { ...dice };
        
        switch (direction) {
            case 'up':
                newDice.top = dice.front;
                newDice.front = dice.bottom;
                newDice.bottom = dice.back;
                newDice.back = dice.top;
                break;
            case 'down':
                newDice.top = dice.back;
                newDice.front = dice.top;
                newDice.bottom = dice.front;
                newDice.back = dice.bottom;
                break;
            case 'left':
                newDice.top = dice.right;
                newDice.right = dice.bottom;
                newDice.bottom = dice.left;
                newDice.left = dice.top;
                break;
            case 'right':
                newDice.top = dice.left;
                newDice.right = dice.top;
                newDice.bottom = dice.right;
                newDice.left = dice.bottom;
                break;
        }
        
        return newDice;
    }

    // Render the game board with 3D dice
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const diceElement = document.createElement('div');
                diceElement.className = 'dice';
                diceElement.dataset.row = row;
                diceElement.dataset.col = col;
                
                // Handle null values during board transitions
                if (this.board[row][col] !== null) {
                    const dice = this.board[row][col];
                    
                    // Create the 3D cube
                    const cubeElement = document.createElement('div');
                    cubeElement.className = 'dice-cube';
                    
                    // Create all 6 faces of the cube - map dice faces to cube positions
                    // The front face should show the dice.top (what player sees)
                    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
                    const faceValues = [
                        dice.top,    // front face shows the dice top (what user sees)
                        dice.bottom, // back face shows the dice bottom (opposite of top)
                        dice.right,  // right face shows dice right
                        dice.left,   // left face shows dice left  
                        dice.back,   // top face shows dice back
                        dice.front   // bottom face shows dice front
                    ];
                    
                    faces.forEach((face, index) => {
                        const faceElement = document.createElement('div');
                        faceElement.className = `dice-face ${face} color-${faceValues[index]}`;
                        
                        // Create dots container
                        const dotsContainer = document.createElement('div');
                        dotsContainer.className = `dice-dots dots-${faceValues[index]}`;
                        
                        // Create 9 dots (3x3 grid)
                        for (let i = 1; i <= 9; i++) {
                            const dot = document.createElement('div');
                            dot.className = `dice-dot dot-${i}`;
                            dotsContainer.appendChild(dot);
                        }
                        
                        faceElement.appendChild(dotsContainer);
                        cubeElement.appendChild(faceElement);
                    });
                    
                    diceElement.appendChild(cubeElement);
                } else {
                    diceElement.style.visibility = 'hidden';
                }
                
                gameBoard.appendChild(diceElement);
            }
        }
    }

    // Bind event listeners
    bindEvents() {
        const gameBoard = document.getElementById('game-board');
        
        // Dice selection with hover-based arrows
        gameBoard.addEventListener('click', (e) => {
            const diceElement = e.target.closest('.dice');
            if (diceElement && !this.isAnimating && diceElement.style.visibility !== 'hidden') {
                const row = parseInt(diceElement.dataset.row);
                const col = parseInt(diceElement.dataset.col);
                
                // Check if in power-up mode
                if (this.powerupMode && this.handlePowerupDiceClick(row, col)) {
                    return; // Power-up handled the click
                }
                
                this.selectDice(row, col);
            }
        });

        // Clear selection when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dice') && !e.target.closest('.dice-halo') && !e.target.closest('.game-board')) {
                this.clearSelection();
            }
        });

        // Game buttons
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.showHint();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.undoMove();
        });

        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.saveGameState();
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.nextLevel();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.soundSystem.playButtonClick();
            this.restart();
        });

        // Sound controls
        document.getElementById('sound-toggle').addEventListener('click', () => {
            const isEnabled = this.soundSystem.toggleSound();
            const button = document.getElementById('sound-toggle');
            button.textContent = isEnabled ? '🔊 Sound' : '🔇 Muted';
            this.soundSystem.playButtonClick();
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.soundSystem.setVolume(volume);
        });

        // Power-up selection handlers
        document.getElementById('free-move-powerup').addEventListener('click', () => {
            this.selectPowerup('free-move');
        });

        document.getElementById('bomb-3x3-powerup').addEventListener('click', () => {
            this.selectPowerup('bomb-3x3');
        });

        document.getElementById('wild-bomb-powerup').addEventListener('click', () => {
            this.selectPowerup('wild-bomb');
        });
    }

    // Select a dice and show arrows around it
    selectDice(row, col) {
        this.clearSelection();
        this.selectedDice = { row, col };
        
        // Play selection sound
        this.soundSystem.playArrowSelect();
        
        const diceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        diceElement.classList.add('selected');
        
        this.showArrowsAroundDice(diceElement, row, col);
    }

    // Clear dice selection and arrows
    clearSelection() {
        document.querySelectorAll('.dice.selected').forEach(dice => {
            dice.classList.remove('selected');
        });
        document.querySelectorAll('.dice-halo').forEach(halo => {
            halo.remove();
        });
        this.selectedDice = null;
    }

    // Show arrows around the selected dice - positioned relative to dice edges
    showArrowsAroundDice(diceElement, row, col) {
        const dice = this.board[row][col];
        const gameBoard = document.getElementById('game-board');
        
        // Get dice and game board positions using getBoundingClientRect for accuracy
        const diceRect = diceElement.getBoundingClientRect();
        const gameBoardRect = gameBoard.getBoundingClientRect();
        
        // Calculate dice position relative to game board
        const diceLeft = diceRect.left - gameBoardRect.left;
        const diceTop = diceRect.top - gameBoardRect.top;
        const diceWidth = diceRect.width;
        const diceHeight = diceRect.height;
        
        // Calculate dice edges
        const diceEdges = {
            top: diceTop,
            bottom: diceTop + diceHeight,
            left: diceLeft,
            right: diceLeft + diceWidth,
            centerX: diceLeft + diceWidth / 2,
            centerY: diceTop + diceHeight / 2
        };
        
        // Create halo container
        const haloContainer = document.createElement('div');
        haloContainer.className = 'dice-halo';
        haloContainer.style.position = 'absolute';
        haloContainer.style.pointerEvents = 'none';
        haloContainer.style.zIndex = '200';
        
        const directions = [
            { name: 'up', symbol: '↑' },
            { name: 'right', symbol: '→' },
            { name: 'down', symbol: '↓' },
            { name: 'left', symbol: '←' }
        ];
        
        directions.forEach(direction => {
            // Show the face that will actually become the new top after flip
            let previewValue;
            switch(direction.name) {
                case 'up':
                    previewValue = dice.front; // flipDice: newDice.top = dice.front
                    break;
                case 'down':
                    previewValue = dice.back; // flipDice: newDice.top = dice.back
                    break;
                case 'left':
                    previewValue = dice.right; // flipDice: newDice.top = dice.right
                    break;
                case 'right':
                    previewValue = dice.left; // flipDice: newDice.top = dice.left
                    break;
            }
            
            const arrowButton = document.createElement('div');
            arrowButton.className = `pie-section ${direction.name}`;
            arrowButton.dataset.direction = direction.name;
            
            // Position arrows relative to dice edges with fine-tuning adjustments
            const arrowSize = 45; // From CSS: .pie-section width/height = 45px
            const spacing = 8; // Gap between dice and arrows
            
            switch(direction.name) {
                case 'up':
                    arrowButton.style.left = (diceEdges.centerX - arrowSize/2 + 12) + 'px'; // Center horizontally + move right 12px
                    arrowButton.style.top = (diceEdges.top - arrowSize - spacing - 4) + 'px'; // Above top edge + move up 4px
                    break;
                case 'down':
                    arrowButton.style.left = (diceEdges.centerX - arrowSize/2 + 12) + 'px'; // Center horizontally + move right 12px
                    arrowButton.style.top = (diceEdges.bottom + spacing - 16) + 'px'; // Below bottom edge + move up 16px (final edge)
                    break;
                case 'left':
                    arrowButton.style.left = (diceEdges.left - arrowSize - spacing - 4) + 'px'; // Left of left edge + move left 4px
                    arrowButton.style.top = (diceEdges.centerY - arrowSize/2 + 12) + 'px'; // Center vertically + move down 12px
                    break;
                case 'right':
                    arrowButton.style.left = (diceEdges.right + spacing - 16) + 'px'; // Right of right edge + move left 16px (final edge)
                    arrowButton.style.top = (diceEdges.centerY - arrowSize/2 + 12) + 'px'; // Center vertically + move down 12px
                    break;
            }
            
            const arrowContent = document.createElement('div');
            arrowContent.className = 'pie-content';
            
            const arrowSymbol = document.createElement('span');
            arrowSymbol.className = 'pie-arrow';
            arrowSymbol.textContent = direction.symbol;
            
            const previewNum = document.createElement('span');
            previewNum.className = 'pie-number';
            previewNum.textContent = previewValue;
            
            arrowContent.appendChild(arrowSymbol);
            arrowContent.appendChild(previewNum);
            arrowButton.appendChild(arrowContent);
            
            // Disable if no arrows left and not in free move mode
            if (this.arrows[direction.name] <= 0 && this.selectedPowerup !== 'free-move') {
                arrowButton.classList.add('disabled');
            }
            
            // Add click handler
            arrowButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!arrowButton.classList.contains('disabled')) {
                    // Check if using free move power-up
                    if (this.selectedPowerup === 'free-move') {
                        this.useFreeMove(direction.name);
                    } else {
                        this.makeMove(direction.name);
                    }
                }
            });
            
            haloContainer.appendChild(arrowButton);
        });
        
        // Append to game board container
        gameBoard.appendChild(haloContainer);
    }

    // Make a move with 3D animation
    async makeMove(direction) {
        if (!this.selectedDice || this.arrows[direction] <= 0) return;
        
        this.isAnimating = true;
        const { row, col } = this.selectedDice;
        
        // Save move for undo
        this.moves.push({
            row, col,
            oldDice: { ...this.board[row][col] },
            direction,
            oldScore: this.score,
            oldArrows: { ...this.arrows }
        });
        
        // Use arrow
        this.arrows[direction]--;
        
        // Calculate the new dice state
        const newDice = this.flipDice(this.board[row][col], direction);
        
        // Add 3D flip animation based on direction
        const diceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        diceElement.classList.add(`flipping-${direction}`);
        
        // Play dice flip sound
        this.soundSystem.playDiceFlip();
        
        setTimeout(() => {
            // Update the dice data (after animation completes)
            this.board[row][col] = newDice;
            
            // Remove animation class and re-render the dice
            diceElement.classList.remove(`flipping-${direction}`);
            
            // Re-render just this dice with updated faces
            this.renderSingleDice(diceElement, row, col);
            
            this.clearSelection();
            this.updateUI();
            
            // Process matches
            this.processMatches();
        }, 600);
    }

    // Render a single dice with 3D cube
    renderSingleDice(diceElement, row, col) {
        const dice = this.board[row][col];
        
        // Clear existing content but preserve rotation
        const existingCube = diceElement.querySelector('.dice-cube');
        let currentRotation = '';
        if (existingCube) {
            // Get current transform to preserve rotation
            const style = window.getComputedStyle(existingCube);
            currentRotation = existingCube.style.transform || '';
        }
        
        diceElement.innerHTML = '';
        diceElement.className = 'dice';
        diceElement.dataset.row = row;
        diceElement.dataset.col = col;
        
        if (dice !== null) {
            // Create the 3D cube
            const cubeElement = document.createElement('div');
            cubeElement.className = 'dice-cube';
            
            // Always show dice.top on front face regardless of rotation
            const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
            const faceValues = [
                dice.top,    // front face always shows current top
                dice.bottom, // back face shows bottom
                dice.right,  // right face shows right
                dice.left,   // left face shows left  
                dice.back,   // top face shows back
                dice.front   // bottom face shows front
            ];
            
            faces.forEach((face, index) => {
                const faceElement = document.createElement('div');
                faceElement.className = `dice-face ${face} color-${faceValues[index]}`;
                
                // Create dots container
                const dotsContainer = document.createElement('div');
                dotsContainer.className = `dice-dots dots-${faceValues[index]}`;
                
                // Create 9 dots (3x3 grid)
                for (let i = 1; i <= 9; i++) {
                    const dot = document.createElement('div');
                    dot.className = `dice-dot dot-${i}`;
                    dotsContainer.appendChild(dot);
                }
                
                faceElement.appendChild(dotsContainer);
                cubeElement.appendChild(faceElement);
            });
            
            diceElement.appendChild(cubeElement);
        } else {
            diceElement.style.visibility = 'hidden';
        }
    }

    // Find matches on the board
    findMatches() {
        const matches = [];
        
        // Check horizontal matches
        for (let row = 0; row < 8; row++) {
            let count = 1;
            let current = this.board[row][0].top;
            let startCol = 0;
            
            for (let col = 1; col < 8; col++) {
                if (this.board[row][col].top === current) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let c = startCol; c < startCol + count; c++) {
                            matches.push({ row, col: c });
                        }
                    }
                    count = 1;
                    current = this.board[row][col].top;
                    startCol = col;
                }
            }
            
            if (count >= 3) {
                for (let c = startCol; c < startCol + count; c++) {
                    matches.push({ row, col: c });
                }
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < 8; col++) {
            let count = 1;
            let current = this.board[0][col].top;
            let startRow = 0;
            
            for (let row = 1; row < 8; row++) {
                if (this.board[row][col].top === current) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let r = startRow; r < startRow + count; r++) {
                            matches.push({ row: r, col });
                        }
                    }
                    count = 1;
                    current = this.board[row][col].top;
                    startRow = row;
                }
            }
            
            if (count >= 3) {
                for (let r = startRow; r < startRow + count; r++) {
                    matches.push({ row: r, col });
                }
            }
        }
        
        // Remove duplicates
        return matches.filter((match, index, self) => 
            index === self.findIndex(m => m.row === match.row && m.col === match.col)
        );
    }

    // Process matches and handle cascading
    async processMatches() {
        const matches = this.findMatches();
        
        if (matches.length === 0) {
            this.isAnimating = false;
            this.checkGameState();
            return;
        }
        
        // Calculate score
        const matchGroups = this.groupMatches(matches);
        
        // Track match statistics
        this.trackMatchStats(matchGroups);
        
        let totalScore = 0;
        
        matchGroups.forEach(group => {
            const size = group.length;
            let points = 0;
            
            if (size === 3) points = 100;
            else if (size === 4) points = 200;
            else if (size === 5) points = 400;
            else points = 400 + (size - 5) * 100;
            
            // Combo bonus
            points += this.comboCount * 50;
            totalScore += points;
            
            // Show score popup
            this.showScorePopup(group[0], points);
        });

        // Play match sound based on match size
        const maxMatchSize = Math.max(...matchGroups.map(g => g.length));
        this.soundSystem.playMatch(maxMatchSize);
        
        // Check for power-up earning: 5-in-a-row earns Free Move
        if (maxMatchSize >= 5) {
            this.powerups.freeMove++;
            this.soundSystem.playPowerupEarned();
            this.showPowerupNotification('Free Move Earned!');
        }
        
        this.score += totalScore;
        this.comboCount++;
        
        // Check for combo-based power-ups
        if (this.comboCount === 3) {
            this.powerups.bomb3x3++;
            this.soundSystem.playPowerupEarned();
            this.showPowerupNotification('3x3 Bomb Earned!');
        } else if (this.comboCount === 5) {
            this.powerups.wildBomb++;
            this.soundSystem.playPowerupEarned();
            this.showPowerupNotification('Wild Bomb Earned!');
        }
        
        // Show combo effect and play combo sound
        if (this.comboCount > 1) {
            this.soundSystem.playCombo(this.comboCount);
            this.showComboEffect();
        }
        
        // Animate matching dice
        matches.forEach(match => {
            const diceElement = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            diceElement.classList.add('matching');
        });
        
        setTimeout(async () => {
            // Remove matched dice
            matches.forEach(match => {
                this.board[match.row][match.col] = null;
            });
            
            // First drop the dice (this updates the board data)
            const diceMovements = await this.dropDice();
            
            // Play dice drop sound if there are movements
            if (diceMovements.length > 0) {
                this.soundSystem.playDiceDrop();
            }
            
            // Then immediately fill empty spaces with new dice before any rendering
            const newDicePositions = [];
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (this.board[row][col] === null) {
                        this.board[row][col] = this.createRandomDice();
                        newDicePositions.push({ row, col });
                    }
                }
            }
            
            // Now render the complete board with both dropped and new dice
            this.renderBoard();
            
            // Animate falling dice (existing dice that moved down)
            diceMovements.forEach(movement => {
                setTimeout(() => {
                    const diceElement = document.querySelector(`[data-row="${movement.row}"][data-col="${movement.col}"]`);
                    const cubeElement = diceElement ? diceElement.querySelector('.dice-cube') : null;
                    
                    if (cubeElement) {
                        // Calculate distance in pixels
                        const fallDistance = movement.distance * 60;
                        
                        // Set initial position
                        cubeElement.style.transform = `translateY(-${fallDistance}px)`;
                        cubeElement.style.transition = 'none';
                        
                        // Force reflow
                        cubeElement.offsetHeight;
                        
                        // Animate to final position
                        cubeElement.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        cubeElement.style.transform = 'translateY(0)';
                        
                        setTimeout(() => {
                            cubeElement.style.transition = '';
                            cubeElement.style.transform = '';
                        }, 500);
                    }
                }, 50);
            });
            
            // Animate new dice falling from above the board
            newDicePositions.forEach(pos => {
                setTimeout(() => {
                    const diceElement = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                    const cubeElement = diceElement ? diceElement.querySelector('.dice-cube') : null;
                    
                    if (cubeElement) {
                        // Calculate how far above the board this dice should start
                        // Start from above the visible board area
                        const startHeight = (8 - pos.row) * 60; // Distance from top of board + extra height above
                        
                        // Set initial position above the board
                        cubeElement.style.transform = `translateY(-${startHeight}px)`;
                        cubeElement.style.transition = 'none';
                        
                        // Force reflow
                        cubeElement.offsetHeight;
                        
                        // Animate falling to final position
                        cubeElement.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        cubeElement.style.transform = 'translateY(0)';
                        
                        setTimeout(() => {
                            cubeElement.style.transition = '';
                            cubeElement.style.transform = '';
                        }, 500);
                    }
                }, 50);
            });
            
            this.updateUI();
            
            // Check for more matches (chain reaction) - but only if level hasn't been completed
            setTimeout(() => {
                if (!this.levelCompleting) {
                    this.processMatches();
                }
            }, 500);
        }, 600);
    }

    // Group matches by connected regions
    groupMatches(matches) {
        const groups = [];
        const visited = new Set();
        
        matches.forEach(match => {
            const key = `${match.row},${match.col}`;
            if (visited.has(key)) return;
            
            const group = [];
            const queue = [match];
            visited.add(key);
            
            while (queue.length > 0) {
                const current = queue.shift();
                group.push(current);
                
                // Check adjacent matches
                matches.forEach(other => {
                    const otherKey = `${other.row},${other.col}`;
                    if (visited.has(otherKey)) return;
                    
                    const isAdjacent = 
                        (Math.abs(current.row - other.row) === 1 && current.col === other.col) ||
                        (Math.abs(current.col - other.col) === 1 && current.row === other.row);
                    
                    if (isAdjacent) {
                        queue.push(other);
                        visited.add(otherKey);
                    }
                });
            }
            
            groups.push(group);
        });
        
        return groups;
    }

    // Drop dice down to fill gaps
    async dropDice() {
        const diceMovements = []; // Track which dice actually move
        
        for (let col = 0; col < 8; col++) {
            const column = [];
            const originalPositions = [];
            
            // Collect non-null dice from bottom to top and track their original positions
            for (let row = 7; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    column.push(this.board[row][col]);
                    originalPositions.push(row);
                }
            }
            
            // Clear column
            for (let row = 0; row < 8; row++) {
                this.board[row][col] = null;
            }
            
            // Place dice from bottom up and track movements
            for (let i = 0; i < column.length; i++) {
                const newRow = 7 - i;
                const oldRow = originalPositions[i];
                this.board[newRow][col] = column[i];
                
                // Only track as movement if dice actually moved down
                if (newRow > oldRow) {
                    diceMovements.push({ row: newRow, col: col, distance: newRow - oldRow, oldRow: oldRow });
                }
            }
        }
        
        // Don't render board here - let processMatches handle rendering after filling
        return diceMovements; // Return movements for animation later
    }

    // Show score popup
    showScorePopup(position, points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        
        const diceElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
        const rect = diceElement.getBoundingClientRect();
        
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.top = rect.top + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }

    // Show combo effect
    showComboEffect() {
        const effect = document.createElement('div');
        effect.className = 'chain-effect';
        effect.textContent = `${this.comboCount}x COMBO!`;
        
        const container = document.getElementById('game-board-container');
        if (container) {
            container.appendChild(effect);
            
            setTimeout(() => effect.remove(), 1000);
        }
        
        // Update combo display
        const comboText = document.getElementById('combo-text');
        if (comboText) {
            comboText.textContent = `${this.comboCount}x Combo!`;
            setTimeout(() => {
                comboText.textContent = '';
            }, 2000);
        }
    }

    // Update UI elements
    updateUI() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('level-goal').textContent = this.goalScore;
        document.getElementById('current-level').textContent = this.level;
        
        // Update running score and high score displays
        const runningScoreElement = document.getElementById('running-score');
        if (runningScoreElement) {
            runningScoreElement.textContent = this.runningScore;
        }
        
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
        
        document.getElementById('arrows-up').textContent = this.arrows.up;
        document.getElementById('arrows-down').textContent = this.arrows.down;
        document.getElementById('arrows-left').textContent = this.arrows.left;
        document.getElementById('arrows-right').textContent = this.arrows.right;
        
        // Update button states
        document.getElementById('undo-btn').disabled = this.moves.length === 0;
        
        // Update power-up UI
        this.updatePowerupUI();
    }

    // Check game state (level complete, game over)
    checkGameState() {
        // Only check for level completion if we're not already in the process of completing a level
        if (this.score >= this.goalScore && !this.levelCompleting) {
            this.levelCompleting = true;
            this.levelComplete();
        } else if (this.getTotalArrows() === 0 && this.findMatches().length === 0 && !this.levelCompleting) {
            // Only check for game over if we're not completing a level
            this.gameOver();
        }
        
        // Reset combo count only if we're not completing a level
        if (!this.levelCompleting) {
            this.comboCount = 0;
        }
    }

    // Get total arrows remaining
    getTotalArrows() {
        return this.arrows.up + this.arrows.down + this.arrows.left + this.arrows.right;
    }

    // Level complete
    levelComplete() {
        const unusedArrows = this.getTotalArrows();
        const bonusPoints = unusedArrows * 10;
        this.score += bonusPoints;
        
        // Add level score to running score
        this.runningScore += this.score;
        this.saveHighScore();
        
        // Auto-save at level completion
        this.saveGameState();
        
        // Play level complete sound
        this.soundSystem.playLevelComplete();
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('bonus-points').textContent = bonusPoints;
        
        // Show running score in level complete dialog
        const runningScoreSpan = document.getElementById('running-score-display');
        if (runningScoreSpan) {
            runningScoreSpan.textContent = this.runningScore;
        }
        
        document.getElementById('level-complete').classList.remove('hidden');
    }

    // Game over
    gameOver() {
        // Add current level score to running score
        this.runningScore += this.score;
        this.saveHighScore();
        processFinalScore(this.runningScore);

        // Clear saved game on game over
        this.clearSavedGame();
        
        // Hide old game over dialog and show enhanced one
        document.getElementById('game-over').classList.add('hidden');
        
        // Show enhanced game over after a short delay
        setTimeout(() => {
            this.showEnhancedGameOver();
        }, 500);
    }

    // Next level - NEW ARROW PROGRESSION SYSTEM
    nextLevel() {
        this.level++;
        this.goalScore += 150;
        
        // Reset level score and level completion flag
        this.score = 0;
        this.levelCompleting = false;
        
        // Reset combo count for new level
        this.comboCount = 0;
        
        // Update base arrows every 3 levels (after completing levels 3, 6, 9, etc.)
        if (this.level > 1 && (this.level - 1) % 3 === 0) {
            const directions = ['up', 'down', 'left', 'right'];
            const randomDirection = directions[Math.floor(Math.random() * 4)];
            this.baseArrows[randomDirection]++;
        }
        
        // Reset arrows to current base
        this.arrows = { ...this.baseArrows };
        
        // Reset power-ups for new level
        this.resetPowerups();
        
        document.getElementById('level-complete').classList.add('hidden');
        this.initializeBoard();
        this.updateUI();
        
        // Auto-save after starting new level
        this.saveGameState();
    }

    // Restart game - NEW ARROW SYSTEM
    restart() {
        // Add current running score to high score before restart
        this.saveHighScore();
        
        this.score = 0;
        this.runningScore = 0;
        this.level = 1;
        this.goalScore = 1000;
        this.baseArrows = { up: 3, down: 3, left: 3, right: 3 }; // Reset base arrows to 3
        this.arrows = { up: 3, down: 3, left: 3, right: 3 };
        this.moves = [];
        this.comboCount = 0;
        this.levelCompleting = false;
        
        // Reset power-ups
        this.resetPowerups();
        
        // Reset game stats
        this.gameStats = {
            matches3: 0,
            matches4: 0,
            matches5: 0,
            matches6Plus: 0,
            numbersMatched: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            }
        };
        
        document.getElementById('game-over').classList.add('hidden');
        this.initializeBoard();
        this.updateUI();
    }

    // Undo last move
    undoMove() {
        if (this.moves.length === 0) return;
        
        const lastMove = this.moves.pop();
        this.board[lastMove.row][lastMove.col] = lastMove.oldDice;
        this.score = lastMove.oldScore;
        this.arrows = lastMove.oldArrows;
        
        // Play undo sound
        this.soundSystem.playUndo();
        
        this.renderBoard();
        this.updateUI();
    }

    // Show hint
    showHint() {
        // Find possible moves that create matches
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const directions = ['up', 'down', 'left', 'right'];
                
                for (const direction of directions) {
                    if (this.arrows[direction] <= 0) continue;
                    
                    // Simulate move
                    const originalDice = this.board[row][col];
                    this.board[row][col] = this.flipDice(originalDice, direction);
                    
                    const matches = this.findMatches();
                    
                    // Restore original
                    this.board[row][col] = originalDice;
                    
                    if (matches.length > 0) {
                        // Play hint sound
                        this.soundSystem.playHint();
                        
                        // Highlight hint
                        const diceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        diceElement.style.border = '3px solid #ffeb3b';
                        diceElement.style.boxShadow = '0 0 15px #ffeb3b';
                        
                        setTimeout(() => {
                            diceElement.style.border = '';
                            diceElement.style.boxShadow = '';
                        }, 2000);
                        
                        return;
                    }
                }
            }
        }
        
        // No hints found
        document.getElementById('combo-text').textContent = 'No obvious matches found!';
        setTimeout(() => {
            document.getElementById('combo-text').textContent = '';
        }, 2000);
    }

    // Power-up system methods
    selectPowerup(powerupType) {
        const powerupKey = this.getPowerupKey(powerupType);
        
        if (this.powerups[powerupKey] <= 0) return;
        
        // Deselect current power-up if same one clicked
        if (this.selectedPowerup === powerupType) {
            this.selectedPowerup = null;
            this.powerupMode = false;
            this.updatePowerupUI();
            return;
        }
        
        // Select new power-up
        this.selectedPowerup = powerupType;
        this.powerupMode = true;
        
        // Play selection sound
        this.soundSystem.playPowerupSelect();
        
        // Clear any dice selection when entering power-up mode
        this.clearSelection();
        
        this.updatePowerupUI();
        
        // Special handling for wild bomb (immediate effect)
        if (powerupType === 'wild-bomb') {
            this.useWildBomb();
        }
    }

    getPowerupKey(powerupType) {
        const keyMap = {
            'free-move': 'freeMove',
            'bomb-3x3': 'bomb3x3',
            'wild-bomb': 'wildBomb'
        };
        return keyMap[powerupType];
    }

    updatePowerupUI() {
        // Update power-up counts
        document.getElementById('free-move-count').textContent = this.powerups.freeMove;
        document.getElementById('bomb-3x3-count').textContent = this.powerups.bomb3x3;
        document.getElementById('wild-bomb-count').textContent = this.powerups.wildBomb;
        
        // Update power-up states
        const powerupTypes = ['free-move', 'bomb-3x3', 'wild-bomb'];
        
        powerupTypes.forEach(type => {
            const element = document.getElementById(`${type}-powerup`);
            const powerupKey = this.getPowerupKey(type);
            
            // Remove all state classes
            element.classList.remove('available', 'selected', 'disabled');
            
            if (this.powerups[powerupKey] > 0) {
                if (this.selectedPowerup === type) {
                    element.classList.add('selected');
                } else {
                    element.classList.add('available');
                }
            } else {
                element.classList.add('disabled');
            }
        });
    }

    showPowerupNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }

    // Handle dice click in power-up mode
    handlePowerupDiceClick(row, col) {
        if (!this.powerupMode || !this.selectedPowerup) return false;
        
        if (this.selectedPowerup === 'free-move') {
            // Select dice for free move
            this.selectDice(row, col);
            return true;
        } else if (this.selectedPowerup === 'bomb-3x3') {
            this.use3x3Bomb(row, col);
            return true;
        }
        
        return false;
    }

    // Use free move power-up (modified makeMove)
    useFreeMove(direction) {
        if (!this.selectedDice || this.selectedPowerup !== 'free-move') return;
        
        // Use the power-up
        this.powerups.freeMove--;
        this.selectedPowerup = null;
        this.powerupMode = false;
        
        // Play free move sound
        this.soundSystem.playFreeMoveUsed();
        
        // Make the move without using arrows - call makeMove directly
        this.isAnimating = true;
        const { row, col } = this.selectedDice;
        
        // Save move for undo
        this.moves.push({
            row, col,
            oldDice: { ...this.board[row][col] },
            direction,
            oldScore: this.score,
            oldArrows: { ...this.arrows }
        });
        
        // Don't use arrows for free move
        
        // Calculate the new dice state
        const newDice = this.flipDice(this.board[row][col], direction);
        
        // Add 3D flip animation based on direction
        const diceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        diceElement.classList.add(`flipping-${direction}`);
        
        // Play dice flip sound
        this.soundSystem.playDiceFlip();
        
        setTimeout(() => {
            // Update the dice data (after animation completes)
            this.board[row][col] = newDice;
            
            // Remove animation class and re-render the dice
            diceElement.classList.remove(`flipping-${direction}`);
            
            // Re-render just this dice with updated faces
            this.renderSingleDice(diceElement, row, col);
            
            this.clearSelection();
            this.updateUI();
            
            // Process matches
            this.processMatches();
        }, 600);
    }

    // Use 3x3 bomb power-up
    use3x3Bomb(row, col) {
        if (this.powerups.bomb3x3 <= 0) return;
        
        // Use the power-up
        this.powerups.bomb3x3--;
        this.selectedPowerup = null;
        this.powerupMode = false;
        
        // Play bomb explosion sound
        this.soundSystem.playBombExplosion();
        
        // Calculate 3x3 area around clicked position
        const bombPositions = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(7, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
                bombPositions.push({ row: r, col: c });
            }
        }
        
        // Calculate score for cleared dice
        let bombScore = 0;
        bombPositions.forEach(pos => {
            bombScore += 50; // 50 points per cleared dice
        });
        
        this.score += bombScore;
        this.showScorePopup({ row, col }, bombScore);
        
        // Clear the 3x3 area
        bombPositions.forEach(pos => {
            this.board[pos.row][pos.col] = null;
            const diceElement = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            diceElement.classList.add('matching');
        });
        
        setTimeout(async () => {
            // Process falling and new dice
            const diceMovements = await this.dropDice();
            
            // Fill empty spaces with new dice
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (this.board[r][c] === null) {
                        this.board[r][c] = this.createRandomDice();
                    }
                }
            }
            
            this.renderBoard();
            this.updateUI();
            this.updatePowerupUI();
            
            // Check for cascading matches - but only if level hasn't been completed
            setTimeout(() => {
                if (!this.levelCompleting) {
                    this.processMatches();
                }
            }, 500);
        }, 600);
    }

    // Use wild bomb power-up
    useWildBomb() {
        if (this.powerups.wildBomb <= 0) return;
        
        // Show number selection dialog
        const numbers = [1, 2, 3, 4, 5, 6];
        const availableNumbers = new Set();
        
        // Find which numbers are currently on the board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                availableNumbers.add(this.board[row][col].top);
            }
        }
        
        const availableNumbersArray = Array.from(availableNumbers).sort();
        
        if (availableNumbersArray.length === 0) {
            this.selectedPowerup = null;
            this.powerupMode = false;
            this.updatePowerupUI();
            return;
        }
        
        // Create selection dialog
        const dialog = document.createElement('div');
        dialog.className = 'number-selection-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Select number to clear:</h3>
                <div class="number-buttons">
                    ${availableNumbersArray.map(num => 
                        `<button class="number-btn" data-number="${num}">${num}</button>`
                    ).join('')}
                </div>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle number selection
        dialog.addEventListener('click', (e) => {
            if (e.target.classList.contains('number-btn')) {
                const selectedNumber = parseInt(e.target.dataset.number);
                this.executeWildBomb(selectedNumber);
                dialog.remove();
            } else if (e.target.classList.contains('cancel-btn')) {
                this.selectedPowerup = null;
                this.powerupMode = false;
                this.updatePowerupUI();
                dialog.remove();
            }
        });
    }

    executeWildBomb(targetNumber) {
        // Use the power-up
        this.powerups.wildBomb--;
        this.selectedPowerup = null;
        this.powerupMode = false;
        
        // Play wild bomb sound
        this.soundSystem.playWildBomb();
        
        // Find all dice with the target number
        const targetPositions = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col].top === targetNumber) {
                    targetPositions.push({ row, col });
                }
            }
        }
        
        // Calculate score
        const bombScore = targetPositions.length * 75; // 75 points per cleared dice
        this.score += bombScore;
        
        if (targetPositions.length > 0) {
            this.showScorePopup(targetPositions[0], bombScore);
        }
        
        // Clear all matching dice
        targetPositions.forEach(pos => {
            this.board[pos.row][pos.col] = null;
            const diceElement = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            diceElement.classList.add('matching');
        });
        
        setTimeout(async () => {
            // Process falling and new dice
            const diceMovements = await this.dropDice();
            
            // Fill empty spaces with new dice
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (this.board[row][col] === null) {
                        this.board[row][col] = this.createRandomDice();
                    }
                }
            }
            
            this.renderBoard();
            this.updateUI();
            this.updatePowerupUI();
            
            // Check for cascading matches - but only if level hasn't been completed
            setTimeout(() => {
                if (!this.levelCompleting) {
                    this.processMatches();
                }
            }, 500);
        }, 600);
    }

    // Reset power-ups for new level
    resetPowerups() {
        this.powerups = {
            freeMove: 0,
            bomb3x3: 0,
            wildBomb: 0
        };
        this.selectedPowerup = null;
        this.powerupMode = false;
        this.updatePowerupUI();
    }

    // Save/Load Game State Methods
    saveGameState() {
        const gameState = {
            board: this.board,
            score: this.score,
            runningScore: this.runningScore,
            level: this.level,
            goalScore: this.goalScore,
            baseArrows: this.baseArrows,
            arrows: this.arrows,
            powerups: this.powerups,
            gameStats: this.gameStats,
            timestamp: Date.now()
        };
        
        localStorage.setItem('flipDiceSavedGame', JSON.stringify(gameState));
        
        // Show save confirmation
        this.showSaveConfirmation();
    }

    loadGameState() {
        const saved = localStorage.getItem('flipDiceSavedGame');
        if (!saved) return false;
        
        try {
            const gameState = JSON.parse(saved);
            
            // Restore game state
            this.board = gameState.board;
            this.score = gameState.score;
            this.runningScore = gameState.runningScore;
            this.level = gameState.level;
            this.goalScore = gameState.goalScore;
            this.baseArrows = gameState.baseArrows;
            this.arrows = gameState.arrows;
            this.powerups = gameState.powerups;
            this.gameStats = gameState.gameStats;
            
            // Reset other game state
            this.selectedDice = null;
            this.isAnimating = false;
            this.moves = [];
            this.comboCount = 0;
            this.selectedPowerup = null;
            this.powerupMode = false;
            this.levelCompleting = false; // Always reset level completion state when loading
            
            return true;
        } catch (error) {
            console.error('Error loading saved game:', error);
            this.clearSavedGame();
            return false;
        }
    }

    hasSavedGame() {
        const saved = localStorage.getItem('flipDiceSavedGame');
        return saved !== null;
    }

    clearSavedGame() {
        localStorage.removeItem('flipDiceSavedGame');
        this.updateContinueButtonVisibility();
    }

    updateContinueButtonVisibility() {
        const continueBtn = document.getElementById('continue-game-btn');
        if (this.hasSavedGame()) {
            continueBtn.classList.remove('hidden');
        } else {
            continueBtn.classList.add('hidden');
        }
    }

    showSaveConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.innerHTML = `
            <span class="save-icon">💾</span>
            <span class="save-text">Game Saved!</span>
        `;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 2000);
    }

    // Continue saved game
    continueGame() {
        if (!this.loadGameState()) {
            // If load fails, start new game
            this.startNewGame();
            return;
        }
        
        this.hideStartScreen();
        this.hideEnhancedGameOver();
        
        // Show game container
        document.querySelector('.game-container').style.display = 'block';
        
        // Render the loaded board and update UI
        this.renderBoard();
        this.bindEvents();
        this.updateUI();
        
        // Play continue sound
        this.soundSystem.playButtonClick();
    }

    // Dice Skins System
    loadUnlockedSkins() {
        const saved = localStorage.getItem('flipDiceUnlockedSkins');
        if (saved) {
            return JSON.parse(saved);
        }
        return ['classic']; // Classic is always unlocked
    }

    saveUnlockedSkins() {
        localStorage.setItem('flipDiceUnlockedSkins', JSON.stringify(this.unlockedSkins));
    }

    loadCurrentSkin() {
        const saved = localStorage.getItem('flipDiceCurrentSkin');
        return saved || 'classic';
    }

    saveCurrentSkin() {
        localStorage.setItem('flipDiceCurrentSkin', this.currentSkin);
    }

    checkSkinUnlocks() {
        const skinUnlocks = {
            'pastel': 10,
            'neon': 25,
            'galaxy': 50
        };

        let newUnlocks = [];
        
        for (const [skin, requiredLevel] of Object.entries(skinUnlocks)) {
            if (this.allTimeStats.bestLevel >= requiredLevel && !this.unlockedSkins.includes(skin)) {
                this.unlockedSkins.push(skin);
                newUnlocks.push(skin);
            }
        }

        if (newUnlocks.length > 0) {
            this.saveUnlockedSkins();
            this.showSkinUnlockNotification(newUnlocks);
        }
    }

    showSkinUnlockNotification(newSkins) {
        newSkins.forEach((skin, index) => {
            setTimeout(() => {
                const skinNames = {
                    'pastel': 'Pastel Dreams',
                    'neon': 'Neon Glow',
                    'galaxy': 'Galaxy'
                };
                
                const notification = document.createElement('div');
                notification.className = 'skin-unlock-notification';
                notification.innerHTML = `
                    <span class="unlock-icon">🎨</span>
                    <span class="unlock-text">New Skin Unlocked: ${skinNames[skin]}!</span>
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }, index * 500);
        });
    }

    updateSkinsPanel() {
        const skinUnlocks = {
            'classic': 0,
            'pastel': 10,
            'neon': 25,
            'galaxy': 50
        };

        Object.keys(skinUnlocks).forEach(skin => {
            const skinItem = document.querySelector(`[data-skin="${skin}"]`);
            const statusElement = skinItem.querySelector('.skin-status');
            const buttonElement = skinItem.querySelector('.skin-select-btn');
            
            const isUnlocked = this.unlockedSkins.includes(skin);
            const isSelected = this.currentSkin === skin;
            
            if (isUnlocked) {
                statusElement.textContent = '✓ Unlocked';
                statusElement.className = 'skin-status unlocked';
                buttonElement.disabled = false;
                buttonElement.className = isSelected ? 'skin-select-btn selected' : 'skin-select-btn';
                buttonElement.textContent = isSelected ? 'Equipped' : 'Select';
            } else {
                statusElement.textContent = `🔒 Reach Level ${skinUnlocks[skin]}`;
                statusElement.className = 'skin-status locked';
                buttonElement.disabled = true;
                buttonElement.className = 'skin-select-btn locked';
                buttonElement.textContent = 'Locked';
            }
        });
    }

    selectSkin(skinName) {
        if (!this.unlockedSkins.includes(skinName)) return;
        
        this.currentSkin = skinName;
        this.saveCurrentSkin();
        this.updateSkinsPanel();
        this.applySkinToBoard();
        
        // Play skin selection sound
        this.soundSystem.playButtonClick();
    }

    applySkinToBoard() {
        const gameBoard = document.getElementById('game-board');
        
        // Remove all existing skin classes
        gameBoard.classList.remove('classic-skin', 'pastel-skin', 'neon-skin', 'galaxy-skin');
        
        // Add current skin class
        gameBoard.classList.add(`${this.currentSkin}-skin`);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new FlipDiceGame();
    if (localHighScore > 0) {
        gameInstance.syncHighScore(localHighScore);
    }
    bootstrapAuth();
});

window.addEventListener('focus', () => {
    authRetryCount = 0;
    bootstrapAuth();
});
