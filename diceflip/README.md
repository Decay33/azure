# 🎲 Flip Dice - Match 3 Game

A beautiful and engaging match-3 puzzle game where you flip dice to create matches instead of swapping pieces!

## 🎮 How to Play

### Objective
Create horizontal or vertical matches of 3 or more identical numbers by flipping dice with limited directional arrows.

### Game Controls
1. **Click on any dice** to select it
2. **Choose a direction** (↑↓←→) to flip the dice
3. **Watch the preview** - each direction shows what number will appear on top
4. **Create matches** of 3+ identical numbers in a row
5. **Watch chains** - dice fall down and new ones drop, potentially creating combo matches!

### Scoring System
- **3 in a row**: 100 points
- **4 in a row**: 200 points  
- **5 in a row**: 400 points
- **6+ in a row**: +100 points per extra dice
- **Chain reactions**: +50 bonus per combo level
- **Unused arrows**: +10 points each at level end

### Level Progression
- **Level 1**: Reach 1000 points
- **Each level**: Goal increases by +150 points
- **Arrow bonus**: +1 random directional arrow each level
- **Infinite levels**: Keep playing as long as you can!

### Game Features
- **Real dice physics** - dice flip according to actual 3D dice mechanics
- **Beautiful animations** - smooth flipping, falling, and matching effects
- **Strategic depth** - plan your moves carefully with limited arrows
- **Hint system** - get help when you're stuck
- **Undo function** - take back your last move
- **Responsive design** - works on desktop and mobile

## 🎯 Strategy Tips

1. **Study the previews** - each direction shows exactly what number will appear
2. **Plan for chains** - look for potential cascading matches
3. **Conserve arrows** - don't waste moves on obvious non-matches  
4. **Think 3D** - remember that dice have 6 faces with opposite sides summing to 7
5. **Use hints** - when stuck, the hint button will highlight a good move
6. **Undo wisely** - you can undo your last move if needed

## 🛠️ Technical Features

- **Pure JavaScript** - no external dependencies
- **CSS3 animations** - smooth and performant visual effects
- **Responsive design** - adapts to different screen sizes
- **Local storage** - scores and progress could be saved (feature ready)
- **Modern ES6+** - clean, maintainable code structure

## 📱 Browser Support

Works on all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚀 Getting Started

1. Simply open `index.html` in your web browser
2. No installation or setup required!
3. Start playing immediately

## 🎨 Game Assets

The game uses:
- CSS gradients for beautiful backgrounds
- Unicode arrows for directional indicators
- CSS animations for smooth dice flipping
- Modern typography for clear readability

## 🔮 Future Enhancements

The game is designed to be easily expandable with:
- **Frozen Dice**: Can't flip until adjacent match
- **Bomb Dice**: Clear 3x3 area when matched
- **Wildcard Dice**: Act as any number
- **Locked Dice**: Require 2 matches to clear
- **Power-ups**: Special abilities and boosts
- **Leaderboards**: Track high scores
- **Sound effects**: Audio feedback for actions
- **Themes**: Different visual styles

## 🎲 Dice Mechanics

The game implements realistic dice physics:
- Opposite faces always sum to 7 (1-6, 2-5, 3-4)
- Flipping follows 3D rotation rules
- Each dice maintains its orientation consistently
- 24 possible orientations per dice

Enjoy playing **Flip Dice**! 🎮✨ 