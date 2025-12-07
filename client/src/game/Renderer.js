// Add effects array to state
constructor(canvas, grid) {
    // ... (existing params)
    this.effects = []; // {x, y, radius, maxRadius, alpha, color}
    // ... (rest of constructor)
}

// Add updateEffects method call to draw loop in Game loop

drawShockwave(x, y, color = 'rgba(0, 255, 255, 0.8)') {
    this.effects.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: this.cellSize * 10,
        alpha: 1,
        color: color
    });
}

drawEffects() {
    // Update and draw effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
        const effect = this.effects[i];

        // Update
        effect.radius += 10;
        effect.alpha -= 0.02;

        if (effect.alpha <= 0) {
            this.effects.splice(i, 1);
            continue;
        }

        // Draw
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = effect.color.replace('0.8)', `${effect.alpha})`).replace('rgb', 'rgba'); // Hacky check if needed, but color passed is rgba usually
        // Just assume color is valid or override alpha
        // If color is 'rgba(...)', we can replace last alpha?
        // Simpler: use globalAlpha
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = effect.color;
        this.ctx.stroke();
        this.ctx.restore();
    }
}

// Call this from game loop
render(activeScans, activeLidars, selection, hover, tool) {
    this.clear();
    this.drawGrid();
    this.drawHeatMap(activeScans);
    this.drawLidarMap(activeLidars);
    this.drawCells();
    this.drawEffects(); // New fx layer

    // ... (selection and hover logic)
}
// Methods were outside class. Fixing now.

resize() {
    // Handle device pixel ratio for Retina screens
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale context to match dpr
    this.ctx.scale(dpr, dpr);

    // Calculate cell size to fit grid
    const availWidth = rect.width - (this.padding * 2);
    const availHeight = rect.height - (this.padding * 2);

    this.cellSize = Math.min(availWidth / this.grid.cols, availHeight / this.grid.rows);

    // Center grid
    this.offsetX = (rect.width - (this.cellSize * this.grid.cols)) / 2;
    this.offsetY = (rect.height - (this.cellSize * this.grid.rows)) / 2;
}

clear() {
    // Use standard clear or fill with bg
    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio); // Adjust for scale
}

drawGrid() {
    this.ctx.strokeStyle = this.colors.gridDim;
    this.ctx.lineWidth = 1;

    for (let r = 0; r <= this.grid.rows; r++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.offsetX, this.offsetY + r * this.cellSize);
        this.ctx.lineTo(this.offsetX + this.grid.cols * this.cellSize, this.offsetY + r * this.cellSize);
        this.ctx.stroke();
    }

    for (let c = 0; c <= this.grid.cols; c++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.offsetX + c * this.cellSize, this.offsetY);
        this.ctx.lineTo(this.offsetX + c * this.cellSize, this.offsetY + this.grid.rows * this.cellSize);
        this.ctx.stroke();
    }
}

drawCells() {
    for (let r = 0; r < this.grid.rows; r++) {
        for (let c = 0; c < this.grid.cols; c++) {
            const idx = r * this.grid.cols + c;
            const x = this.offsetX + c * this.cellSize;
            const y = this.offsetY + r * this.cellSize;

            // Excavated (Found structures or empty dirt)
            if (this.grid.excavated[idx]) {
                if (this.grid.data[idx] === 1) {
                    // Structure part found!
                    this.ctx.fillStyle = this.colors.structure;
                    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

                    // Inner detail
                    this.ctx.fillStyle = '#003300';
                    this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
                } else {
                    // Just dirt
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                }
            }
            // Drilled (Hit or Miss)
            else if (this.grid.drilled[idx]) {
                if (this.grid.data[idx] === 1) {
                    this.ctx.fillStyle = this.colors.drillHit;
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 4, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = this.colors.drillMiss;
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
        }
    }
}

drawHeatMap(activeScans) {
    // activeScans is array of {r, c, size}
    activeScans.forEach(scan => {
        const density = this.grid.getDensity(scan.r, scan.c, 2); // 5x5 area (radius 2)

        let color = this.colors.scanHeat.empty;
        if (density > 0) color = this.colors.scanHeat.low;
        if (density > 0.25) color = this.colors.scanHeat.med; // > 6.25 blocks (approx > 1.5 walls/huts)
        if (density > 0.5) color = this.colors.scanHeat.high; // > 12.5 blocks (Monument)

        const size = 5 * this.cellSize;
        const x = this.offsetX + (scan.c - 2) * this.cellSize;
        const y = this.offsetY + (scan.r - 2) * this.cellSize;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);

        // Border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);
    });
}

drawLidarMap(activeLidars) {
    activeLidars.forEach(scan => {
        const proximity = this.grid.getProximity(scan.r, scan.c);

        let color = this.colors.lidarHeat.far;
        if (proximity <= 6) color = this.colors.lidarHeat.moderate;
        if (proximity <= 3) color = this.colors.lidarHeat.close;
        if (proximity <= 1) color = this.colors.lidarHeat.veryClose;

        const size = 2 * this.cellSize;
        const x = this.offsetX + scan.c * this.cellSize;
        const y = this.offsetY + scan.r * this.cellSize;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);
    });
}

drawSelection(r, c, w, h, valid = true, color = null) {
    const x = this.offsetX + c * this.cellSize;
    const y = this.offsetY + r * this.cellSize;

    if (color) {
        this.ctx.fillStyle = `rgba(255, 165, 0, 0.2)`;
        this.ctx.strokeStyle = color;
    } else {
        this.ctx.fillStyle = valid ? this.colors.selection : 'rgba(255, 0, 0, 0.2)';
        this.ctx.strokeStyle = valid ? '#fff' : '#f00';
    }

    this.ctx.fillRect(x, y, w * this.cellSize, h * this.cellSize);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w * this.cellSize, h * this.cellSize);
}

drawHover(r, c) {
    if (r < 0 || r >= this.grid.rows || c < 0 || c >= this.grid.cols) return;

    const x = this.offsetX + c * this.cellSize;
    const y = this.offsetY + r * this.cellSize;

    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
}

// Convert screen coords to grid coords
toGridCoords(x, y) {
    // Adjust for DPR in input handling if necessary (but Input.js handles CSS scaling)
    // Input.js returns CSS pixels relative to canvas top-left.
    // Renderer.resize sets internal scale, but visual size matches CSS.
    // So we compare against CSS-based offset/size.

    // But wait, input.js returns (clientX - rect.left) * scaleX.
    // scaleX is canvas.width / rect.width = dpr.
    // So input.js returns INTERNAL canvas coordinates (multiplied by DPR).

    // Our offsets and cellSize are calculated in resize() using scaled context?
    // No, resize() sets `this.ctx.scale(dpr, dpr)`.
    // Meaning logic coordinates (offsetX, cellSize) should be in CSS PIXELS.
    // But `canvas.width` is physical pixels.

    // Let's correct:
    // If ctx.scale(dpr, dpr) is used, then drawing commands use CSS pixel units.
    // offsetX/cellSize should be in CSS pixels.

    // Input.js:
    // scaleX = canvas.width / rect.width = dpr.
    // returns x * dpr.

    // So if input returns 200 (on a 2x screen where css width is 100),
    // and our logic expects 100... we need to divide by DPR.

    const dpr = window.devicePixelRatio || 1;
    const cssX = x / dpr;
    const cssY = y / dpr;

    const c = Math.floor((cssX - this.offsetX) / this.cellSize);
    const r = Math.floor((cssY - this.offsetY) / this.cellSize);

    return { r, c };
}
}
}
