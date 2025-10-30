// ------------------------
// Get canvas and context
// ------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ------------------------
// Brushed Steel Background Generation (Static)
// ------------------------
function generateBrushedSteelPattern() {
  // Create an offscreen canvas for the pattern
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = canvas.width;
  patternCanvas.height = canvas.height;
  const pCtx = patternCanvas.getContext('2d');

  // Base color for brushed steel
  pCtx.fillStyle = "#707070";
  pCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  // Overlay horizontal strokes to simulate brushed steel
  for (let y = 0; y < patternCanvas.height; y++) {
    // Use a small random variation to mimic brushed texture
    const variation = Math.floor(Math.random() * 10) - 5; // -5 to +4
    const base = 112; // Base grey value
    let value = base + variation;
    value = Math.max(0, Math.min(255, value));
    pCtx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    pCtx.fillRect(0, y, patternCanvas.width, 1);
  }
  return patternCanvas;
}

const brushedSteelCanvas = generateBrushedSteelPattern();

// ------------------------
// Helper Functions for Visual Effects
// ------------------------
function getGradientColor(color) {
  switch (color) {
    case 'red':
      return ['#ff9999', '#cc0000'];
    case 'green':
      return ['#99ff99', '#00cc00'];
    case 'white':
      return ['#ffffff', '#aaaaaa'];
    default:
      return [color, color];
  }
}

function darkenColor(color) {
  switch (color) {
    case 'red':
      return '#b30000';
    case 'green':
      return '#004d00';
    case 'white':
      return '#dddddd';
    default:
      return color;
  }
}

// ------------------------
// Global Variables and Configuration
// ------------------------
const colors = ['white', 'green', 'red'];
let ship, barriers = [], bullets = [], powerUps = [];
let score = 0;
let highScore = 0;
let gameState = 'start';
let gameSpeed = 2;
let bulletSpeed = 3;
let barrierTimer = 0;
let bulletTimer = 0;
let powerUpTimer = 0;
const barrierSpawnTime = 100;  // Frames between barriers
const bulletSpawnTime = 50;    // Frames between bullets
const powerUpSpawnTime = 150;  // More frequent power-ups
const shipRadius = 15;
const keys = {};

// Dummy audio objects (no external files required)
const scoreSound = { play: () => {} };
const gameOverSound = { play: () => {} };
const powerUpSound = { play: () => {} };

// DOM elements
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const scoreMessage = document.getElementById('scoreMessage');
const restartButton = document.getElementById('restartButton');
const resetHighScoreButton = document.getElementById('resetHighScore');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const runnerSigninMessage = document.getElementById('runner-signin-message');
const signInLink = document.getElementById('sign-in-link');
const signOutLink = document.getElementById('sign-out-link');
const authStatus = document.getElementById('auth-status');

const GAME_ID = 'chromaticrunner';
const LOCAL_HS_KEY = 'chromatic-runner-local-best';

let currentUser = null;
let usingRemoteScores = false;
let leaderboardLoaded = false;
let authRetryCount = 0;
let localHighScore = parseInt(localStorage.getItem(LOCAL_HS_KEY) || '0', 10) || 0;

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

function showScoreMessage(text) {
  if (!scoreMessage) {
    return;
  }

  if (text) {
    scoreMessage.textContent = text;
    scoreMessage.classList.remove('hidden');
  } else {
    scoreMessage.classList.add('hidden');
  }
}

function updateHighScoreDisplay() {
  highScoreDisplay.textContent = highScore;
}

function setLocalHighScore(value) {
  localHighScore = Math.max(0, value);
  localStorage.setItem(LOCAL_HS_KEY, localHighScore.toString());
  highScore = localHighScore;
  updateHighScoreDisplay();
}

highScore = localHighScore;
updateHighScoreDisplay();

// ------------------------
// Authentication + Leaderboard helpers
// ------------------------
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
  if (!signInLink || !signOutLink || !authStatus) {
    return;
  }

  if (user) {
    const displayName = firstNameFromPrincipal(user);
    signInLink.classList.add('hidden');
    signOutLink.classList.remove('hidden');
    authStatus.innerHTML = 'Signed in as <strong>' + displayName + '</strong>.';
    if (runnerSigninMessage) {
      runnerSigninMessage.classList.add('hidden');
    }
  } else {
    signInLink.classList.remove('hidden');
    signOutLink.classList.add('hidden');
    authStatus.innerHTML = "You're browsing as a guest. <a href=\"/.auth/login/google?post_login_redirect_uri=/chromaticrunner/index.html\">Sign in with Google</a> to record your high scores.";
    if (runnerSigninMessage) {
      runnerSigninMessage.classList.remove('hidden');
    }
  }
}

function renderLeaderboard(entries) {
  if (!leaderboardList || !leaderboardEmpty) {
    return;
  }

  leaderboardList.innerHTML = '';
  const emptyMessage = currentUser ? 'No scores yet. Finish a run to claim the top spot.' : 'Sign in to see the top pilots.';

  if (!entries || entries.length === 0) {
    leaderboardEmpty.textContent = emptyMessage;
    leaderboardEmpty.classList.remove('hidden');
    return;
  }

  leaderboardEmpty.classList.add('hidden');
  entries.forEach(function(entry, index) {
    const li = document.createElement('li');

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = index + 1;

    const name = document.createElement('span');
    name.className = 'player';
    name.textContent = firstNameFromEntry(entry);

    const scoreValue = document.createElement('span');
    scoreValue.className = 'score';
    scoreValue.textContent = Number(entry.bestScore || 0).toLocaleString();

    li.appendChild(rank);
    li.appendChild(name);
    li.appendChild(scoreValue);

    if (currentUser && entry.userId === currentUser.userId) {
      li.classList.add('runner-me');
    }
    if (entry.updatedAt) {
      const meta = document.createElement('small');
      const date = new Date(entry.updatedAt);
      meta.textContent = 'Updated ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      li.appendChild(meta);
    }
    leaderboardList.appendChild(li);
  });
}

async function loadLeaderboard() {
  if (!currentUser) {
    renderLeaderboard([]);
    return;
  }

  if (leaderboardEmpty) {
    leaderboardEmpty.textContent = 'Loading leaderboard…';
    leaderboardEmpty.classList.remove('hidden');
  }

  try {
    const response = await fetch('/api/scores?gameId=' + GAME_ID, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to load scores');
    }
    const data = await response.json();
    renderLeaderboard((data && data.entries) || []);
    if (data && data.myScore && Number.isFinite(data.myScore.bestScore)) {
      highScore = data.myScore.bestScore;
      updateHighScoreDisplay();
    }
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

async function submitRemoteScore(value) {
  const response = await fetch('/api/scores', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId: GAME_ID, score: value })
  });

  if (!response.ok) {
    throw new Error('Failed to submit score');
  }

  return response.json();
}

async function bootstrapAuth() {
  currentUser = await getMe();
  updateAuthUi(currentUser);
  showScoreMessage("");

  if (currentUser) {
    authRetryCount = 0;
    usingRemoteScores = true;
    if (resetHighScoreButton) {
      resetHighScoreButton.classList.add('hidden');
    }
    await loadLeaderboard();
  } else {
    usingRemoteScores = false;
    if (resetHighScoreButton) {
      resetHighScoreButton.classList.remove('hidden');
    }
    renderLeaderboard([]);
    if (authRetryCount < 2) {
      authRetryCount += 1;
      setTimeout(bootstrapAuth, 1500);
    }
  }
}

// ------------------------
// Game Object Classes
// ------------------------
class Ship {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = (canvas.width - this.width) / 2;
    this.y = canvas.height - this.height - 10;
    this.colorIndex = 0;
    this.color = colors[this.colorIndex];
    this.speed = 5;
    this.invincible = false;
    this.invincibleTimer = 0;
  }

  draw(ctx) {
    ctx.save();
    
    // Ship body with enhanced visuals
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    
    // Create a more interesting ship shape
    const [colorTop, colorBottom] = getGradientColor(this.color);
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, colorTop);
    gradient.addColorStop(1, colorBottom);
    
    // Draw ship body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Add engine glow
    const engineGlow = ctx.createRadialGradient(
      this.x + this.width / 2, this.y + this.height, 0,
      this.x + this.width / 2, this.y + this.height, this.height / 2
    );
    engineGlow.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
    engineGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
    
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height, this.height / 2, 0, Math.PI, true);
    ctx.fill();
    
    // Add cockpit
    ctx.fillStyle = 'rgba(200, 200, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2, 
      this.y + this.height / 3, 
      this.width / 4, 
      this.height / 6, 
      0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Add invincibility effect
    if (this.invincible) {
      const time = Date.now() * 0.005;
      const shieldSize = Math.sin(time) * 5 + this.width + 10;
      
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2, 
        this.y + this.height / 2, 
        shieldSize / 2, 
        0, Math.PI * 2
      );
      ctx.stroke();
      
      // Add second shield ring
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2, 
        this.y + this.height / 2, 
        shieldSize / 2 + 5, 
        0, Math.PI * 2
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }

  update() {
    if (keys['ArrowLeft']) this.x -= this.speed;
    if (keys['ArrowRight']) this.x += this.speed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.invincible) {
      this.invincibleTimer -= 16.67;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }
  }

  changeColor() {
    this.colorIndex = (this.colorIndex + 1) % colors.length;
    this.color = colors[this.colorIndex];
  }

  activateInvincibility(duration) {
    this.invincible = true;
    this.invincibleTimer = duration;
  }
}

class Barrier {
  constructor() {
    this.height = 20;
    this.y = -20;
    this.width = canvas.width;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speed = gameSpeed;
  }

  draw(ctx) {
    ctx.save();
    
    // Enhanced barrier visuals
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    
    // Create a more interesting barrier pattern
    const [colorLight, colorDark] = getGradientColor(this.color);
    
    // Draw barrier with a pattern
    const patternSize = 20;
    const startX = 0;
    
    for (let x = startX; x < this.width; x += patternSize) {
      // Alternate colors for a pattern effect
      const useLight = Math.floor(x / patternSize) % 2 === 0;
      ctx.fillStyle = useLight ? colorLight : colorDark;
      
      const width = Math.min(patternSize, this.width - x);
      ctx.fillRect(x, this.y, width, this.height);
    }
    
    // Add glowing edge
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, this.y, this.width, this.height);
    
    // Add energy field effect
    if (ship && ship.invincible) {
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(0, this.y, this.width, this.height);
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }

  update() {
    this.y += this.speed;
  }
}

class Bullet {
  constructor(ship) {
    this.radius = 5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    const side = Math.floor(Math.random() * 3);
    if (side === 0) {
      this.x = Math.random() * canvas.width;
      this.y = 0;
    } else if (side === 1) {
      this.x = 0;
      this.y = Math.random() * canvas.height;
    } else {
      this.x = canvas.width;
      this.y = Math.random() * canvas.height;
    }
    const dx = (ship.x + ship.width / 2) - this.x;
    const dy = (ship.y + ship.height / 2) - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.vx = dist > 0 ? (dx / dist) * bulletSpeed : 0;
    this.vy = dist > 0 ? (dy / dist) * bulletSpeed : 0;
  }

  draw(ctx) {
    ctx.save();
    
    // Enhanced bullet visuals
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    
    // Create a more interesting bullet
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    
    // Get color based on bullet color
    let innerColor, outerColor;
    switch (this.color) {
      case 'red':
        innerColor = '#ff9999';
        outerColor = '#990000';
        break;
      case 'green':
        innerColor = '#99ff99';
        outerColor = '#006600';
        break;
      case 'white':
        innerColor = '#ffffff';
        outerColor = '#aaaaaa';
        break;
      default:
        innerColor = this.color;
        outerColor = darkenColor(this.color);
    }
    
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(1, outerColor);
    
    // Draw bullet core
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect
    const glowSize = this.radius * 2;
    const glow = ctx.createRadialGradient(
      this.x, this.y, this.radius * 0.8,
      this.x, this.y, glowSize
    );
    
    glow.addColorStop(0, this.color === 'white' ? 'rgba(255, 255, 255, 0.7)' : 
                         this.color === 'red' ? 'rgba(255, 0, 0, 0.7)' : 
                         'rgba(0, 255, 0, 0.7)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add trail effect
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5);
    ctx.lineWidth = this.radius;
    ctx.strokeStyle = this.color;
    ctx.stroke();
    
    // Add invincibility indicator
    if (ship && ship.invincible) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

class PowerUp {
  constructor() {
    this.radius = 10;
    this.x = Math.random() * (canvas.width - 20) + 10;
    this.y = Math.random() * (canvas.height / 2);
    this.color = 'gold';
    this.duration = 5000;
  }

  draw(ctx) {
    ctx.save();
    
    // Enhanced power-up visuals
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    
    // Pulsating effect
    const time = Date.now() * 0.003;
    const scale = Math.sin(time) * 0.2 + 1;
    const pulseRadius = this.radius * scale;
    
    // Create a more interesting power-up
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, pulseRadius
    );
    
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.3, 'gold');
    gradient.addColorStop(1, '#ff6600');
    
    // Draw power-up core
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add star shape
    ctx.beginPath();
    const spikes = 5;
    const outerRadius = pulseRadius * 1.5;
    const innerRadius = pulseRadius * 0.6;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * 2 * i) / (spikes * 2);
      const x = this.x + radius * Math.cos(angle);
      const y = this.y + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    // Create a gold gradient for the star
    const starGradient = ctx.createRadialGradient(
      this.x, this.y, innerRadius,
      this.x, this.y, outerRadius
    );
    starGradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    starGradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = starGradient;
    ctx.fill();
    
    // Add glow effect
    const glowSize = outerRadius * 2;
    const glow = ctx.createRadialGradient(
      this.x, this.y, outerRadius,
      this.x, this.y, glowSize
    );
    
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  update() {
    this.y += gameSpeed;
  }
}

// ------------------------
// Enhanced Start Screen and Visual Effects
// ------------------------
let particles = [];
let stars = [];
const PARTICLE_COUNT = 50;
const STAR_COUNT = 100;

class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 5 + 1;
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = (Math.random() - 0.5) * 3;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.8 + 0.2;
    this.fadeSpeed = 0.01;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= this.fadeSpeed;
    
    if (this.alpha <= 0) {
      this.reset();
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.twinkleSpeed = Math.random() * 0.05 + 0.01;
    this.alpha = Math.random();
    this.increasing = Math.random() > 0.5;
  }
  
  update() {
    if (this.increasing) {
      this.alpha += this.twinkleSpeed;
      if (this.alpha >= 1) {
        this.increasing = false;
      }
    } else {
      this.alpha -= this.twinkleSpeed;
      if (this.alpha <= 0.2) {
        this.increasing = true;
      }
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Initialize particles and stars
function initVisualEffects() {
  particles = [];
  stars = [];
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }
}

// Draw the enhanced start screen
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw space background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  stars.forEach(star => {
    star.update();
    star.draw(ctx);
  });
  
  // Draw particles
  particles.forEach(particle => {
    particle.update();
    particle.draw(ctx);
  });
  
  // Draw game logo
  ctx.save();
  
  // Logo shadow
  ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
  ctx.shadowBlur = 20;
  
  // Logo text
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText('CHROMATIC', canvas.width / 2, canvas.height / 4 - 20);
  
  ctx.fillStyle = '#00ff00';
  ctx.fillText('RUNNER', canvas.width / 2, canvas.height / 4 + 30);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ff0000';
  ctx.fillText('ENHANCED', canvas.width / 2, canvas.height / 4 + 60);
  ctx.restore();
  
  // Draw start button
  ctx.save();
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = (canvas.width - buttonWidth) / 2;
  const buttonY = canvas.height / 2;
  
  // Button glow effect
  const time = Date.now() * 0.001;
  const glowAmount = Math.sin(time * 2) * 0.5 + 0.5;
  ctx.shadowColor = `rgba(255, 255, 255, ${glowAmount})`;
  ctx.shadowBlur = 15;
  
  // Button gradient
  const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
  gradient.addColorStop(0, '#333');
  gradient.addColorStop(1, '#111');
  ctx.fillStyle = gradient;
  
  // Draw rounded button
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
  ctx.fill();
  
  // Button border
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Button text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PRESS ENTER TO START', canvas.width / 2, buttonY + buttonHeight / 2);
  ctx.restore();
  
  // Draw instructions
  ctx.save();
  ctx.font = '16px Arial';
  ctx.fillStyle = '#ccc';
  ctx.textAlign = 'center';
  
  const instructions = [
    'â† â†’ : Move Ship',
    'SPACE : Change Color',
    'Match colors with obstacles to survive',
    'Collect gold power-ups for invincibility'
  ];
  
  instructions.forEach((text, index) => {
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 100 + index * 30);
  });
  ctx.restore();
  
  // Draw animated ship preview
  const shipPreviewX = canvas.width / 2;
  const shipPreviewY = canvas.height - 100;
  const shipSize = 30;
  const time2 = Date.now() * 0.003;
  const colorIndex = Math.floor((time2 % 3));
  
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  
  const [colorTop, colorBottom] = getGradientColor(colors[colorIndex]);
  const shipGradient = ctx.createLinearGradient(
    shipPreviewX - shipSize/2, shipPreviewY - shipSize/2, 
    shipPreviewX - shipSize/2, shipPreviewY + shipSize/2
  );
  shipGradient.addColorStop(0, colorTop);
  shipGradient.addColorStop(1, colorBottom);
  
  ctx.fillStyle = shipGradient;
  ctx.fillRect(shipPreviewX - shipSize/2, shipPreviewY - shipSize/2, shipSize, shipSize);
  ctx.restore();
}

// Update the game over screen too
function drawGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw space background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  stars.forEach(star => {
    star.update();
    star.draw(ctx);
  });
  
  // Game Over text with glow
  ctx.save();
  ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
  ctx.shadowBlur = 20;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff0000';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);
  ctx.restore();
  
  // Score display
  ctx.save();
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
  
  // High score with special styling if it's a new high score
  if (score >= highScore && score > 0) {
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = 'rgba(255, 255, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillText(`NEW HIGH SCORE!`, canvas.width / 2, canvas.height / 2 + 10);
  }
  
  ctx.fillStyle = '#00ff00';
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
  ctx.restore();
  
  // Restart instructions
  ctx.save();
  const time = Date.now() * 0.001;
  const alpha = Math.sin(time * 3) * 0.4 + 0.6;
  ctx.globalAlpha = alpha;
  ctx.font = '20px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 100);
  ctx.restore();
}

// Update the game initialization to include visual effects
function initGame() {
  ship = new Ship();
  barriers = [];
  bullets = [];
  powerUps = [];
  score = 0;
  gameSpeed = 2;
  barrierTimer = 0;
  bulletTimer = 0;
  powerUpTimer = 0;
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  restartButton.style.display = 'none';
  scoreDisplay.textContent = score;
  showScoreMessage('');
  initVisualEffects();
}

// Initialize visual effects when the game starts
initVisualEffects();

// ------------------------
// Game Initialization & Loop
// ------------------------
function initGame() {
  ship = new Ship();
  barriers = [];
  bullets = [];
  powerUps = [];
  score = 0;
  gameSpeed = 2;
  barrierTimer = 0;
  bulletTimer = 0;
  powerUpTimer = 0;
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  restartButton.style.display = 'none';
  scoreDisplay.textContent = score;
  showScoreMessage('');
}

function gameLoop() {
  if (gameState === 'playing') {
    updateGame();
    drawGame();
  } else if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'game_over') {
    drawGameOverScreen();
  }
  requestAnimationFrame(gameLoop);
}

function updateGame() {
  ship.update();

  barriers.forEach((barrier, index) => {
    barrier.update();
    if (barrier.y + barrier.height >= ship.y && barrier.y <= ship.y + ship.height) {
      if (ship.invincible || ship.color === barrier.color) {
        barriers.splice(index, 1);
        score += 10;
        scoreSound.play();
      } else {
        endGame();
      }
    }
  });
  barriers = barriers.filter(barrier => barrier.y < canvas.height);

  bullets.forEach((bullet, index) => {
    bullet.update();
    const dx = bullet.x - (ship.x + ship.width / 2);
    const dy = bullet.y - (ship.y + ship.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bullet.radius + shipRadius) {
      if (ship.invincible || ship.color === bullet.color) {
        bullets.splice(index, 1);
        score += 5;
        scoreSound.play();
      } else {
        endGame();
      }
    }
  });
  bullets = bullets.filter(bullet =>
    bullet.x >= 0 && bullet.x <= canvas.width && bullet.y >= 0 && bullet.y <= canvas.height
  );

  powerUps.forEach((powerUp, index) => {
    powerUp.update();
    const dx = powerUp.x - (ship.x + ship.width / 2);
    const dy = powerUp.y - (ship.y + ship.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < powerUp.radius + shipRadius) {
      ship.activateInvincibility(powerUp.duration);
      powerUpSound.play();
      powerUps.splice(index, 1);
      score += 15;
    }
  });
  powerUps = powerUps.filter(powerUp => powerUp.y - powerUp.radius < canvas.height);

  barrierTimer++;
  if (barrierTimer >= barrierSpawnTime) {
    barriers.push(new Barrier());
    barrierTimer = 0;
    if (gameSpeed < 10) gameSpeed += 0.1;
  }

  bulletTimer++;
  if (bulletTimer >= bulletSpawnTime) {
    bullets.push(new Bullet(ship));
    bulletTimer = 0;
  }

  powerUpTimer++;
  if (powerUpTimer >= powerUpSpawnTime) {
    if (Math.random() < 0.5) {
      powerUps.push(new PowerUp());
    }
    powerUpTimer = 0;
  }

  scoreDisplay.textContent = score;
  showScoreMessage('');
}

function drawGame() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw space background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw some stars in the background (fewer than start screen for less distraction)
  for (let i = 0; i < STAR_COUNT / 3; i++) {
    const star = stars[i];
    star.update();
    star.draw(ctx);
  }
  
  // Draw a subtle grid pattern for depth
  drawGrid();
  
  // Draw game elements
  powerUps.forEach(powerUp => powerUp.draw(ctx));
  barriers.forEach(barrier => barrier.draw(ctx));
  bullets.forEach(bullet => bullet.draw(ctx));
  ship.draw(ctx);

  // Draw score during gameplay
  ctx.save();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#00ff00';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.restore();
}

// Add a grid pattern for depth perception
function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(50, 50, 50, 0.3)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function endGame() {
  gameState = 'game_over';
  if (usingRemoteScores && currentUser) {
    if (score > highScore) {
      highScore = score;
      updateHighScoreDisplay();
      showScoreMessage('New high score!');
    } else {
      showScoreMessage('');
    }
    submitRemoteScore(score)
      .then(function (payload) {
        if (payload && Number.isFinite(payload.bestScore)) {
          highScore = payload.bestScore;
          updateHighScoreDisplay();
        }
        if (payload && payload.updated) {
      loadLeaderboard();
      showScoreMessage('New high score!');
    } else if (!leaderboardLoaded) {
      loadLeaderboard();
    }
      })
      .catch(function (error) {
        console.warn('Score submission failed', error);
        showScoreMessage('');
      });
  } else if (score > localHighScore) {
    setLocalHighScore(score);
    showScoreMessage('New high score!');
  } else {
    showScoreMessage('');
  }
  gameOverSound.play();
  restartButton.style.display = 'inline-block';
}

// ------------------------
// Input Handlers
// ------------------------
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault();
  }

  if (gameState === 'start' && event.key === 'Enter') {
    initGame();
    gameState = 'playing';
    return;
  }

  if (gameState === 'game_over' && (event.key === 'r' || event.key === 'R')) {
    initGame();
    gameState = 'playing';
    return;
  }

  if (gameState === 'playing') {
    if (event.key === ' ') {
      ship.changeColor();
    } else {
      keys[event.key] = true;
    }
  }
});

document.addEventListener('keyup', function(event) {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault();
  }

  if (gameState === 'playing') {
    keys[event.key] = false;
  }
});

restartButton.addEventListener('click', function() {
  initGame();
  gameState = 'playing';
});

if (resetHighScoreButton) {
  resetHighScoreButton.addEventListener('click', function() {
    if (usingRemoteScores) {
      return;
    }
    setLocalHighScore(0);
  });
}

bootstrapAuth();
// Start the game loop
gameLoop();

window.addEventListener('focus', function() {
  authRetryCount = 0;
  bootstrapAuth();
});





















