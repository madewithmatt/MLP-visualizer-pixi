import { Container, Sprite, Texture, Point, Rectangle } from "pixi.js";

// ========== CONSTANTS ========== //
const GRID_SIZE = 28;
const BRUSH_RADIUS = 1; // 1 pixel in each direction affected
const gridContainerWidth = 384; // Make this dynamic based on viewport size in future
const cellSize = gridContainerWidth / GRID_SIZE;

export const initializeGrids = (): {pixelData: number[][], spriteMatrix: Sprite[][], gridContainer: Container} => {
    // Container for the grid and sizes
    const gridContainer = new Container();
    gridContainer.eventMode = "static";
    gridContainer.hitArea = new Rectangle(0, 0, gridContainerWidth, gridContainerWidth);

    // Initialize pd as all 0s and spriteMatrix as all black boxes of proper size and position
    const pixelData: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    const spriteMatrix: Sprite[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        const spriteRow: Sprite[] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const sprite = new Sprite(Texture.WHITE);
            sprite.width = cellSize;
            sprite.height = cellSize;
            sprite.x = col * cellSize;
            sprite.y = row * cellSize;
            sprite.tint = 0x000000;
            gridContainer.addChild(sprite);
            spriteRow.push(sprite);
        }
        spriteMatrix.push(spriteRow);
    }

    // =================== EVENT LISTENERS =================== //

    return {pixelData, spriteMatrix, gridContainer};
}


/**
 * Updates the pixelData and spriteMatrix to reflect a draw action at the given position.
 * @param pos Position of the cursor RELATIVE to the gridContainer
 */
export const paintAt = (pixelData: number[][], spriteMatrix: Sprite[][], pos: Point) => {
const col = Math.floor(pos.x / cellSize);
const row = Math.floor(pos.y / cellSize);

// Iterate over the cells adjacent to the cell we've painted in
for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
    for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {

        // row and col of cell were checking
        const currRow = row + dy;
        const currCol = col + dx;
        if (currRow < 0 || currCol < 0 || currRow >= GRID_SIZE || currCol >= GRID_SIZE)
            continue;

        // get coords for center of this cell
        const centerX = currCol * cellSize + cellSize / 2;
        const centerY = currRow * cellSize + cellSize / 2;

        // calc distance between center of cell and cursor
        const dist = Math.hypot(pos.x - centerX, pos.y - centerY);

        // calc val of the cell based on distance (0-255)
        const val = Math.ceil(255 * (1 - Math.min(dist, cellSize * 2) / (cellSize * 2)));

        // update pixelData and spriteMatrix
        if (pixelData[currRow][currCol] < val) {
            pixelData[currRow][currCol] = val;
            spriteMatrix[currRow][currCol].tint = (val << 16) | (val << 8) | val; // RGB value
        }
    }
}
}
