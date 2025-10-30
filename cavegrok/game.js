const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Global game state variables
let score = 0;
let level = 1;
let gameState = "menu"; // States: "menu", "playing", "levelcomplete", "gameover", "win"
let landingScore = 0;
let levelCompleteStartTime = 0;
let levelStartTime = 0; // Will be set when the player first lifts off
let walls = [];     // Walls for the current level
let obstacles = []; // Obstacles for the current level

// New globals for enemy bullets, firing flag, and bonus info.
let enemyBullets = [];
let firingStarted = false; // Set true once player lifts off for the first time
let bonusMultiplier = 0;
let bonusPoints = 0;

// Add these global variables at the top if not already present
let stalactites = [];
let gems = [];
let gemsCollected = 0;

// Add these variables at the top for background
let backgroundGradient;
let stars = [];

// Add these global variables at the top
let hotPinkShipUnlocked = false; // Set to true when unlocked
let purpleShipUnlocked = false; // Unlocked at level 10
let goldenShipUnlocked = false; // Unlocked at level 20
let currentShip = "default"; // Can be "default", "hotpink", "purple", or "golden"
let scoreSubmittedForRun = false;

function reportCaveGrokRun(status) {
  if (scoreSubmittedForRun) {
    return;
  }
  scoreSubmittedForRun = true;
  if (window.caveGrok && typeof window.caveGrok.handleRunComplete === "function") {
    window.caveGrok.handleRunComplete({
      score,
      level,
      status
    });
  }
}

function markGameOver() {
  gameState = "gameover";
  reportCaveGrokRun("gameover");
}

function markGameWin() {
  gameState = "win";
  reportCaveGrokRun("win");
}

// Player object (position is center for rendering)
const player = {
  x: 100,
  y: 580,
  vx: 0,
  vy: 0,
  width: 20,
  height: 20,
  landed: true,
  crashed: false,
  prev_y: 580
};

// Physics constants
const vertical_thrust = 0.15;
const horizontal_thrust = 0.05;
const gravity = 0.1;
const max_tilt = Math.PI / 6;
const tilt_sensitivity = max_tilt / 5;
const crash_vertical_speed = 2;
const crash_horizontal_speed = 3;  // Allowed horizontal speed threshold

// Platforms: starting and landing.
const platforms = [
  { x: 50, y: 580, width: 100, height: 10, isStart: true },
  { x: 700, y: 580, width: 100, height: 10, isEnd: true }
];

// Key states (added Enter)
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  space: false,
  Enter: false
};

// Event listeners for controls.
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault(); // Prevents the default scrolling behavior
    keys.space = true;
  } else if (e.code === 'ArrowLeft') {
    keys.ArrowLeft = true;
  } else if (e.code === 'ArrowRight') {
    keys.ArrowRight = true;
  } else if (e.code === 'Enter') {
    keys.Enter = true;
  } else if (e.code === 'KeyS') {
    let availableShips = ['default'];
    if (hotPinkShipUnlocked) availableShips.push('hotpink');
    if (purpleShipUnlocked) availableShips.push('purple');
    if (goldenShipUnlocked) availableShips.push('golden');
    
    let currentIndex = availableShips.indexOf(currentShip);
    currentIndex = (currentIndex + 1) % availableShips.length;
    currentShip = availableShips[currentIndex];
    console.log("Switched to " + currentShip + " ship");
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
  else if (e.code === 'ArrowRight') keys.ArrowRight = false;
  else if (e.code === 'Space') keys.space = false;
  else if (e.code === 'Enter') keys.Enter = false;
});

// Add this event listener to prevent scrolling with arrow keys
window.addEventListener('keydown', function(e) {
    // Prevent scrolling for arrow keys and space
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

// Simple AABB collision detection.
function isColliding(rect1, rect2) {
  return !(rect1.x > rect2.x + rect2.width ||
           rect1.x + rect1.width < rect2.x ||
           rect1.y > rect2.y + rect2.height ||
           rect1.y + rect1.height < rect2.y);
}

// Custom drawing functions for obstacles.
function drawFloatingShip(ob) {
  ctx.save();
  ctx.translate(ob.x, ob.y);
  
  // Draw sleek blue fighter ship
  // Ship body
  ctx.fillStyle = '#0066CC';
  ctx.beginPath();
  ctx.moveTo(0, ob.height/2);
  ctx.lineTo(ob.width, ob.height/2);
  ctx.lineTo(ob.width * 0.8, 0);
  ctx.lineTo(ob.width * 0.2, 0);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = '#88CCFF';
  ctx.beginPath();
  ctx.ellipse(ob.width/2, ob.height/4, ob.width/5, ob.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wings
  ctx.fillStyle = '#003366';
  ctx.beginPath();
  ctx.moveTo(ob.width * 0.2, ob.height/2);
  ctx.lineTo(0, ob.height);
  ctx.lineTo(ob.width * 0.3, ob.height/2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(ob.width * 0.8, ob.height/2);
  ctx.lineTo(ob.width, ob.height);
  ctx.lineTo(ob.width * 0.7, ob.height/2);
  ctx.closePath();
  ctx.fill();
  
  // Engine glow
  let glowIntensity = 0.5 + Math.sin(Date.now() / 200) * 0.5;
  ctx.fillStyle = `rgba(0, 200, 255, ${glowIntensity})`;
  ctx.beginPath();
  ctx.arc(ob.width/2, ob.height * 0.7, ob.width/8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawFloatingRock(ob) {
  ctx.save();
  ctx.translate(ob.x, ob.y);
  
  // Draw red fighter ship
  // Ship body
  ctx.fillStyle = '#CC0000';
  ctx.beginPath();
  ctx.moveTo(ob.width/2, 0);
  ctx.lineTo(ob.width, ob.height/2);
  ctx.lineTo(ob.width/2, ob.height);
  ctx.lineTo(0, ob.height/2);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = '#FFAAAA';
  ctx.beginPath();
  ctx.ellipse(ob.width/2, ob.height/2, ob.width/4, ob.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Details
  ctx.strokeStyle = '#880000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ob.width/4, ob.height/4);
  ctx.lineTo(ob.width * 3/4, ob.height/4);
  ctx.moveTo(ob.width/4, ob.height * 3/4);
  ctx.lineTo(ob.width * 3/4, ob.height * 3/4);
  ctx.stroke();
  
  // Engine glow
  let glowIntensity = 0.5 + Math.sin(Date.now() / 150) * 0.5;
  ctx.fillStyle = `rgba(255, 100, 0, ${glowIntensity})`;
  ctx.beginPath();
  ctx.arc(ob.width/2, ob.height * 0.8, ob.width/6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawHill(ob) {
  ctx.save();
  ctx.translate(ob.x, ob.y);
  
  // Draw green fighter ship
  // Ship body
  ctx.fillStyle = '#00AA00';
  ctx.beginPath();
  ctx.moveTo(0, ob.height/2);
  ctx.lineTo(ob.width/4, 0);
  ctx.lineTo(ob.width * 3/4, 0);
  ctx.lineTo(ob.width, ob.height/2);
  ctx.lineTo(ob.width * 3/4, ob.height);
  ctx.lineTo(ob.width/4, ob.height);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = '#AAFFAA';
  ctx.beginPath();
  ctx.ellipse(ob.width/2, ob.height/2, ob.width/5, ob.height/4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Weapon pods
  ctx.fillStyle = '#006600';
  ctx.beginPath();
  ctx.arc(ob.width/4, ob.height/2, ob.width/8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(ob.width * 3/4, ob.height/2, ob.width/8, 0, Math.PI * 2);
  ctx.fill();
  
  // Add blinking light if about to fire
  if (ob.nextShot - Date.now() < 1000) {
    let blinkRate = Math.floor(Date.now() / 100) % 2;
    if (blinkRate === 0) {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(ob.width/2, ob.height/2, ob.width/10, 0, Math.PI*2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// Set up the current level.
function setupLevel(lvl) {
  console.log('Setting up level:', lvl);
  let levelData = levels[lvl - 1];
  
  // Set up platforms with balanced positioning
  if (levelData.startPlatform) {
    platforms[0].x = levelData.startPlatform.x;
    platforms[0].y = levelData.startPlatform.y;
    platforms[0].width = levelData.startPlatform.width;
    platforms[0].height = levelData.startPlatform.height;
  }
  
  // Balance landing platform position to match start platform's distance from edge
  platforms[1].width = levelData.landingPlatform.width;
  platforms[1].height = levelData.landingPlatform.height;
  platforms[1].y = levelData.landingPlatform.y;
  
  // Set x position to be same distance from right edge as start platform is from left
  platforms[1].x = canvas.width - platforms[0].x - platforms[1].width;

  // Determine corridor parameters.
  let cellSize = levelData.wallParams.cellSize;
  let startCell = {
    x: Math.floor((platforms[0].x + platforms[0].width / 2) / cellSize),
    y: Math.floor((platforms[0].y + platforms[0].height / 2) / cellSize)
  };
  let endCell = {
    x: Math.floor((platforms[1].x + platforms[1].width / 2) / cellSize),
    y: Math.floor((platforms[1].y + platforms[1].height / 2) / cellSize)
  };
  let corridorWidth = (lvl === 1) ? 2 : 1;
  
  let wallParamsWithCorridor = Object.assign({}, levelData.wallParams, {
    corridor: { start: startCell, end: endCell, width: corridorWidth }
  });
  
  walls = generateWallsForLevel(wallParamsWithCorridor);

  const cushion = player.width * 3;
  walls = walls.filter(wall => {
    let platformClearance = [
      { x: platforms[0].x - cushion, y: platforms[0].y - cushion, width: platforms[0].width + 2*cushion, height: platforms[0].height + 2*cushion },
      { x: platforms[1].x - cushion, y: platforms[1].y - cushion, width: platforms[1].width + 2*cushion, height: platforms[1].height + 2*cushion }
    ];
    for (let p of platformClearance) {
      if (isColliding(wall, p)) return false;
    }
    return true;
  });

  let safeUpperBound = platforms[0].y - player.height/2 - 5;
  obstacles = levelData.obstacles ? levelData.obstacles.map(ob => Object.assign({}, ob)) : [];
  obstacles.forEach(ob => {
    if (ob.type === "floatingShip" || ob.type === "floatingRock" || ob.type === "hill") {
      ob.y = Math.random() * safeUpperBound;
    } else if (typeof ob.y === 'undefined' || ob.y === null) {
      ob.y = platforms[0].y - ob.height - 5;
    }
    if (ob.type === "hill") {
      ob.width = 40;
      ob.height = 20;
      ob.nextShot = Date.now() + 5000;
      if (typeof ob.vx === 'undefined') {
        ob.vx = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5);
      }
    }
  });
  enemyBullets = [];
  firingStarted = false;
  resetPlayer();
  levelStartTime = 0;

  // Generate stalactites (only at the very top of the canvas)
  stalactites = [];
  // Adjust stalactite count based on level: 1-5 → 1, 6-10 → 2, etc.
  let stalactiteCount = Math.min(Math.ceil(lvl/5), 5);
  
  for (let i = 0; i < stalactiteCount; i++) {
    let x = 100 + Math.random() * (canvas.width - 200);
    
    // Skip stalactites above the launch pad
    if (x > platforms[0].x - 50 && x < platforms[0].x + platforms[0].width + 50) {
      continue;
    }
    
    // Place stalactites at the very top of the canvas
    let y = 0;
    
    stalactites.push({
      x: x,
      y: y,
      width: 20,
      height: 30,
      falling: false,
      fallSpeed: 0
    });
  }

  // Generate gems (quantity based on level)
  gems = [];
  let gemCount = Math.min(Math.ceil(lvl/5), 5); // 1 gem for levels 1-5, 2 for 6-10, etc.
  for (let i = 0; i < gemCount; i++) {
    let x = 100 + Math.random() * (canvas.width - 200);
    let y = 100 + Math.random() * (canvas.height - 300);
    
    // Check if position is clear of walls
    let isClear = true;
    for (let wall of walls) {
      if (Math.abs(x - wall.x) < 20 && Math.abs(y - wall.y) < 20) {
        isClear = false;
        break;
      }
    }
    
    if (isClear) {
      gems.push({
        x: x,
        y: y,
        radius: 8,
        collected: false,
        rotationAngle: Math.random() * Math.PI * 2, // Random starting rotation
        value: 1
      });
    }
  }

  // Reset gems collected counter
  gemsCollected = 0;
}

// Reset player.
function resetPlayer() {
  player.landed = true;
  player.crashed = false;
  player.vx = 0;
  player.vy = 0;
  player.x = platforms[0].x + platforms[0].width/2 - player.width/2;
  player.y = platforms[0].y - player.height/2;
  player.prev_y = player.y;
}

// Update obstacles.
function updateObstacles() {
  obstacles.forEach(ob => {
    if (ob.vx) {
      ob.x += ob.vx;
      if (ob.x < 0 || ob.x + ob.width > canvas.width) {
        ob.vx *= -1;
      }
    }
    if (ob.type === "hill") {
      if (firingStarted && Date.now() >= ob.nextShot) {
        const bulletSpeed = 3;
        const obCenterX = ob.x + ob.width/2;
        const obCenterY = ob.y + ob.height/2;
        const dx = player.x - obCenterX;
        const dy = player.y - obCenterY;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const vx = (dx/dist)*bulletSpeed;
        const vy = (dy/dist)*bulletSpeed;
        enemyBullets.push({
          x: obCenterX,
          y: obCenterY,
          vx: vx,
          vy: vy,
          width: 5,
          height: 5,
          type: "bullet"
        });
        ob.nextShot = Date.now() + 5000;
      }
    }
  });
}

// Update enemy bullets.
function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let bullet = enemyBullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    if (bullet.x < 0 || bullet.x > canvas.width ||
        bullet.y < 0 || bullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
    }
  }
}

// Update stalactites
function updateStalactites() {
  stalactites.forEach(stalactite => {
    if (!stalactite.falling) {
      // Check if player is below and nearby
      let dx = Math.abs(player.x - stalactite.x);
      if (dx < 50 && player.y > stalactite.y) {
        stalactite.falling = true;
      }
    } else {
      // Update falling stalactite
      stalactite.y += stalactite.fallSpeed;
      stalactite.fallSpeed += 0.2;
    }
  });
}

// Check collisions.
function checkCollisions() {
  walls.forEach(wall => {
    let playerRect = {
      x: player.x - player.width/2,
      y: player.y - player.height/2,
      width: player.width,
      height: player.height
    };
    if (isColliding(playerRect, wall)) {
      player.crashed = true;
      markGameOver();
      console.log('Crashed into wall');
    }
  });
  
  // Platform collision detection
  let prev_bottom = player.prev_y + player.height/2;
  let current_bottom = player.y + player.height/2;
  
  platforms.forEach(platform => {
    let playerRect = {
      x: player.x - player.width/2,
      y: player.y - player.height/2,
      width: player.width,
      height: player.height
    };
    
    let platformRect = {
      x: platform.x,
      y: platform.y,
      width: platform.width,
      height: platform.height
    };
    
    // Check if player is colliding with platform
    if (isColliding(playerRect, platformRect)) {
      // If already landed, allow takeoff
      if (player.landed && keys.space) {
        return;
      }
      
      // Only allow landing from above
      if (prev_bottom <= platform.y && 
          current_bottom >= platform.y &&
          player.x - player.width/2 < platform.x + platform.width &&
          player.x + player.width/2 > platform.x) {
        // Proper landing from above
        if (player.vy > crash_vertical_speed || Math.abs(player.vx) > crash_horizontal_speed) {
          player.crashed = true;
          markGameOver();
          console.log('Crashed: Too fast landing');
        } else {
          let landing_vx = Math.abs(player.vx);
          player.landed = true;
          player.vx = 0;
          player.vy = 0;
          player.y = platform.y - player.height/2;
          
          // Handle successful landing on end platform
          if (platform.isEnd) {
            let elapsedTime = (Date.now() - levelStartTime) / 1000;
            let multiplier;
            if (elapsedTime <= 5) multiplier = 2;
            else if (elapsedTime <= 9) multiplier = 2 - ((elapsedTime - 5) / 4);
            else if (elapsedTime <= 14) multiplier = 1 - ((elapsedTime - 9) * 0.13333);
            else multiplier = 0.3333;
            multiplier = Math.max(multiplier, 0.3333);
            
            let baseScore = 300;
            let timeScore = Math.round(baseScore * multiplier);
            let landingQualityBonus = Math.round(20 * Math.max(0, crash_horizontal_speed - landing_vx));
            let subtotal = timeScore + landingQualityBonus;
            
            // Calculate gem bonus
            let gemMultiplier = 1 + (gemsCollected * 0.15);
            let gemBonus = Math.floor(subtotal * (gemMultiplier - 1));
            let total = subtotal + gemBonus;
            
            score += total;
            landingScore = total;
            bonusMultiplier = multiplier;
            bonusPoints = timeScore - baseScore + landingQualityBonus;
            gemBonusPoints = gemBonus;
            
            levelCompleteStartTime = Date.now();
            gameState = "levelcomplete";
            
            console.log(`Level complete! Base: ${subtotal}, Gem Bonus: ${gemBonus}, Total: ${total}`);
          } else {
            console.log('Landed on starting platform');
          }
        }
      } else {
        // Collision from side or below - crash
        player.crashed = true;
        markGameOver();
        console.log('Crashed: Hit platform from side or below');
      }
    }
  });
  obstacles.forEach(ob => {
    let playerRect = {
      x: player.x - player.width/2,
      y: player.y - player.height/2,
      width: player.width,
      height: player.height
    };
    if (isColliding(playerRect, ob)) {
      player.crashed = true;
      markGameOver();
      console.log(`Crashed into obstacle: ${ob.type}`);
    }
  });
  enemyBullets.forEach(bullet => {
    let playerRect = {
      x: player.x - player.width/2,
      y: player.y - player.height/2,
      width: player.width,
      height: player.height
    };
    if (isColliding(playerRect, bullet)) {
      player.crashed = true;
      markGameOver();
      console.log("Hit by bullet");
    }
  });
  if (player.x + player.width/2 < 0 || player.x - player.width/2 > canvas.width ||
      player.y + player.height/2 < 0 || player.y - player.height/2 > canvas.height) {
    player.crashed = true;
    markGameOver();
    console.log("Flew off the map");
  }

  // Check stalactite collisions
  stalactites.forEach(stalactite => {
    if (stalactite.falling) {
      let stalactiteRect = {
        x: stalactite.x - stalactite.width/2,
        y: stalactite.y,
        width: stalactite.width,
        height: stalactite.height
      };
      
      let playerRect = {
        x: player.x - player.width/2,
        y: player.y - player.height/2,
        width: player.width,
        height: player.height
      };
      
      if (isColliding(playerRect, stalactiteRect)) {
        player.crashed = true;
        markGameOver();
        console.log('Crashed into stalactite');
      }
    }
  });

  // Check gem collisions
  gems.forEach(gem => {
    if (!gem.collected) {
      let dx = player.x - gem.x;
      let dy = player.y - gem.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance < player.width/2 + gem.radius) {
        gem.collected = true;
        gemsCollected++;
        score += 50; // Immediate points for collecting
        console.log(`Collected gem! Total: ${gemsCollected}`);
      }
    }
  });
}

// Render walls.
function renderWalls() {
  walls.forEach(wall => {
    // Create rock texture gradient
    let gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y + wall.height);
    gradient.addColorStop(0, '#444444');
    gradient.addColorStop(0.5, '#555555');
    gradient.addColorStop(1, '#333333');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    
    // Add rock details
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    
    // Random cracks/details
    let seed = wall.x * wall.y; // Use position as seed for consistent randomness
    let detailCount = (seed % 3) + 1;
    
    ctx.beginPath();
    for (let i = 0; i < detailCount; i++) {
        let x1 = wall.x + ((seed * (i+1)) % wall.width);
        let y1 = wall.y + ((seed * (i+2)) % wall.height);
        let x2 = wall.x + ((seed * (i+3)) % wall.width);
        let y2 = wall.y + ((seed * (i+4)) % wall.height);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  });
}

// Render enemy bullets.
function renderEnemyBullets() {
  enemyBullets.forEach(bullet => {
    ctx.fillStyle = '#FF6600';
    
    // Draw bullet with glow effect
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, 
            bullet.width, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow
    let glow = ctx.createRadialGradient(
        bullet.x + bullet.width/2, bullet.y + bullet.height/2, 0,
        bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width * 2
    );
    glow.addColorStop(0, 'rgba(255, 102, 0, 0.7)');
    glow.addColorStop(1, 'rgba(255, 102, 0, 0)');
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, 
            bullet.width * 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Render platforms.
function renderPlatforms() {
  platforms.forEach(platform => {
    // Platform base
    let gradient = ctx.createLinearGradient(
        platform.x, platform.y, 
        platform.x, platform.y + platform.height
    );
    
    if (platform.isStart) {
        gradient.addColorStop(0, '#4444FF');
        gradient.addColorStop(1, '#2222AA');
    } else {
        gradient.addColorStop(0, '#FFFF44');
        gradient.addColorStop(1, '#AAAA22');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Platform details
    ctx.fillStyle = platform.isStart ? '#8888FF' : '#FFFF88';
    
    // Landing lights
    for (let i = 0; i < platform.width; i += 10) {
        let lightOn = Math.floor(Date.now() / 200) % 2 === 0;
        if (lightOn) {
            ctx.fillRect(platform.x + i, platform.y - 2, 5, 2);
        }
    }
    
    // Platform markings
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(platform.x + 10, platform.y + platform.height/2 - 1, platform.width - 20, 2);
  });
}

// Enhanced player rendering with ship selection and leaning effect
function renderPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    
    let tilt = player.vx * tilt_sensitivity;
    tilt = Math.max(-max_tilt, Math.min(max_tilt, tilt));
    ctx.rotate(tilt);
    
    // Draw thrust flame
    if (keys.space && !player.crashed && !player.landed) {
        let flameHeight = 15 + Math.random() * 5;
        let gradient = ctx.createLinearGradient(0, player.height/2, 0, player.height/2 + flameHeight);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.6, '#FF4500');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-player.width/4, player.height/2);
        ctx.lineTo(0, player.height/2 + flameHeight);
        ctx.lineTo(player.width/4, player.height/2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw ship based on type
    switch(currentShip) {
        case "hotpink":
            // Hot Pink Ship (unchanged)
            ctx.fillStyle = '#FF1493';
            ctx.beginPath();
            ctx.moveTo(0, -player.height/2);
            ctx.lineTo(player.width/2, player.height/4);
            ctx.lineTo(player.width/4, player.height/2);
            ctx.lineTo(-player.width/4, player.height/2);
            ctx.lineTo(-player.width/2, player.height/4);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Decorative stripes
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-player.width/3, 0);
            ctx.lineTo(player.width/3, 0);
            ctx.stroke();
            break;
            
        case "purple":
            // Purple Ship (same design)
            ctx.fillStyle = '#8A2BE2';
            ctx.beginPath();
            ctx.moveTo(0, -player.height/2);
            ctx.lineTo(player.width/2, player.height/4);
            ctx.lineTo(player.width/4, player.height/2);
            ctx.lineTo(-player.width/4, player.height/2);
            ctx.lineTo(-player.width/2, player.height/4);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = '#9370DB';
            ctx.beginPath();
            ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Decorative stripes
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-player.width/3, 0);
            ctx.lineTo(player.width/3, 0);
            ctx.stroke();
            break;
            
        case "golden":
            // Golden Ship (same design with subtle glow)
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            ctx.shadowBlur = 10;
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(0, -player.height/2);
            ctx.lineTo(player.width/2, player.height/4);
            ctx.lineTo(player.width/4, player.height/2);
            ctx.lineTo(-player.width/4, player.height/2);
            ctx.lineTo(-player.width/2, player.height/4);
            ctx.closePath();
            ctx.fill();
            
            // Reset shadow for cockpit
            ctx.shadowBlur = 0;
            
            // Cockpit
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Decorative stripes
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-player.width/3, 0);
            ctx.lineTo(player.width/3, 0);
            ctx.stroke();
            break;
            
        default:
            // Default Ship (unchanged)
            ctx.fillStyle = '#CCCCCC';
            ctx.beginPath();
            ctx.moveTo(0, -player.height/2);
            ctx.lineTo(player.width/2, player.height/4);
            ctx.lineTo(player.width/4, player.height/2);
            ctx.lineTo(-player.width/4, player.height/2);
            ctx.lineTo(-player.width/2, player.height/4);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = '#88CCFF';
            ctx.beginPath();
            ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Decorative stripes
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-player.width/3, 0);
            ctx.lineTo(player.width/3, 0);
            ctx.stroke();
    }
    
    // Draw landing gear if near landing pad or landed
    let nearLandingPad = false;
    platforms.forEach(platform => {
        // Check if player is above and close to a platform
        if (player.y + player.height/2 < platform.y && 
            player.y + player.height/2 > platform.y - 50 && // Within 50px above platform
            player.x > platform.x - player.width/2 && 
            player.x < platform.x + platform.width + player.width/2) {
            nearLandingPad = true;
        }
    });
    
    if (nearLandingPad || player.landed) {
        ctx.strokeStyle = (currentShip === "hotpink") ? '#FF69B4' : 
                         (currentShip === "purple") ? '#9370DB' :
                         (currentShip === "golden") ? '#FFA500' : '#444444';
        ctx.lineWidth = 1;
        
        // Left landing gear
        ctx.beginPath();
        ctx.moveTo(-player.width/4, player.height/2);
        ctx.lineTo(-player.width/3, player.height/2);
        ctx.stroke();
        
        // Right landing gear
        ctx.beginPath();
        ctx.moveTo(player.width/4, player.height/2);
        ctx.lineTo(player.width/3, player.height/2);
        ctx.stroke();
    }
    
    // Draw crashed state if applicable
    if (player.crashed) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        
        // X marks the spot
        ctx.beginPath();
        ctx.moveTo(-player.width/2, -player.height/2);
        ctx.lineTo(player.width/2, player.height/2);
        ctx.moveTo(player.width/2, -player.height/2);
        ctx.lineTo(-player.width/2, player.height/2);
        ctx.stroke();
        
        // Explosion particles
        for (let i = 0; i < 5; i++) {
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * player.width;
            let x = Math.cos(angle) * distance;
            let y = Math.sin(angle) * distance;
            
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// Render UI elements.
function renderUI() {
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  
  if (gameState === "levelcomplete") {
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    
    let yPos = canvas.height/2 - 100;
    let xPos = canvas.width/2 - 150;
    let lineHeight = 40;
    
    ctx.fillText(`Base Score: ${300}`, xPos, yPos);
    yPos += lineHeight;
    
    let timeBonus = bonusPoints >= 0 ? `+${Math.round(bonusPoints)}` : `${Math.round(bonusPoints)}`;
    ctx.fillText(`Time/Landing Bonus: ${timeBonus}`, xPos, yPos);
    yPos += lineHeight;
    
    let subtotal = 300 + bonusPoints;
    ctx.fillText(`Subtotal: ${subtotal}`, xPos, yPos);
    yPos += lineHeight;
    
    if (gemsCollected > 0) {
      ctx.fillStyle = '#FFD700'; // Gold color for gem bonus
      ctx.fillText(`Gem Bonus (${gemsCollected} × 15%): +${gemBonusPoints}`, xPos, yPos);
      yPos += lineHeight;
    }
    
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.fillText(`Final Score: ${landingScore}`, xPos, yPos);
  }
  
  // Render messages
  for (let i = messages.length - 1; i >= 0; i--) {
    let message = messages[i];
    let elapsed = Date.now() - message.showTime;
    
    if (elapsed > message.duration) {
      messages.splice(i, 1);
      continue;
    }
    
    // Fade in/out effect
    let alpha = 1;
    if (elapsed < 500) alpha = elapsed / 500;
    if (elapsed > message.duration - 500) alpha = (message.duration - elapsed) / 500;
    
    ctx.fillStyle = `rgba(255, 20, 147, ${alpha})`;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message.text, canvas.width/2, 100);
    
    if (message.subtext) {
      ctx.font = '18px Arial';
      ctx.fillText(message.subtext, canvas.width/2, 130);
    }
  }
  
  ctx.textAlign = 'left';
  ctx.restore();
}

// Render obstacles.
function renderObstacles() {
  obstacles.forEach(ob => {
    if (ob.type === "floatingShip") {
      drawFloatingShip(ob);
    } else if (ob.type === "floatingRock") {
      drawFloatingRock(ob);
    } else if (ob.type === "hill") {
      drawHill(ob);
    }
  });
}

// Render stalactites
function renderStalactites() {
  stalactites.forEach(stalactite => {
    // Create rock texture gradient with more visible colors
    let gradient = ctx.createLinearGradient(
        stalactite.x, stalactite.y, 
        stalactite.x, stalactite.y + stalactite.height
    );
        
    if (stalactite.falling) {
        gradient.addColorStop(0, '#FF5555');
        gradient.addColorStop(0.5, '#CC3333');
        gradient.addColorStop(1, '#AA2222');
    } else {
        gradient.addColorStop(0, '#CCCCCC');
        gradient.addColorStop(0.5, '#AAAAAA');
        gradient.addColorStop(1, '#888888');
    }
        
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(stalactite.x - stalactite.width/2, stalactite.y);
    ctx.lineTo(stalactite.x, stalactite.y + stalactite.height);
    ctx.lineTo(stalactite.x + stalactite.width/2, stalactite.y);
    ctx.closePath();
    ctx.fill();
        
    // Add outline for better visibility
    ctx.strokeStyle = stalactite.falling ? '#FF0000' : '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
        
    // Add some lines for texture
    ctx.strokeStyle = stalactite.falling ? '#441111' : '#444444';
    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
        let height = stalactite.height * (i/4);
        let width = (stalactite.width/2) * (1 - i/4);
        ctx.moveTo(stalactite.x - width, stalactite.y + height);
        ctx.lineTo(stalactite.x + width, stalactite.y + height);
    }
    ctx.stroke();
  });
}

// Render gems
function renderGems() {
  gems.forEach(gem => {
    if (!gem.collected) {
      ctx.save();
      ctx.translate(gem.x, gem.y);
      
      // Update rotation angle
      gem.rotationAngle = (gem.rotationAngle + 0.1) % (Math.PI * 2);
      
      // Draw coin based on rotation angle
      let coinWidth = Math.abs(Math.cos(gem.rotationAngle)) * gem.radius * 2;
      
      // Gold gradient
      let gradient = ctx.createLinearGradient(-coinWidth/2, 0, coinWidth/2, 0);
      gradient.addColorStop(0, '#FFD700');    // Dark gold
      gradient.addColorStop(0.5, '#FFF380');  // Light gold
      gradient.addColorStop(1, '#FFD700');    // Dark gold
      
      ctx.fillStyle = gradient;
      
      // Draw ellipse (appears to spin)
      ctx.beginPath();
      ctx.ellipse(0, 0, coinWidth/2, gem.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add shine
      ctx.strokeStyle = '#FFF380';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-coinWidth/2, -gem.radius/2);
      ctx.lineTo(coinWidth/2, -gem.radius/2);
      ctx.stroke();
      
      ctx.restore();
    }
  });
}

// Render main menu.
function renderMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw animated background
  renderBackground();
  
  // Add a semi-transparent overlay for better text readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw animated cave silhouette at the bottom
  drawCaveSilhouette();
  
  // Title with glow effect
  ctx.save();
  ctx.shadowColor = '#4CAF50';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CAVE GROK', canvas.width/2, 150);
  
  // Subtitle
  ctx.shadowBlur = 5;
  ctx.font = 'italic 24px Arial';
  ctx.fillText('Navigate the Depths', canvas.width/2, 190);
  ctx.restore();
  
  // Instructions panel
  ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
  ctx.fillRect(canvas.width/2 - 200, 230, 400, 100);
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width/2 - 200, 230, 400, 100);
  
  // Instructions text - ensure text alignment is centered
  ctx.fillStyle = 'white';
  ctx.font = '22px Arial';
  ctx.textAlign = 'center'; // Ensure text alignment is center
  ctx.fillText('Press ENTER to Start', canvas.width/2, 270);
  ctx.font = '16px Arial';
  ctx.fillText('Arrow Keys to Move, SPACE to Thrust', canvas.width/2, 300);
  ctx.fillText('Press S to switch ships', canvas.width/2, 320);
  
  // Ship preview section with improved styling
  ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
  ctx.fillRect(canvas.width/2 - 180, 350, 360, 200);
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width/2 - 180, 350, 360, 200);
  
  // Ship preview title with animation - ensure text alignment is centered
  let titleGlow = Math.sin(Date.now() / 500) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + titleGlow * 0.3})`;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center'; // Ensure text alignment is center
  ctx.fillText('Your Ship:', canvas.width/2, 380);
  
  // Draw current ship preview with animation
  ctx.save();
  ctx.translate(canvas.width/2, 450);
  ctx.scale(2.5, 2.5); // Make preview ship larger
  
  // Add slight rocking animation to preview
  let previewLean = Math.sin(Date.now() / 500) * 0.2;
  ctx.rotate(previewLean);
  
  // Draw the appropriate ship based on currentShip
  if (currentShip === "hotpink") {
    // Hot Pink Ship Preview
    drawHotPinkShip();
  } else if (currentShip === "purple") {
    // Purple Ship Preview
    drawPurpleShip();
  } else if (currentShip === "golden") {
    // Golden Ship Preview
    drawGoldenShip();
  } else {
    // Default Ship Preview
    drawDefaultShip();
  }
  
  // Add engine glow effect
  drawEngineGlow();
  
  ctx.restore();
  
  // Draw available ships indicator
  let availableShips = ['default'];
  if (hotPinkShipUnlocked) availableShips.push('hotpink');
  if (purpleShipUnlocked) availableShips.push('purple');
  if (goldenShipUnlocked) availableShips.push('golden');
  
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Ships Available: ${availableShips.length}/4`, canvas.width/2, 530);
}

// Helper function to draw cave silhouette
function drawCaveSilhouette() {
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  
  // Create a jagged cave ceiling effect
  for (let x = 0; x < canvas.width; x += 20) {
    // Use sine wave with some randomization for natural look
    let heightVariation = Math.sin(x / 30) * 15 + Math.sin(Date.now() / 1000 + x / 50) * 5;
    ctx.lineTo(x, canvas.height - 40 - heightVariation);
  }
  
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
  
  // Add some stalactites
  for (let i = 0; i < 8; i++) {
    let x = canvas.width * (i + 0.5) / 8;
    let height = 20 + Math.sin(Date.now() / 1000 + i) * 10;
    
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.moveTo(x - 10, canvas.height - 40);
    ctx.lineTo(x, canvas.height - 40 - height);
    ctx.lineTo(x + 10, canvas.height - 40);
    ctx.closePath();
    ctx.fill();
  }
}

// Helper function to draw engine glow
function drawEngineGlow() {
  let glowIntensity = Math.sin(Date.now() / 200) * 0.5 + 0.5;
  let flameHeight = 8 + glowIntensity * 5;
  
  let gradient = ctx.createLinearGradient(0, player.height/2, 0, player.height/2 + flameHeight);
  gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-player.width/4, player.height/2);
  ctx.lineTo(0, player.height/2 + flameHeight);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.closePath();
  ctx.fill();
}

// Helper functions for drawing different ships
function drawHotPinkShip() {
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(0, -player.height/2);
  ctx.lineTo(player.width/2, player.height/4);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.lineTo(-player.width/4, player.height/2);
  ctx.lineTo(-player.width/2, player.height/4);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.width/3, 0);
  ctx.lineTo(player.width/3, 0);
  ctx.stroke();
  
  // Add sparkle animation
  if (Math.floor(Date.now() / 150) % 5 === 0) {
    ctx.fillStyle = '#FFFFFF';
    let sparkX = (Math.random() - 0.5) * player.width;
    let sparkY = (Math.random() - 0.5) * player.height;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPurpleShip() {
  ctx.fillStyle = '#8A2BE2';
  ctx.beginPath();
  ctx.moveTo(0, -player.height/2);
  ctx.lineTo(player.width/2, player.height/4);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.lineTo(-player.width/4, player.height/2);
  ctx.lineTo(-player.width/2, player.height/4);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#9370DB';
  ctx.beginPath();
  ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.width/3, 0);
  ctx.lineTo(player.width/3, 0);
  ctx.stroke();
  
  // Add sparkle animation
  if (Math.floor(Date.now() / 150) % 5 === 0) {
    ctx.fillStyle = '#FFFFFF';
    let sparkX = (Math.random() - 0.5) * player.width;
    let sparkY = (Math.random() - 0.5) * player.height;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGoldenShip() {
  ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 10;
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(0, -player.height/2);
  ctx.lineTo(player.width/2, player.height/4);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.lineTo(-player.width/4, player.height/2);
  ctx.lineTo(-player.width/2, player.height/4);
  ctx.closePath();
  ctx.fill();
  
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.width/3, 0);
  ctx.lineTo(player.width/3, 0);
  ctx.stroke();
  
  // Add sparkle animation
  if (Math.floor(Date.now() / 100) % 3 === 0) {
    ctx.fillStyle = '#FFFFFF';
    let sparkX = (Math.random() - 0.5) * player.width;
    let sparkY = (Math.random() - 0.5) * player.height;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDefaultShip() {
  ctx.fillStyle = '#CCCCCC';
  ctx.beginPath();
  ctx.moveTo(0, -player.height/2);
  ctx.lineTo(player.width/2, player.height/4);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.lineTo(-player.width/4, player.height/2);
  ctx.lineTo(-player.width/2, player.height/4);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#88CCFF';
  ctx.beginPath();
  ctx.ellipse(0, -player.height/6, player.width/4, player.height/6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-player.width/3, 0);
  ctx.lineTo(player.width/3, 0);
  ctx.stroke();
}

// Render game over screen.
function renderGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw animated background
  renderBackground();
  
  // Add a semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw crashed ship with explosion effect
  drawCrashedShip();
  
  // Game over panel
  ctx.fillStyle = 'rgba(40, 0, 0, 0.8)';
  ctx.fillRect(canvas.width/2 - 200, canvas.height/2 - 150, 400, 300);
  ctx.strokeStyle = '#FF4500';
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width/2 - 200, canvas.height/2 - 150, 400, 300);
  
  // Game over text with glow
  ctx.save();
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 80);
  
  // Score with animation
  let scoreGlow = Math.sin(Date.now() / 300) * 0.3 + 0.7;
  ctx.shadowColor = `rgba(255, 215, 0, ${scoreGlow})`;
  ctx.shadowBlur = 10;
  ctx.font = '30px Arial';
  ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
  
  // Level reached
  ctx.shadowBlur = 5;
  ctx.font = '24px Arial';
  ctx.fillText(`Level Reached: ${level}`, canvas.width/2, canvas.height/2 + 50);
  
  // Restart button
  let buttonY = canvas.height/2 + 110;
  let buttonWidth = 200;
  let buttonHeight = 50;
  let buttonX = canvas.width/2 - buttonWidth/2;
  
  // Button animation on hover or when Enter is pressed
  let isButtonActive = keys.Enter;
  let buttonGlow = Math.sin(Date.now() / 300) * 0.3 + 0.7;
  
  ctx.fillStyle = isButtonActive ? '#FF6347' : 'rgba(255, 99, 71, 0.8)';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  ctx.strokeStyle = `rgba(255, 255, 255, ${buttonGlow})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial';
  ctx.fillText("RESTART", canvas.width/2, buttonY + 30);
  
  ctx.restore();
  
  // Add tip at the bottom - ensure it's centered
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center'; // Ensure text alignment is center
  ctx.fillText("Press ENTER to restart", canvas.width/2, canvas.height/2 + 180);
  
  // Check for restart
  if (keys.Enter) {
    resetGame();
    gameState = "playing";
  }
}

// Helper function to draw crashed ship
function drawCrashedShip() {
  ctx.save();
  
  // Position the crashed ship
  let crashX = canvas.width/2 - 150;
  let crashY = canvas.height/2 - 80;
  ctx.translate(crashX, crashY);
  
  // Draw tilted ship
  ctx.rotate(Math.PI / 6);
  
  // Draw ship based on current type
  if (currentShip === "hotpink") {
    ctx.fillStyle = '#FF1493';
  } else if (currentShip === "purple") {
    ctx.fillStyle = '#8A2BE2';
  } else if (currentShip === "golden") {
    ctx.fillStyle = '#FFD700';
  } else {
    ctx.fillStyle = '#CCCCCC';
  }
  
  ctx.beginPath();
  ctx.moveTo(0, -player.height/2);
  ctx.lineTo(player.width/2, player.height/4);
  ctx.lineTo(player.width/4, player.height/2);
  ctx.lineTo(-player.width/4, player.height/2);
  ctx.lineTo(-player.width/2, player.height/4);
  ctx.closePath();
  ctx.fill();
  
  // Draw damage
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.width/2, -player.height/2);
  ctx.lineTo(player.width/2, player.height/2);
  ctx.moveTo(player.width/2, -player.height/2);
  ctx.lineTo(-player.width/2, player.height/2);
  ctx.stroke();
  
  // Draw explosion particles
  for (let i = 0; i < 20; i++) {
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * player.width * 3;
    let size = Math.random() * 3 + 1;
    let x = Math.cos(angle) * distance;
    let y = Math.sin(angle) * distance;
    
    // Particle color based on time for animation
    let particleTime = (Date.now() / 50 + i * 30) % 100;
    let alpha = 1 - particleTime / 100;
    
    if (alpha > 0) {
      ctx.fillStyle = particleTime < 50 ? 
                     `rgba(255, 69, 0, ${alpha})` : 
                     `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// Initialize background elements
function initBackground() {
    // Create starfield
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.8 + 0.2
        });
    }
    
    // Create background gradient
    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, '#000033');
    backgroundGradient.addColorStop(0.5, '#000066');
    backgroundGradient.addColorStop(1, '#000044');
}

// Call this in your initialization code
initBackground();

// Render background
function renderBackground() {
    // Draw gradient background
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.5 + Math.sin(Date.now() / 1000 + star.x) * 0.5)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Main render function.
function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render in correct order (background to foreground)
  renderBackground();
  renderWalls();
  renderPlatforms();
  renderStalactites();
  renderGems();
  renderObstacles();
  renderEnemyBullets();
  renderPlayer();
  renderUI();
  
  // This should be the ONLY place drawScore is called
  drawScore();
  
  // Reset text alignment to left for other functions
  ctx.textAlign = 'left';
}

// Update game state.
function update() {
  if (gameState !== "playing") return;
  
  // Store previous position for collision detection
  player.prev_y = player.y;
  
  // Apply gravity if not landed
  if (!player.landed) {
    player.vy += gravity;
  }
  
  // Handle controls
  if (keys.space && !player.crashed) {
    // Vertical thrust
    player.vy -= vertical_thrust;
    if (player.landed) {
      // Take off
      player.landed = false;
      if (levelStartTime === 0) {
        levelStartTime = Date.now();
        firingStarted = true;
      }
    }
  }
  
  if (keys.ArrowLeft && !player.crashed) {
    // Left thrust
    player.vx -= horizontal_thrust;
  }
  
  if (keys.ArrowRight && !player.crashed) {
    // Right thrust
    player.vx += horizontal_thrust;
  }
  
  // Update position
  player.x += player.vx;
  player.y += player.vy;
  
  // Update other game elements
  updateStalactites();
  updateObstacles();
  updateEnemyBullets();
  checkCollisions();
}

// Reset game to initial state.
function resetGame() {
  level = 1;
  score = 0;
  gemsCollected = 0;
  setupLevel(level);
  resetPlayer();
  gameState = "playing";
  levelStartTime = 0;
  scoreSubmittedForRun = false;
}

// Main game loop.
function gameLoop() {
  if (gameState === "menu") {
    renderMenu();
    if (keys.Enter) {
      resetGame();
      gameState = "playing";
    }
  } else if (gameState === "playing") {
    update();
    render();
  } else if (gameState === "levelcomplete") {
    render();
    if (Date.now() - levelCompleteStartTime >= 3000) {
      if (level < levels.length) {
        level++;
        if (window.caveGrok && typeof window.caveGrok.persistProgress === "function") {
          window.caveGrok.persistProgress({ lastLevel: level });
        }
        
        // Check for ship unlocks before setting up next level
        if (level >= 10 && !purpleShipUnlocked) {
          purpleShipUnlocked = true;
          localStorage.setItem('purpleShipUnlocked', 'true');
          showUnlockMessage("🚀 PURPLE SHIP UNLOCKED! 🚀", "Press 'S' to switch ships");
        }
        if (level >= 20 && !goldenShipUnlocked) {
          goldenShipUnlocked = true;
          localStorage.setItem('goldenShipUnlocked', 'true');
          showUnlockMessage("✨ GOLDEN SHIP UNLOCKED! ✨", "Press 'S' to switch ships");
        }
        
        setupLevel(level);
        gameState = "playing";
      } else {
        markGameWin();
      }
    }
  } else if (gameState === "gameover") {
    renderGameOver();
    if (keys.Enter) {
      resetGame();
      gameState = "playing";
    }
  } else if (gameState === "win") {
    renderWin();
    if (keys.Enter) {
      resetGame();
      gameState = "playing";
    }
  }
  requestAnimationFrame(gameLoop);
}

// Update ship unlocking logic
function checkLevelUnlocks() {
    if (level >= 10 && !purpleShipUnlocked) {
        purpleShipUnlocked = true;
        localStorage.setItem('purpleShipUnlocked', 'true');
        showUnlockMessage("🚀 PURPLE SHIP UNLOCKED! 🚀", "Press 'S' to switch ships");
    }
    if (level >= 20 && !goldenShipUnlocked) {
        goldenShipUnlocked = true;
        localStorage.setItem('goldenShipUnlocked', 'true');
        showUnlockMessage("✨ GOLDEN SHIP UNLOCKED! ✨", "Press 'S' to switch ships");
    }
}

// Update loadSavedData
function loadSavedData() {
    if (localStorage.getItem('hotPinkShipUnlocked') === 'true') {
        hotPinkShipUnlocked = true;
    }
    if (localStorage.getItem('purpleShipUnlocked') === 'true') {
        purpleShipUnlocked = true;
    }
    if (localStorage.getItem('goldenShipUnlocked') === 'true') {
        goldenShipUnlocked = true;
    }
}

// Call this when the game initializes
loadSavedData();
window.caveGrokReloadUnlocks = loadSavedData;

// Add a message array to show notifications
let messages = [];

// Add this function to initialize the HTML preview of the hot pink ship
function initHtmlShipPreview() {
    const shipCanvas = document.getElementById('shipPreview');
    if (!shipCanvas) return; // Exit if the canvas doesn't exist
    
    const previewCtx = shipCanvas.getContext('2d');
    
    function drawHotPinkShipPreview() {
        // Clear canvas
        previewCtx.clearRect(0, 0, shipCanvas.width, shipCanvas.height);
        
        // Center the ship
        previewCtx.save();
        previewCtx.translate(shipCanvas.width/2, shipCanvas.height/2);
        
        // Add slight animation
        let previewLean = Math.sin(Date.now() / 500) * 0.2;
        previewCtx.rotate(previewLean);
        
        // Scale to fit canvas
        let scale = Math.min(shipCanvas.width, shipCanvas.height) / 60;
        previewCtx.scale(scale, scale);
        
        // Hot Pink Ship Design (exactly matching in-game)
        // Main body
        previewCtx.fillStyle = '#FF1493'; // Hot pink
        previewCtx.beginPath();
        previewCtx.moveTo(0, -10);
        previewCtx.lineTo(10, 5);
        previewCtx.lineTo(5, 10);
        previewCtx.lineTo(-5, 10);
        previewCtx.lineTo(-10, 5);
        previewCtx.closePath();
        previewCtx.fill();
        
        // Cockpit
        previewCtx.fillStyle = '#FF69B4'; // Lighter pink
        previewCtx.beginPath();
        previewCtx.ellipse(0, -3, 5, 3, 0, 0, Math.PI * 2);
        previewCtx.fill();
        
        // Decorative stripes
        previewCtx.strokeStyle = '#FFFFFF';
        previewCtx.lineWidth = 1;
        previewCtx.beginPath();
        previewCtx.moveTo(-7, 0);
        previewCtx.lineTo(7, 0);
        previewCtx.stroke();
        
        // Glowing effect
        previewCtx.strokeStyle = 'rgba(255, 105, 180, 0.7)';
        previewCtx.lineWidth = 1.5;
        previewCtx.beginPath();
        previewCtx.moveTo(-10, 5);
        previewCtx.lineTo(10, 5);
        previewCtx.stroke();
        
        // Landing gear (small extensions at the corners)
        previewCtx.strokeStyle = '#FF69B4';
        previewCtx.lineWidth = 1;
        
        // Left landing gear
        previewCtx.beginPath();
        previewCtx.moveTo(-5, 10);
        previewCtx.lineTo(-7, 10);
        previewCtx.stroke();
        
        // Right landing gear
        previewCtx.beginPath();
        previewCtx.moveTo(5, 10);
        previewCtx.lineTo(7, 10);
        previewCtx.stroke();
        
        // Add sparkle animation
        if (Math.floor(Date.now() / 200) % 5 === 0) {
            previewCtx.fillStyle = '#FFFFFF';
            let sparkX = (Math.random() - 0.5) * 20;
            let sparkY = (Math.random() - 0.5) * 20;
            previewCtx.beginPath();
            previewCtx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
            previewCtx.fill();
        }
        
        // Add engine flame animation
        let flameHeight = 5 + Math.sin(Date.now() / 100) * 2;
        let gradient = previewCtx.createLinearGradient(0, 10, 0, 10 + flameHeight);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.6, '#FF4500');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        
        previewCtx.fillStyle = gradient;
        previewCtx.beginPath();
        previewCtx.moveTo(-3, 10);
        previewCtx.lineTo(0, 10 + flameHeight);
        previewCtx.lineTo(3, 10);
        previewCtx.closePath();
        previewCtx.fill();
        
        previewCtx.restore();
        
        // Request next animation frame
        requestAnimationFrame(drawHotPinkShipPreview);
    }
    
    // Start the animation
    drawHotPinkShipPreview();
    
    // Change the preview text color to white
    const previewText = document.querySelector('.preview-text');
    if (previewText) {
        previewText.style.color = 'white';
    } else {
        // If there's no class, try to find it by content
        const allElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span');
        for (let element of allElements) {
            if (element.textContent.includes('Preview of HOT Pink Ship')) {
                element.style.color = 'white';
                break;
            }
        }
    }
}

// Call this when the page loads
window.addEventListener('load', function() {
    // Initialize the HTML preview
    initHtmlShipPreview();
    
    // Other initialization code...
});

gameLoop();

// Single function to draw all game stats
function drawScore() {
    // Set up text properties
    ctx.font = '20px Arial';
    ctx.textAlign = 'left'; // Explicitly set to left
    
    // Score at top
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 20, 30);
    
    // Level directly under Score
    ctx.fillStyle = 'white';
    ctx.fillText(`Level: ${level}`, 20, 60);
    
    // Timer under Level (in green)
    if (levelStartTime > 0) {
        ctx.fillStyle = '#4CAF50'; // Green color
        const currentTime = Date.now();
        const levelTime = (currentTime - levelStartTime) / 1000;
        ctx.fillText(`Time: ${levelTime.toFixed(1)}s`, 20, 90);
    }
}

// Function to show unlock messages
function showUnlockMessage(message, subtext) {
  messages.push({
    text: message,
    subtext: subtext,
    showTime: Date.now(),
    duration: 5000 // Show for 5 seconds
  });
}

// Also add this function to render unlock messages if not already present
function renderUnlockMessages() {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const elapsed = Date.now() - msg.showTime;
    
    if (elapsed > msg.duration) {
      messages.splice(i, 1);
      continue;
    }
    
    const opacity = Math.min(1, Math.min(elapsed / 500, (msg.duration - elapsed) / 500));
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(msg.text, canvas.width/2, canvas.height/2 - 100);
    
    if (msg.subtext) {
      ctx.font = '18px Arial';
      ctx.fillText(msg.subtext, canvas.width/2, canvas.height/2 - 70);
    }
    ctx.restore();
  }
}
