// Visual Effects System for CaveGrok - 3D-ish Enhancement
class VisualEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.particles = [];
        this.lightSources = [];
        this.shadowOffset = { x: 3, y: 3 };
        this.ambientLight = 0.3;
        this.init();
    }

    init() {
        // Initialize lighting system
        this.lightSources = [
            { x: 100, y: 100, intensity: 0.8, color: '#4CAF50' }, // Start platform light
            { x: 700, y: 100, intensity: 0.8, color: '#FFD700' }  // End platform light
        ];
    }

    // Enhanced 3D-style rectangle with depth and lighting
    draw3DRect(x, y, width, height, color, depth = 5, lightIntensity = 1) {
        const ctx = this.ctx;
        
        // Calculate lighting
        const lightFactor = this.calculateLighting(x + width/2, y + height/2) * lightIntensity;
        
        // Main face
        ctx.fillStyle = this.adjustColorBrightness(color, lightFactor);
        ctx.fillRect(x, y, width, height);
        
        // Right face (darker)
        ctx.fillStyle = this.adjustColorBrightness(color, lightFactor * 0.7);
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width + depth, y - depth);
        ctx.lineTo(x + width + depth, y + height - depth);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Top face (lighter)
        ctx.fillStyle = this.adjustColorBrightness(color, lightFactor * 1.2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth);
        ctx.lineTo(x + width + depth, y - depth);
        ctx.lineTo(x + width, y);
        ctx.closePath();
        ctx.fill();
        
        // Outline for definition
        ctx.strokeStyle = this.adjustColorBrightness(color, lightFactor * 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    // Enhanced 3D ship rendering
    draw3DShip(x, y, shipType, tilt = 0, scale = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        ctx.scale(scale, scale);
        
        const lightFactor = this.calculateLighting(x, y);
        
        // Ship colors based on type
        let mainColor, accentColor, glowColor;
        switch(shipType) {
            case "hotpink":
                mainColor = '#FF1493';
                accentColor = '#FF69B4';
                glowColor = '#FF1493';
                break;
            case "purple":
                mainColor = '#8A2BE2';
                accentColor = '#9370DB';
                glowColor = '#8A2BE2';
                break;
            case "golden":
                mainColor = '#FFD700';
                accentColor = '#FFA500';
                glowColor = '#FFD700';
                break;
            default:
                mainColor = '#CCCCCC';
                accentColor = '#88CCFF';
                glowColor = '#88CCFF';
        }
        
        // Add glow effect for special ships
        if (shipType !== "default") {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 10;
        }
        
        // Draw ship based on type with unique 3D designs
        if (shipType === "hotpink") {
            // Hot Pink Ship - Sleek Racing Design
            const bodyGradient = ctx.createLinearGradient(-10, -10, 10, 10);
            bodyGradient.addColorStop(0, this.adjustColorBrightness(mainColor, lightFactor * 1.3));
            bodyGradient.addColorStop(0.5, this.adjustColorBrightness(mainColor, lightFactor));
            bodyGradient.addColorStop(1, this.adjustColorBrightness(mainColor, lightFactor * 0.7));
            
            // Main streamlined body
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(10, -3);
            ctx.lineTo(7, 10);
            ctx.lineTo(-7, 10);
            ctx.lineTo(-10, -3);
            ctx.closePath();
            ctx.fill();
            
            // Side wings
            ctx.fillStyle = this.adjustColorBrightness(accentColor, lightFactor);
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-13, -5);
            ctx.lineTo(-7, 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(13, -5);
            ctx.lineTo(7, 5);
            ctx.closePath();
            ctx.fill();
            
            // Crystal-like cockpit
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.adjustColorBrightness('#FFAADD', lightFactor * 1.2);
            ctx.beginPath();
            ctx.moveTo(0, -7);
            ctx.lineTo(4, -3);
            ctx.lineTo(0, 3);
            ctx.lineTo(-4, -3);
            ctx.closePath();
            ctx.fill();
            
        } else if (shipType === "purple") {
            // Purple Ship - Mystical/Magical Design
            const bodyGradient = ctx.createLinearGradient(-8, -8, 8, 8);
            bodyGradient.addColorStop(0, this.adjustColorBrightness(mainColor, lightFactor * 1.3));
            bodyGradient.addColorStop(0.5, this.adjustColorBrightness(mainColor, lightFactor));
            bodyGradient.addColorStop(1, this.adjustColorBrightness(mainColor, lightFactor * 0.7));
            
            // Hexagonal main body
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(7, -5);
            ctx.lineTo(7, 5);
            ctx.lineTo(0, 10);
            ctx.lineTo(-7, 5);
            ctx.lineTo(-7, -5);
            ctx.closePath();
            ctx.fill();
            
            // Energy cores
            ctx.shadowBlur = 0;
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
            coreGradient.addColorStop(0, this.adjustColorBrightness(accentColor, lightFactor * 1.5));
            coreGradient.addColorStop(1, this.adjustColorBrightness(accentColor, lightFactor * 0.8));
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(-5, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(5, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Central crystal
            ctx.fillStyle = this.adjustColorBrightness('#DDA0DD', lightFactor * 1.2);
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(3, 0);
            ctx.lineTo(0, 5);
            ctx.lineTo(-3, 0);
            ctx.closePath();
            ctx.fill();
            
        } else if (shipType === "golden") {
            // Golden Ship - Royal/Imperial Design
            const bodyGradient = ctx.createLinearGradient(-10, -10, 10, 10);
            bodyGradient.addColorStop(0, this.adjustColorBrightness(mainColor, lightFactor * 1.4));
            bodyGradient.addColorStop(0.5, this.adjustColorBrightness(mainColor, lightFactor));
            bodyGradient.addColorStop(1, this.adjustColorBrightness(mainColor, lightFactor * 0.6));
            
            // Regal main body
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, -4);
            ctx.lineTo(10, 3);
            ctx.lineTo(5, 10);
            ctx.lineTo(-5, 10);
            ctx.lineTo(-10, 3);
            ctx.lineTo(-8, -4);
            ctx.closePath();
            ctx.fill();
            
            // Crown-like top
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.adjustColorBrightness(accentColor, lightFactor * 1.3);
            ctx.beginPath();
            ctx.moveTo(-5, -10);
            ctx.lineTo(-3, -13);
            ctx.lineTo(0, -12);
            ctx.lineTo(3, -13);
            ctx.lineTo(5, -10);
            ctx.lineTo(0, -7);
            ctx.closePath();
            ctx.fill();
            
            // Royal gems
            ctx.fillStyle = this.adjustColorBrightness('#FF4500', lightFactor);
            ctx.beginPath();
            ctx.arc(-3, -7, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(3, -7, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // Default Ship - Military/Utilitarian Design
            const bodyGradient = ctx.createLinearGradient(-10, -10, 10, 10);
            bodyGradient.addColorStop(0, this.adjustColorBrightness(mainColor, lightFactor * 1.2));
            bodyGradient.addColorStop(0.5, this.adjustColorBrightness(mainColor, lightFactor));
            bodyGradient.addColorStop(1, this.adjustColorBrightness(mainColor, lightFactor * 0.8));
            
            // Angular military body
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(7, -3);
            ctx.lineTo(10, 7);
            ctx.lineTo(5, 10);
            ctx.lineTo(-5, 10);
            ctx.lineTo(-10, 7);
            ctx.lineTo(-7, -3);
            ctx.closePath();
            ctx.fill();
            
            // Angular cockpit
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.adjustColorBrightness(accentColor, lightFactor * 1.2);
            ctx.beginPath();
            ctx.moveTo(0, -7);
            ctx.lineTo(4, -2);
            ctx.lineTo(3, 2);
            ctx.lineTo(-3, 2);
            ctx.lineTo(-4, -2);
            ctx.closePath();
            ctx.fill();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Glass reflection (for all ships)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * lightFactor})`;
        ctx.beginPath();
        ctx.ellipse(-2, -5, 2, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine details with metallic effect
        ctx.strokeStyle = this.adjustColorBrightness('#FFFFFF', lightFactor);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        
        // Reduced engine glow
        const engineGlow = ctx.createRadialGradient(0, 8, 0, 0, 8, 8); // Reduced from 15 to 8
        engineGlow.addColorStop(0, `rgba(255, 100, 0, ${0.5 * lightFactor})`); // Reduced opacity from 0.8 to 0.5
        engineGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = engineGlow;
        ctx.beginPath();
        ctx.arc(0, 8, 8, 0, Math.PI * 2); // Reduced radius from 15 to 8
        ctx.fill();
        
        ctx.restore();
    }

    // Enhanced enemy ship rendering
    draw3DEnemyShip(x, y, width, height, type) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        
        const lightFactor = this.calculateLighting(x + width/2, y + height/2);
        
        let mainColor, accentColor;
        switch(type) {
            case "floatingShip":
                mainColor = '#0066CC';
                accentColor = '#88CCFF';
                break;
            case "floatingRock":
                mainColor = '#CC0000';
                accentColor = '#FFAAAA';
                break;
            case "hill":
                mainColor = '#00AA00';
                accentColor = '#AAFFAA';
                break;
        }
        
        // Main body with gradient
        const bodyGradient = ctx.createLinearGradient(0, 0, width, height);
        bodyGradient.addColorStop(0, this.adjustColorBrightness(mainColor, lightFactor * 1.2));
        bodyGradient.addColorStop(0.5, this.adjustColorBrightness(mainColor, lightFactor));
        bodyGradient.addColorStop(1, this.adjustColorBrightness(mainColor, lightFactor * 0.8));
        
        ctx.fillStyle = bodyGradient;
        
        if (type === "floatingShip") {
            // Sleek fighter design
            ctx.beginPath();
            ctx.moveTo(0, height/2);
            ctx.lineTo(width, height/2);
            ctx.lineTo(width * 0.8, 0);
            ctx.lineTo(width * 0.2, 0);
            ctx.closePath();
            ctx.fill();
            
            // Add engine trails
            this.addEngineTrail(width/2, height * 0.7, '#00CCFF');
            
        } else if (type === "floatingRock") {
            // Diamond fighter
            ctx.beginPath();
            ctx.moveTo(width/2, 0);
            ctx.lineTo(width, height/2);
            ctx.lineTo(width/2, height);
            ctx.lineTo(0, height/2);
            ctx.closePath();
            ctx.fill();
            
            this.addEngineTrail(width/2, height * 0.8, '#FF6600');
            
        } else if (type === "hill") {
            // Hexagonal fighter
            ctx.beginPath();
            ctx.moveTo(0, height/2);
            ctx.lineTo(width/4, 0);
            ctx.lineTo(width * 3/4, 0);
            ctx.lineTo(width, height/2);
            ctx.lineTo(width * 3/4, height);
            ctx.lineTo(width/4, height);
            ctx.closePath();
            ctx.fill();
        }
        
        // Cockpit
        ctx.fillStyle = this.adjustColorBrightness(accentColor, lightFactor);
        ctx.beginPath();
        ctx.ellipse(width/2, height/2, width/5, height/4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Add engine trail effect
    addEngineTrail(x, y, color) {
        const ctx = this.ctx;
        const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        trailGradient.addColorStop(0, color);
        trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Enhanced wall rendering with texture and depth
    draw3DWall(wall) {
        const ctx = this.ctx;
        const depth = 8;
        const lightFactor = this.calculateLighting(wall.x + wall.width/2, wall.y + wall.height/2);
        
        // Create rock texture
        const baseColor = '#444444';
        const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y + wall.height);
        gradient.addColorStop(0, this.adjustColorBrightness('#555555', lightFactor * 1.2));
        gradient.addColorStop(0.3, this.adjustColorBrightness(baseColor, lightFactor));
        gradient.addColorStop(0.7, this.adjustColorBrightness('#333333', lightFactor * 0.8));
        gradient.addColorStop(1, this.adjustColorBrightness('#222222', lightFactor * 0.6));
        
        // Main face
        ctx.fillStyle = gradient;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        
        // Right face (depth)
        ctx.fillStyle = this.adjustColorBrightness('#333333', lightFactor * 0.7);
        ctx.beginPath();
        ctx.moveTo(wall.x + wall.width, wall.y);
        ctx.lineTo(wall.x + wall.width + depth, wall.y - depth);
        ctx.lineTo(wall.x + wall.width + depth, wall.y + wall.height - depth);
        ctx.lineTo(wall.x + wall.width, wall.y + wall.height);
        ctx.closePath();
        ctx.fill();
        
        // Top face
        ctx.fillStyle = this.adjustColorBrightness('#555555', lightFactor * 1.1);
        ctx.beginPath();
        ctx.moveTo(wall.x, wall.y);
        ctx.lineTo(wall.x + depth, wall.y - depth);
        ctx.lineTo(wall.x + wall.width + depth, wall.y - depth);
        ctx.lineTo(wall.x + wall.width, wall.y);
        ctx.closePath();
        ctx.fill();
        
        // Add texture details
        this.addRockTexture(wall.x, wall.y, wall.width, wall.height, lightFactor);
    }

    // Add rock texture details
    addRockTexture(x, y, width, height, lightFactor) {
        const ctx = this.ctx;
        const seed = x * y; // Consistent randomness
        
        ctx.strokeStyle = this.adjustColorBrightness('#222222', lightFactor);
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Add cracks and details
        for (let i = 0; i < 3; i++) {
            const x1 = x + ((seed * (i+1)) % width);
            const y1 = y + ((seed * (i+2)) % height);
            const x2 = x + ((seed * (i+3)) % width);
            const y2 = y + ((seed * (i+4)) % height);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        
        // Add mineral veins
        ctx.strokeStyle = this.adjustColorBrightness('#666666', lightFactor);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const veinX = x + (seed % width);
        const veinY = y + ((seed * 2) % height);
        ctx.moveTo(veinX, y);
        ctx.quadraticCurveTo(veinX + width/4, veinY, veinX + width/2, y + height);
        ctx.stroke();
    }

    // Enhanced platform rendering
    draw3DPlatform(platform) {
        const ctx = this.ctx;
        const depth = 12;
        const lightFactor = this.calculateLighting(platform.x + platform.width/2, platform.y + platform.height/2);
        
        let baseColor = platform.isStart ? '#4444FF' : '#FFFF44';
        let accentColor = platform.isStart ? '#8888FF' : '#FFFF88';
        
        // Main platform with metallic gradient
        const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        gradient.addColorStop(0, this.adjustColorBrightness(accentColor, lightFactor * 1.3));
        gradient.addColorStop(0.5, this.adjustColorBrightness(baseColor, lightFactor));
        gradient.addColorStop(1, this.adjustColorBrightness(baseColor, lightFactor * 0.7));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // 3D depth
        ctx.fillStyle = this.adjustColorBrightness(baseColor, lightFactor * 0.6);
        ctx.beginPath();
        ctx.moveTo(platform.x + platform.width, platform.y);
        ctx.lineTo(platform.x + platform.width + depth, platform.y - depth);
        ctx.lineTo(platform.x + platform.width + depth, platform.y + platform.height - depth);
        ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
        ctx.closePath();
        ctx.fill();
        
        // Top face
        ctx.fillStyle = this.adjustColorBrightness(accentColor, lightFactor * 1.2);
        ctx.beginPath();
        ctx.moveTo(platform.x, platform.y);
        ctx.lineTo(platform.x + depth, platform.y - depth);
        ctx.lineTo(platform.x + platform.width + depth, platform.y - depth);
        ctx.lineTo(platform.x + platform.width, platform.y);
        ctx.closePath();
        ctx.fill();
        
        // Landing lights with glow
        for (let i = 0; i < platform.width; i += 15) {
            const lightOn = Math.floor(Date.now() / 300) % 2 === 0;
            if (lightOn) {
                const lightColor = platform.isStart ? '#00CCFF' : '#FFAA00';
                
                // Light glow
                const lightGlow = ctx.createRadialGradient(
                    platform.x + i + 7, platform.y - 5, 0,
                    platform.x + i + 7, platform.y - 5, 10
                );
                lightGlow.addColorStop(0, lightColor);
                lightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = lightGlow;
                ctx.beginPath();
                ctx.arc(platform.x + i + 7, platform.y - 5, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Light source
                ctx.fillStyle = lightColor;
                ctx.fillRect(platform.x + i, platform.y - 3, 8, 3);
            }
        }
    }

    // Enhanced gem rendering with sparkle effects
    draw3DGem(gem) {
        if (gem.collected) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(gem.x, gem.y);
        
        // Rotation animation
        gem.rotationAngle = (gem.rotationAngle + 0.1) % (Math.PI * 2);
        ctx.rotate(gem.rotationAngle);
        
        const lightFactor = this.calculateLighting(gem.x, gem.y);
        
        // Gem facets
        const facets = 8;
        const angleStep = (Math.PI * 2) / facets;
        
        for (let i = 0; i < facets; i++) {
            const angle = i * angleStep;
            const nextAngle = (i + 1) * angleStep;
            
            // Alternate light and dark facets
            const facetBrightness = (i % 2 === 0) ? lightFactor * 1.5 : lightFactor * 0.8;
            ctx.fillStyle = this.adjustColorBrightness('#FFD700', facetBrightness);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * gem.radius, Math.sin(angle) * gem.radius);
            ctx.lineTo(Math.cos(nextAngle) * gem.radius, Math.sin(nextAngle) * gem.radius);
            ctx.closePath();
            ctx.fill();
        }
        
        // Center highlight
        ctx.fillStyle = this.adjustColorBrightness('#FFFFFF', lightFactor);
        ctx.beginPath();
        ctx.arc(0, 0, gem.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkle effects
        if (Math.random() < 0.3) {
            this.addSparkle(0, 0, '#FFFFFF');
        }
        
        ctx.restore();
    }

    // Add sparkle effect
    addSparkle(x, y, color) {
        const ctx = this.ctx;
        const sparkleSize = 2 + Math.random() * 3;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - sparkleSize);
        ctx.lineTo(x + sparkleSize/2, y);
        ctx.lineTo(x, y + sparkleSize);
        ctx.lineTo(x - sparkleSize/2, y);
        ctx.closePath();
        ctx.fill();
    }

    // Particle system
    addParticle(x, y, type, color = '#FFFFFF') {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: 0.02,
            size: 2 + Math.random() * 3,
            color: color,
            type: type
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.type === 'spark') {
                particle.vy += 0.1; // Gravity
            }
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    renderParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            if (particle.type === 'spark') {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (particle.type === 'explosion') {
                ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
            }
            
            ctx.restore();
        });
    }

    // Lighting calculation
    calculateLighting(x, y) {
        let totalLight = this.ambientLight;
        
        this.lightSources.forEach(light => {
            const distance = Math.sqrt((x - light.x) ** 2 + (y - light.y) ** 2);
            const lightContribution = light.intensity / (1 + distance * 0.001);
            totalLight += lightContribution;
        });
        
        return Math.min(totalLight, 1.5);
    }

    // Color brightness adjustment
    adjustColorBrightness(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Adjust brightness
        const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
        const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
        const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    // Enhanced background with depth
    renderEnhancedBackground() {
        const ctx = this.ctx;
        
        // Deep space gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#000033');
        bgGradient.addColorStop(0.3, '#000066');
        bgGradient.addColorStop(0.7, '#000044');
        bgGradient.addColorStop(1, '#001122');
        
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nebula effects
        this.renderNebula();
        
        // Enhanced stars with twinkling
        this.renderEnhancedStars();
    }

    renderNebula() {
        const ctx = this.ctx;
        const time = Date.now() * 0.001;
        
        // Create nebula clouds
        for (let i = 0; i < 3; i++) {
            const x = (this.canvas.width * (i + 1) / 4) + Math.sin(time + i) * 50;
            const y = (this.canvas.height * 0.3) + Math.cos(time * 0.7 + i) * 30;
            
            const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
            nebulaGradient.addColorStop(0, `rgba(100, 50, 200, ${0.1 + Math.sin(time + i) * 0.05})`);
            nebulaGradient.addColorStop(0.5, `rgba(50, 100, 255, ${0.05 + Math.cos(time + i) * 0.03})`);
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = nebulaGradient;
            ctx.beginPath();
            ctx.arc(x, y, 150, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderEnhancedStars() {
        const ctx = this.ctx;
        const time = Date.now() * 0.001;
        
        // Generate consistent stars
        for (let i = 0; i < 100; i++) {
            const x = (i * 123.456) % this.canvas.width;
            const y = (i * 789.123) % this.canvas.height;
            const size = 0.5 + (i % 3);
            const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2 + i * 0.1));
            
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add star glow for larger stars
            if (size > 2) {
                const starGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                starGlow.addColorStop(0, `rgba(255, 255, 255, ${twinkle * 0.3})`);
                starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = starGlow;
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Export for use in game
window.VisualEffects = VisualEffects; 