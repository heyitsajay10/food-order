# Interactive Chess Game with AI Opponent

A fully functional chess game built with vanilla JavaScript, featuring an AI opponent powered by the minimax algorithm with alpha-beta pruning.

## Features

### Core Gameplay
- **8x8 Chessboard**: Standard chess notation with clean grid styling
- **All Chess Pieces**: Complete set with proper Unicode symbols
- **Standard Chess Rules**: Full implementation of piece-specific movement rules
- **Check Detection**: Visual indicators when kings are in check
- **Win Conditions**: Checkmate, stalemate, and resignation detection

### AI Opponent
- **Minimax Algorithm**: Implements minimax with configurable depth (default: 3)
- **Alpha-Beta Pruning**: Performance optimization for faster move calculation
- **Position Evaluation**: Advanced scoring based on:
  - Piece values (pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000)
  - Position bonuses for strategic placement
  - Mobility (number of available moves)
  - Check status
- **Automatic Moves**: AI responds automatically after player moves

### User Interface
- **Drag and Drop**: Move pieces by dragging with mouse
- **Touch Support**: Full touch input support for mobile devices
- **Visual Feedback**:
  - Selected piece highlighting (yellow)
  - Valid move indicators (green with dots)
  - Last move highlighting (light yellow)
  - Check status (red with pulsing animation)
- **Dark Theme**: High-contrast design for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Game Management
- **Move History**: Complete log of all moves with notation
- **Restart Button**: Reset game at any time
- **Turn Indicator**: Clear display of current player
- **Game Status Messages**: Real-time updates on game state

## How to Play

1. **Open the Game**: Open `index.html` in any modern web browser
2. **Make Your Move**: 
   - Click a white piece to select it (valid moves will highlight)
   - Click a highlighted square to move
   - Or drag and drop pieces to move them
3. **AI Response**: The AI will automatically make its move after yours
4. **Win the Game**: Checkmate the black king to win!

## Technical Details

### Files Structure
- `index.html` - Main HTML structure
- `styles.css` - All styling with dark theme and responsive design
- `game.js` - Core chess game logic, move validation, and rules
- `ai.js` - AI opponent with minimax algorithm and position evaluation
- `app.js` - UI handling, drag-drop, and game flow control

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- AI typically calculates moves in 100-500ms at depth 3
- Smooth animations and responsive UI
- Optimized board rendering

## Development

No build process required! Pure HTML, CSS, and JavaScript.

To run locally:
```bash
# Option 1: Python HTTP server
python3 -m http.server 8080

# Option 2: Node.js HTTP server
npx http-server

# Then open http://localhost:8080
```

## Chess Rules Implemented

- ✅ Pawn moves (single/double step, capture diagonally)
- ✅ Rook moves (horizontal/vertical)
- ✅ Knight moves (L-shape)
- ✅ Bishop moves (diagonal)
- ✅ Queen moves (horizontal/vertical/diagonal)
- ✅ King moves (one square in any direction)
- ✅ Check detection
- ✅ Checkmate detection
- ✅ Stalemate detection
- ✅ Move validation (can't move into check)
- ✅ Path blocking (pieces can't jump except knights)

## Future Enhancements

Possible improvements:
- En passant capture
- Castling
- Pawn promotion
- Three-fold repetition
- 50-move rule
- Adjustable AI difficulty
- Two-player mode
- Move timer
- Sound effects
- Game save/load

## License

Free to use and modify.
