// Use global THREE object instead of ES module imports
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

// Board dimensions (4x4x4 grid)
const BOARD_SIZE = 4;
const CELL_SIZE = 1;
const GRID_GAP = 0.2;
const TOTAL_SIZE = BOARD_SIZE * (CELL_SIZE + GRID_GAP);

export const board = {
    grid: Array(BOARD_SIZE).fill().map(() => 
          Array(BOARD_SIZE).fill().map(() => 
          Array(BOARD_SIZE).fill(0))),
    pieces: [],
    columnHitboxes: [],
    gridLines: null,
    
    init(scene) {
        this.scene = scene;
        this.createGrid();
        this.createColumnHitboxes();
    },
    
    createGrid() {
        // Create grid structure
        const gridGroup = new THREE.Group();
        
        // Create frame edges
        const edges = new THREE.Object3D();
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2 });
        
        // Create horizontal and vertical grid lines to visualize the structure
        const gridGeometry = new THREE.BufferGeometry();
        const gridPositions = [];
        
        // Create the horizontal grid lines
        for (let y = 0; y <= BOARD_SIZE; y++) {
            const yPos = y * (CELL_SIZE + GRID_GAP) - GRID_GAP / 2;
            
            for (let x = 0; x < BOARD_SIZE; x++) {
                const xPos = x * (CELL_SIZE + GRID_GAP);
                
                // Z-direction lines
                gridPositions.push(xPos, yPos, 0);
                gridPositions.push(xPos, yPos, TOTAL_SIZE - GRID_GAP);
            }
            
            for (let z = 0; z < BOARD_SIZE; z++) {
                const zPos = z * (CELL_SIZE + GRID_GAP);
                
                // X-direction lines
                gridPositions.push(0, yPos, zPos);
                gridPositions.push(TOTAL_SIZE - GRID_GAP, yPos, zPos);
            }
        }
        
        // Create the vertical grid lines
        for (let x = 0; x <= BOARD_SIZE; x++) {
            const xPos = x * (CELL_SIZE + GRID_GAP) - GRID_GAP / 2;
            
            for (let z = 0; z < BOARD_SIZE; z++) {
                const zPos = z * (CELL_SIZE + GRID_GAP);
                
                // Y-direction lines
                gridPositions.push(xPos, 0, zPos);
                gridPositions.push(xPos, TOTAL_SIZE - GRID_GAP, zPos);
            }
        }
        
        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
        this.gridLines = new THREE.LineSegments(gridGeometry, edgeMaterial);
        
        // Center the grid at origin
        const offset = TOTAL_SIZE / 2 - GRID_GAP / 2;
        this.gridLines.position.set(-offset, -offset, -offset);
        
        this.scene.add(this.gridLines);
    },
    
    createColumnHitboxes() {
        this.columnHitboxes = [];
        
        // Create invisible hitboxes for each column
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let z = 0; z < BOARD_SIZE; z++) {
                const geometry = new THREE.BoxGeometry(CELL_SIZE, TOTAL_SIZE, CELL_SIZE);
                const material = new THREE.MeshBasicMaterial({ 
                    transparent: true, 
                    opacity: 0.0,
                    wireframe: false
                });
                
                const hitbox = new THREE.Mesh(geometry, material);
                const columnIndex = x * BOARD_SIZE + z;
                hitbox.userData = { columnIndex };
                
                // Position the hitbox
                const xPos = x * (CELL_SIZE + GRID_GAP) - TOTAL_SIZE / 2 + CELL_SIZE / 2;
                const zPos = z * (CELL_SIZE + GRID_GAP) - TOTAL_SIZE / 2 + CELL_SIZE / 2;
                
                hitbox.position.set(xPos, 0, zPos);
                this.columnHitboxes.push(hitbox);
                this.scene.add(hitbox);
            }
        }
    },
    
    getColumnHitboxes() {
        return this.columnHitboxes;
    },
    
    canDropPiece(columnIndex) {
        const x = Math.floor(columnIndex / BOARD_SIZE);
        const z = columnIndex % BOARD_SIZE;
        
        // Check if the top cell is empty
        return this.grid[x][BOARD_SIZE - 1][z] === 0;
    },
    
    dropPiece(columnIndex, playerId) {
        const x = Math.floor(columnIndex / BOARD_SIZE);
        const z = columnIndex % BOARD_SIZE;
        
        // Find the lowest empty cell in the column
        let y = 0;
        while (y < BOARD_SIZE && this.grid[x][y][z] === 0) {
            y++;
        }
        
        // Move back one step to the empty cell
        y--;
        
        if (y >= 0) {
            // Update the grid
            this.grid[x][y][z] = playerId;
            
            // Create and add a piece
            return this.createPiece(x, y, z, playerId);
        }
        
        return null;
    },
    
    createPiece(x, y, z, playerId) {
        const geometry = new THREE.SphereGeometry(CELL_SIZE / 2 - 0.05, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: playerId === 1 ? 0xff4444 : 0x4444ff,
            shininess: 100
        });
        
        const piece = new THREE.Mesh(geometry, material);
        
        // Position the piece within the grid
        const xPos = x * (CELL_SIZE + GRID_GAP) - TOTAL_SIZE / 2 + CELL_SIZE / 2;
        const yPos = y * (CELL_SIZE + GRID_GAP) - TOTAL_SIZE / 2 + CELL_SIZE / 2;
        const zPos = z * (CELL_SIZE + GRID_GAP) - TOTAL_SIZE / 2 + CELL_SIZE / 2;
        
        piece.position.set(xPos, yPos, zPos);
        
        this.pieces.push(piece);
        this.scene.add(piece);
        
        return { x, y, z, piece };
    },
    
    highlightWinningPieces(winningPositions) {
        winningPositions.forEach(pos => {
            const { x, y, z } = pos;
            
            // Find the piece at this position
            for (const piece of this.pieces) {
                const pieceX = Math.round((piece.position.x + TOTAL_SIZE / 2 - CELL_SIZE / 2) / (CELL_SIZE + GRID_GAP));
                const pieceY = Math.round((piece.position.y + TOTAL_SIZE / 2 - CELL_SIZE / 2) / (CELL_SIZE + GRID_GAP));
                const pieceZ = Math.round((piece.position.z + TOTAL_SIZE / 2 - CELL_SIZE / 2) / (CELL_SIZE + GRID_GAP));
                
                if (pieceX === x && pieceY === y && pieceZ === z) {
                    // Highlight the winning piece
                    piece.material = new THREE.MeshPhongMaterial({ 
                        color: 0xffff00,
                        shininess: 100,
                        emissive: 0x444400
                    });
                    break;
                }
            }
        });
    },
    
    reset() {
        // Clear the grid
        this.grid = Array(BOARD_SIZE).fill().map(() => 
                  Array(BOARD_SIZE).fill().map(() => 
                  Array(BOARD_SIZE).fill(0)));
        
        // Remove all pieces
        for (const piece of this.pieces) {
            this.scene.remove(piece);
        }
        this.pieces = [];
    }
}; 