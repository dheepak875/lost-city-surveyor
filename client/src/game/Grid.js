export class Grid {
    constructor(rows = 20, cols = 20) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Array(rows * cols).fill(0); // 0 = Empty, 1 = Structure
        this.scanned = new Array(rows * cols).fill(0); // Heatmap density values
        this.drilled = new Array(rows * cols).fill(false); // Revealed tiles
        this.excavated = new Array(rows * cols).fill(false); // Fully excavated tiles
        
        this.structures = [];
        this.generateMap();
    }

    generateMap() {
        // Reset
        this.data.fill(0);
        this.structures = [];

        const pyramidShape = [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [1, 1, 1, 1, 1]
        ];

        const tombShape = [
            [1, 1, 1],
            [1, 0, 1],
            [1, 0, 1]
        ];

        // Structures to place
        const definitions = [
            { type: 'Monument', w: 4, h: 4, count: 1, fill: true },
            { type: 'Wall', w: 4, h: 1, count: 1, fill: true, rotate: true },
            { type: 'Tomb', w: 3, h: 3, count: 1, shape: tombShape },
            { type: 'Relic', w: 2, h: 2, count: 1, fill: true },
            { type: 'Pyramid', w: 5, h: 3, count: 1, shape: pyramidShape }
        ];

        definitions.forEach(def => {
            for (let i = 0; i < def.count; i++) {
                this.placeStructure(def);
            }
        });
    }

    placeStructure(def) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            let w = def.w;
            let h = def.h;
            let shape = def.shape;
            
            // Handle rotation (only for filled rects like Wall for now to keep shapes simple)
            if (def.rotate && Math.random() > 0.5) {
                [w, h] = [h, w];
            }

            const r = Math.floor(Math.random() * (this.rows - h + 1));
            const c = Math.floor(Math.random() * (this.cols - w + 1));
            
            if (this.canPlace(r, c, w, h)) {
                this.commitStructure(r, c, w, h, def.type, shape);
                placed = true;
            }
            attempts++;
        }
    }

    canPlace(r, c, w, h) {
        for (let i = r; i < r + h; i++) {
            for (let j = c; j < c + w; j++) {
                if (this.data[i * this.cols + j] !== 0) return false;
            }
        }
        return true;
    }

    commitStructure(r, c, w, h, type, shape) {
        const structureCells = [];
        
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                // If using a shape mask, check it. If no shape, assume filled rectangle.
                let isStructure = true;
                if (shape) {
                     // Shape grid logic
                     if (shape[i] && shape[i][j] === 0) isStructure = false;
                }

                if (isStructure) {
                    const idx = (r + i) * this.cols + (c + j);
                    this.data[idx] = 1;
                    structureCells.push(idx);
                }
            }
        }

        this.structures.push({
            type: type,
            cells: structureCells,
            found: false,
            w: w,
            h: h,
            shape: shape
        });
    }

    // Calculate density for heatmap (Satellite Scan)
    getDensity(r, c, radius = 2) {
        let count = 0;
        let total = 0;
        
        for (let i = Math.max(0, r - radius); i <= Math.min(this.rows - 1, r + radius); i++) {
            for (let j = Math.max(0, c - radius); j <= Math.min(this.cols - 1, c + radius); j++) {
                total++;
                if (this.data[i * this.cols + j] === 1) count++;
            }
        }
        return count / total;
    }

    // Calculate proximity to nearest structure for LiDAR (checks 2x2 area)
    getProximity(r, c) {
        let minDistance = Infinity;
        
        // Check each cell in the 2x2 area
        for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 2; dc++) {
                const checkR = r + dr;
                const checkC = c + dc;
                
                if (checkR >= this.rows || checkC >= this.cols) continue;
                
                // Find distance to nearest structure cell
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        if (this.data[i * this.cols + j] === 1) {
                            const dist = Math.abs(i - checkR) + Math.abs(j - checkC);
                            if (dist < minDistance) {
                                minDistance = dist;
                            }
                        }
                    }
                }
            }
        }
        
        return minDistance;
    }

    drill(r, c) {
        const idx = r * this.cols + c;
        this.drilled[idx] = true;
        return this.data[idx] === 1;
    }

    excavate(r, c, w, h) {
        const cells = [];
        let hitStructure = null;

        for (let i = r; i < r + h; i++) {
            for (let j = c; j < c + w; j++) {
                const idx = i * this.cols + j;
                cells.push(idx);
            }
        }

        // Mark the area as excavated regardless (earth moved)
        cells.forEach(idx => this.excavated[idx] = true);

        // Check if this excavation completed any undiscovered structure
        let foundStructure = null;

        this.structures.forEach(str => {
            if (str.found) return;
            
            // Check if all cells of this structure are NOW excavated
            // (either from this action or previous ones)
            const allRevealed = str.cells.every(cellIdx => this.excavated[cellIdx]);
            
            if (allRevealed) {
                str.found = true;
                foundStructure = str;
            }
        });

        return foundStructure;
    }
    
    allStructuresFound() {
        return this.structures.every(s => s.found);
    }
}
