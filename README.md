# 3D Connect 4

A 3D version of the classic Connect 4 game using Three.js. Play against an AI opponent in a 4x4x4 cubic grid.

## How to Play

1. Open `index.html` in a web browser
2. Use the mouse to rotate the game board for a better view
3. Click on a column to drop your piece (red)
4. The AI opponent (blue) will automatically make its move
5. Get 4 pieces in a row in any direction (horizontal, vertical, diagonal or 3D diagonal) to win
6. Press the Reset button to start a new game

## Controls

- **Left mouse button + drag**: Rotate the game board
- **Mouse wheel**: Zoom in/out
- **Right mouse button + drag**: Pan the view
- **Click**: Drop piece in a column

## Game Features

- 4x4x4 cubic grid
- 3D visualization with ThreeJS
- Simple AI opponent
- Win detection for all possible 3D alignments
- Interactive 3D environment with rotation controls

## Technical Details

- Built using Three.js for 3D rendering
- No external dependencies required, everything loaded via CDN
- Responsive design that works on most modern browsers

## Browser Compatibility

Works best in the latest versions of:
- Chrome
- Firefox
- Edge
- Safari

## Tips

- Rotate the board often to get a better view of the game state
- Watch for 3D diagonals - they can be hard to spot!
- The AI will block your winning moves and try to create its own winning positions 