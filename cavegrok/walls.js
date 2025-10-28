// Generate wall blocks based on a grid using cellular automata.
// Optionally, if params.corridor is provided, carve a clear corridor between two points.
function generateWallsForLevel(params) {
  let cellSize = params.cellSize || 10;
  let cols = Math.floor(canvas.width / cellSize);
  let rows = Math.floor(canvas.height / cellSize);
  let fillProbability = params.fillProbability || 0.45;
  let iterations = params.iterations || 4;
  
  // Initialize grid with random walls.
  let grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Always fill border cells.
      if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = (Math.random() < fillProbability) ? 1 : 0;
      }
    }
  }
  
  // Smooth the grid using cellular automata.
  for (let iter = 0; iter < iterations; iter++) {
    let newGrid = [];
    for (let y = 0; y < rows; y++) {
      newGrid[y] = [];
      for (let x = 0; x < cols; x++) {
        let wallCount = countWallNeighbors(grid, x, y, cols, rows);
        if (grid[y][x] === 1) {
          newGrid[y][x] = (wallCount >= 4) ? 1 : 0;
        } else {
          newGrid[y][x] = (wallCount >= 5) ? 1 : 0;
        }
      }
    }
    grid = newGrid;
  }
  
  // Carve a corridor if requested.
  if (params.corridor) {
    carveCorridor(grid, params.corridor.start, params.corridor.end, params.corridor.width);
  }
  
  // Convert grid cells to wall block objects.
  let walls = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        walls.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: cellSize });
      }
    }
  }
  return walls;
}

// Count the number of wall cells around a given cell.
function countWallNeighbors(grid, x, y, cols, rows) {
  let count = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      if (i === 0 && j === 0) continue;
      let nx = x + i, ny = y + j;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
        count++; // Treat out-of-bound as wall.
      } else if (grid[ny][nx] === 1) {
        count++;
      }
    }
  }
  return count;
}

// Carve a corridor in the grid from start to end with a given corridor width.
// Uses a simple Bresenham line algorithm to get the points along the corridor.
// MODIFIED: Skip clearing cells in the bottom 2 rows so the cave floor remains intact.
function carveCorridor(grid, start, end, corridorWidth) {
  let points = getLinePoints(start.x, start.y, end.x, end.y);
  for (let p of points) {
    for (let dy = -corridorWidth; dy <= corridorWidth; dy++) {
      for (let dx = -corridorWidth; dx <= corridorWidth; dx++) {
        let nx = p.x + dx;
        let ny = p.y + dy;
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
          // If this cell is in one of the bottom 2 rows, skip clearing it.
          if (ny < grid.length - 2) {
            grid[ny][nx] = 0;
          }
        }
      }
    }
  }
}

// Bresenham's line algorithm to return an array of grid cells from (x0, y0) to (x1, y1).
function getLinePoints(x0, y0, x1, y1) {
  let points = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  
  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return points;
}

// Add this new function to walls.js
function generateEnvironmentalFeatures(walls, levelWidth, levelHeight) {
  const cellSize = 10; // Same as used in wall generation
  const stalactites = [];
  const pools = [];
  const gems = [];
  
  // Generate stalactites near the ceiling
  for (let i = 0; i < 15; i++) {
    stalactites.push({
      x: Math.random() * levelWidth,
      y: Math.random() * (levelHeight * 0.2), // Top 20% of screen
      width: 20,
      height: 30 + Math.random() * 20,
      falling: false,
      fallSpeed: 0
    });
  }
  
  // Generate pools near the bottom
  for (let i = 0; i < 10; i++) {
    pools.push({
      x: Math.random() * levelWidth,
      y: levelHeight * 0.7 + Math.random() * (levelHeight * 0.2), // Bottom 30%
      width: 30,
      height: 10,
      type: Math.random() < 0.5 ? "water" : "lava"
    });
  }
  
  // Generate gems throughout the level
  for (let i = 0; i < 20; i++) {
    gems.push({
      x: Math.random() * levelWidth,
      y: levelHeight * 0.2 + Math.random() * (levelHeight * 0.6), // Middle 60%
      radius: 8,
      collected: false,
      value: Math.random() < 0.2 ? 2 : 1 // 20% chance for double value gems
    });
  }
  
  // Filter out features that overlap with walls
  const filterByWalls = (feature) => {
    for (const wall of walls) {
      if (isOverlapping(feature, wall)) {
        return false;
      }
    }
    return true;
  };
  
  return {
    stalactites: stalactites.filter(filterByWalls),
    pools: pools.filter(filterByWalls),
    gems: gems.filter(filterByWalls)
  };
}

// Helper function to check if two objects overlap
function isOverlapping(obj1, obj2) {
  // For stalactites and pools (rectangular)
  if (obj1.width && obj2.width) {
    return !(obj1.x > obj2.x + obj2.width || 
             obj1.x + obj1.width < obj2.x || 
             obj1.y > obj2.y + obj2.height || 
             obj1.y + obj1.height < obj2.y);
  }
  // For gems (circular) vs rectangular
  else if (obj1.radius && obj2.width) {
    const circleDistX = Math.abs(obj1.x - (obj2.x + obj2.width/2));
    const circleDistY = Math.abs(obj1.y - (obj2.y + obj2.height/2));
    
    if (circleDistX > (obj2.width/2 + obj1.radius)) return false;
    if (circleDistY > (obj2.height/2 + obj1.radius)) return false;
    
    if (circleDistX <= (obj2.width/2)) return true;
    if (circleDistY <= (obj2.height/2)) return true;
    
    const cornerDistSq = Math.pow(circleDistX - obj2.width/2, 2) + 
                         Math.pow(circleDistY - obj2.height/2, 2);
    
    return (cornerDistSq <= Math.pow(obj1.radius, 2));
  }
  return false;
}
