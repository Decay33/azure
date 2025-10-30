const levels = [
    {
      level: 1,
      wallParams: { cellSize: 10, fillProbability: 0.30, iterations: 3 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: []  // No obstacles.
    },
    {
      level: 2,
      wallParams: { cellSize: 10, fillProbability: 0.31, iterations: 3 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 300, width: 40, height: 20, vx: 1 }
      ]
    },
    {
      level: 3,
      wallParams: { cellSize: 10, fillProbability: 0.32, iterations: 3 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingRock", x: 400, width: 40, height: 20, vx: 2.5 }
      ]
    },
    {
      level: 4,
      wallParams: { cellSize: 10, fillProbability: 0.33, iterations: 3 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 200, width: 40, height: 20, vx: 1.2 },
        { type: "floatingRock", x: 500, width: 40, height: 20, vx: 2.7 }
      ]
    },
    {
      level: 5,
      wallParams: { cellSize: 10, fillProbability: 0.34, iterations: 4 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "hill", x: 300, width: 40, height: 20 }
      ]
    },
    {
      level: 6,
      wallParams: { cellSize: 10, fillProbability: 0.35, iterations: 4 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 250, width: 40, height: 20, vx: 1.5 },
        { type: "floatingShip", x: 550, width: 40, height: 20, vx: 1.5 }
      ]
    },
    {
      level: 7,
      wallParams: { cellSize: 10, fillProbability: 0.36, iterations: 4 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingRock", x: 350, width: 40, height: 20, vx: 2.8 },
        { type: "hill", x: 600, width: 40, height: 20 }
      ]
    },
    {
      level: 8,
      wallParams: { cellSize: 10, fillProbability: 0.37, iterations: 5 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 150, width: 40, height: 20, vx: 2 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 3 },
        { type: "hill", x: 650, width: 40, height: 20 }
      ]
    },
    {
      level: 9,
      wallParams: { cellSize: 10, fillProbability: 0.38, iterations: 5 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 100, width: 40, height: 20, vx: 2.5 },
        { type: "floatingShip", x: 300, width: 40, height: 20, vx: 2.5 },
        { type: "floatingShip", x: 500, width: 40, height: 20, vx: 2.5 }
      ]
    },
    {
      level: 10,
      wallParams: { cellSize: 10, fillProbability: 0.39, iterations: 5 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingRock", x: 200, width: 40, height: 20, vx: 3.2 },
        { type: "floatingRock", x: 400, width: 40, height: 20, vx: 3.2 },
        { type: "floatingRock", x: 600, width: 40, height: 20, vx: 3.2 }
      ]
    },
    {
      level: 11,
      wallParams: { cellSize: 10, fillProbability: 0.40, iterations: 5 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 120, width: 40, height: 20, vx: 2.5 },
        { type: "floatingRock", x: 320, width: 40, height: 20, vx: 3.5 },
        { type: "hill", x: 520, width: 40, height: 20 }
      ]
    },
    {
      level: 12,
      wallParams: { cellSize: 10, fillProbability: 0.41, iterations: 6 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 150, width: 40, height: 20, vx: 3 },
        { type: "floatingRock", x: 350, width: 40, height: 20, vx: 4 },
        { type: "floatingShip", x: 550, width: 40, height: 20, vx: 3 },
        { type: "hill", x: 650, width: 40, height: 20 }
      ]
    },
    {
      level: 13,
      wallParams: { cellSize: 10, fillProbability: 0.42, iterations: 6 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingRock", x: 180, width: 40, height: 20, vx: 4 },
        { type: "floatingShip", x: 380, width: 40, height: 20, vx: 3.5 },
        { type: "floatingRock", x: 580, width: 40, height: 20, vx: 4 },
        { type: "hill", x: 680, width: 40, height: 20 }
      ]
    },
    {
      level: 14,
      wallParams: { cellSize: 10, fillProbability: 0.43, iterations: 6 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 130, width: 40, height: 20, vx: 4 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 4.5 },
        { type: "floatingShip", x: 530, width: 40, height: 20, vx: 4 },
        { type: "floatingRock", x: 730, width: 40, height: 20, vx: 4.5 },
        { type: "hill", x: 630, width: 40, height: 20 }
      ]
    },
    {
      level: 15,
      wallParams: { cellSize: 10, fillProbability: 0.44, iterations: 7 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingRock", x: 120, width: 40, height: 20, vx: 4.5 },
        { type: "floatingShip", x: 320, width: 40, height: 20, vx: 4 },
        { type: "floatingRock", x: 520, width: 40, height: 20, vx: 4.5 },
        { type: "floatingShip", x: 720, width: 40, height: 20, vx: 4 },
        { type: "hill", x: 620, width: 40, height: 20 }
      ]
    },
    // Levels 21-25: Last 5 levels with 2 of each ship type.
    {
      level: 21,
      wallParams: { cellSize: 10, fillProbability: 0.50, iterations: 8 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 270, width: 40, height: 20, vx: 6 },
        { type: "floatingShip", x: 390, width: 40, height: 20, vx: 6 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 7 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 7 },
        { type: "hill", x: 510, width: 40, height: 20 },
        { type: "hill", x: 570, width: 40, height: 20 }
      ]
    },
    {
      level: 22,
      wallParams: { cellSize: 10, fillProbability: 0.51, iterations: 8 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 270, width: 40, height: 20, vx: 6.5 },
        { type: "floatingShip", x: 390, width: 40, height: 20, vx: 6.5 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 7.5 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 7.5 },
        { type: "hill", x: 510, width: 40, height: 20 },
        { type: "hill", x: 570, width: 40, height: 20 }
      ]
    },
    {
      level: 23,
      wallParams: { cellSize: 10, fillProbability: 0.52, iterations: 9 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 270, width: 40, height: 20, vx: 7 },
        { type: "floatingShip", x: 390, width: 40, height: 20, vx: 7 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 8 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 8 },
        { type: "hill", x: 510, width: 40, height: 20 },
        { type: "hill", x: 570, width: 40, height: 20 }
      ]
    },
    {
      level: 24,
      wallParams: { cellSize: 10, fillProbability: 0.53, iterations: 9 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 270, width: 40, height: 20, vx: 7.5 },
        { type: "floatingShip", x: 390, width: 40, height: 20, vx: 7.5 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 8.5 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 8.5 },
        { type: "hill", x: 510, width: 40, height: 20 },
        { type: "hill", x: 570, width: 40, height: 20 }
      ]
    },
    {
      level: 25,
      wallParams: { cellSize: 10, fillProbability: 0.54, iterations: 9 },
      startPlatform: { x: 50,  y: 580, width: 100, height: 10 },
      landingPlatform: { x: 700, y: 580, width: 100, height: 10 },
      obstacles: [
        { type: "floatingShip", x: 270, width: 40, height: 20, vx: 8 },
        { type: "floatingShip", x: 390, width: 40, height: 20, vx: 8 },
        { type: "floatingRock", x: 330, width: 40, height: 20, vx: 9 },
        { type: "floatingRock", x: 450, width: 40, height: 20, vx: 9 },
        { type: "hill", x: 510, width: 40, height: 20 },
        { type: "hill", x: 570, width: 40, height: 20 }
      ]
    }
  ];
  