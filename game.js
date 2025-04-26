import { board } from './board.js';

// Board dimensions
const BOARD_SIZE = 4;

export const game = {
    currentPlayer: 1, // 1 = player, 2 = AI
    isGameOver: false,
    infoElement: null,
    
    init() {
        this.infoElement = document.getElementById('info');
        this.resetGame();
    },
    
    makePlayerMove(columnIndex) {
        if (this.isGameOver || this.currentPlayer !== 1) {
            return;
        }
        
        if (!board.canDropPiece(columnIndex)) {
            this.updateInfo('Column is full! Try another.');
            return;
        }
        
        const result = board.dropPiece(columnIndex, this.currentPlayer);
        
        if (result) {
            const { x, y, z } = result;
            
            // Check for win
            const winningPositions = this.checkWin(x, y, z, this.currentPlayer);
            if (winningPositions) {
                this.gameOver(`You win!`);
                board.highlightWinningPieces(winningPositions);
                return;
            }
            
            // Check for draw
            if (this.checkDraw()) {
                this.gameOver('Game ended in a draw!');
                return;
            }
            
            // Switch to AI
            this.currentPlayer = 2;
            this.updateInfo("AI is thinking...");
            
            // AI makes a move after a short delay
            setTimeout(() => {
                this.makeAIMove();
            }, 700);
        }
    },
    
    makeAIMove() {
        if (this.isGameOver || this.currentPlayer !== 2) {
            return;
        }
        
        // Simple AI strategy
        let bestColumn = this.findBestMove();
        
        // If no best move found or column is full, pick a random valid column
        if (bestColumn === -1 || !board.canDropPiece(bestColumn)) {
            bestColumn = this.getRandomValidColumn();
        }
        
        const result = board.dropPiece(bestColumn, this.currentPlayer);
        
        if (result) {
            const { x, y, z } = result;
            
            // Check for win
            const winningPositions = this.checkWin(x, y, z, this.currentPlayer);
            if (winningPositions) {
                this.gameOver('AI wins!');
                board.highlightWinningPieces(winningPositions);
                return;
            }
            
            // Check for draw
            if (this.checkDraw()) {
                this.gameOver('Game ended in a draw!');
                return;
            }
            
            // Switch back to player
            this.currentPlayer = 1;
            this.updateInfo('Your Turn');
        }
    },
    
    findBestMove() {
        // Try to find a winning move
        for (let col = 0; col < BOARD_SIZE * BOARD_SIZE; col++) {
            if (!board.canDropPiece(col)) continue;
            
            // Clone the grid to simulate the move
            const tempGrid = JSON.parse(JSON.stringify(board.grid));
            const x = Math.floor(col / BOARD_SIZE);
            const z = col % BOARD_SIZE;
            
            // Find the lowest empty cell in the column
            let y = 0;
            while (y < BOARD_SIZE && tempGrid[x][y][z] === 0) {
                y++;
            }
            y--; // Move back to the empty cell
            
            if (y >= 0) {
                tempGrid[x][y][z] = 2; // AI player
                
                // Check if this is a winning move
                if (this.checkWinInGrid(x, y, z, 2, tempGrid)) {
                    return col;
                }
            }
        }
        
        // Try to block player's winning move
        for (let col = 0; col < BOARD_SIZE * BOARD_SIZE; col++) {
            if (!board.canDropPiece(col)) continue;
            
            // Clone the grid to simulate the move
            const tempGrid = JSON.parse(JSON.stringify(board.grid));
            const x = Math.floor(col / BOARD_SIZE);
            const z = col % BOARD_SIZE;
            
            // Find the lowest empty cell in the column
            let y = 0;
            while (y < BOARD_SIZE && tempGrid[x][y][z] === 0) {
                y++;
            }
            y--; // Move back to the empty cell
            
            if (y >= 0) {
                tempGrid[x][y][z] = 1; // Player
                
                // Check if player would win with this move
                if (this.checkWinInGrid(x, y, z, 1, tempGrid)) {
                    return col;
                }
            }
        }
        
        // If no winning or blocking move, choose a random column
        return this.getRandomValidColumn();
    },
    
    getRandomValidColumn() {
        const validColumns = [];
        
        for (let col = 0; col < BOARD_SIZE * BOARD_SIZE; col++) {
            if (board.canDropPiece(col)) {
                validColumns.push(col);
            }
        }
        
        if (validColumns.length === 0) {
            return -1;
        }
        
        return validColumns[Math.floor(Math.random() * validColumns.length)];
    },
    
    checkWin(x, y, z, player) {
        return this.checkWinInGrid(x, y, z, player, board.grid);
    },
    
    checkWinInGrid(x, y, z, player, grid) {
        // All 13 possible directions to check (3D)
        const directions = [
            // Straight lines (6 directions)
            [1, 0, 0], [-1, 0, 0],  // x-axis
            [0, 1, 0], [0, -1, 0],  // y-axis
            [0, 0, 1], [0, 0, -1],  // z-axis
            
            // Diagonals in xy-plane (4 directions)
            [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
            
            // Diagonals in xz-plane (4 directions)
            [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
            
            // Diagonals in yz-plane (4 directions)
            [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1],
            
            // 3D diagonals (8 directions)
            [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
            [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
        ];
        
        // For each direction, check if there are 4 pieces in a row
        for (let i = 0; i < directions.length; i += 2) {
            const dir1 = directions[i];
            const dir2 = directions[i + 1];
            
            const line = [];
            line.push({x, y, z});
            
            // Check in dir1 direction
            let count = 1;
            let nx = x + dir1[0];
            let ny = y + dir1[1];
            let nz = z + dir1[2];
            
            while (
                nx >= 0 && nx < BOARD_SIZE &&
                ny >= 0 && ny < BOARD_SIZE &&
                nz >= 0 && nz < BOARD_SIZE &&
                grid[nx][ny][nz] === player
            ) {
                count++;
                line.push({x: nx, y: ny, z: nz});
                nx += dir1[0];
                ny += dir1[1];
                nz += dir1[2];
            }
            
            // Check in dir2 direction
            nx = x + dir2[0];
            ny = y + dir2[1];
            nz = z + dir2[2];
            
            while (
                nx >= 0 && nx < BOARD_SIZE &&
                ny >= 0 && ny < BOARD_SIZE &&
                nz >= 0 && nz < BOARD_SIZE &&
                grid[nx][ny][nz] === player
            ) {
                count++;
                line.push({x: nx, y: ny, z: nz});
                nx += dir2[0];
                ny += dir2[1];
                nz += dir2[2];
            }
            
            if (count >= 4) {
                return line;
            }
        }
        
        return null;
    },
    
    checkDraw() {
        // Game is a draw if all columns are full
        for (let col = 0; col < BOARD_SIZE * BOARD_SIZE; col++) {
            if (board.canDropPiece(col)) {
                return false;
            }
        }
        return true;
    },
    
    gameOver(message) {
        this.isGameOver = true;
        this.updateInfo(message + ' Click Reset to play again.');
    },
    
    updateInfo(message) {
        if (this.infoElement) {
            this.infoElement.textContent = message;
        }
    },
    
    resetGame() {
        board.reset();
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.updateInfo('Your Turn');
    }
};

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    game.init();
}); 