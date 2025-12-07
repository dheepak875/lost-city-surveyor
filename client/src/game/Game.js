import { Grid } from './Grid.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Economy } from './Economy.js';
import { audio } from './Audio.js';

const TOOL_NAMES = {
    scan: 'Multispectral Imaging',
    lidar: 'LiDAR Drone',
    drill: 'Ground Penetrating Radar',
    excavate: 'Archaeological Excavation',
    terraquest: 'TerraQuest Explorer'
};

export class Game {
    constructor(canvas, uiCallbacks) {
        this.canvas = canvas;
        this.uiCallbacks = uiCallbacks; // { updateFunds, logMessage, updateTool, onComplete }
        
        this.grid = new Grid(20, 20);
        this.renderer = new Renderer(canvas, this.grid);
        this.input = new Input(canvas, this);
        this.economy = new Economy(5000);
        
        this.tool = 'scan'; // scan, lidar, drill, excavate, terraquest
        this.activeScans = []; // {r, c, time} for multispectral
        this.activeLidars = []; // {r, c} for lidar drone
        this.hover = { r: -1, c: -1 };
        this.selection = null; // {r, c, w, h}
        this.terraquestUsed = false; // Can only use TerraQuest once
        
        this.pendingTouchAction = null; // For touch confirmation
        
        this.isRunning = true;
        this.lastTime = 0;

        // Bind economy
        this.economy.onFundsChanged = (funds) => {
            this.uiCallbacks.updateFunds(funds);
            // Game over check removed as per request
        };

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
        
        this.uiCallbacks.logMessage("System Online. Funds: $5000");
        this.uiCallbacks.logMessage("Select tool to begin survey.");
        this.uiCallbacks.updateTargets(this.grid.structures);
    }

    setTool(toolName) {
        // Check if TerraQuest is locked
        if (toolName === 'terraquest') {
            const foundCount = this.grid.structures.filter(s => s.found).length;
            if (foundCount < 3) {
                this.uiCallbacks.logMessage("TerraQuest LOCKED! Find 3 structures to unlock.", "alert");
                return;
            }
            if (this.terraquestUsed) {
                this.uiCallbacks.logMessage("TerraQuest already deployed this mission.", "alert");
                return;
            }
        }
        this.tool = toolName;
        this.uiCallbacks.updateTool(toolName);
        this.uiCallbacks.logMessage(`Equipped: ${TOOL_NAMES[toolName]}`);
    }
    
    getStructuresFoundCount() {
        return this.grid.structures.filter(s => s.found).length;
    }
    
    isTerraQuestUnlocked() {
        return this.getStructuresFoundCount() >= 3;
    }
    
    isTerraQuestUsed() {
        return this.terraquestUsed;
    }

    handleInputHover(coords) {
        const gridPos = this.renderer.toGridCoords(coords.x, coords.y);
        this.hover = gridPos;
    }

    handleInputStart(coords) {
        const gridPos = this.renderer.toGridCoords(coords.x, coords.y);
        if (!this.isValid(gridPos)) return;

        if (this.tool === 'excavate') {
            this.selection = { r: gridPos.r, c: gridPos.c, w: 1, h: 1 };
        }
    }

    handleInputDrag(start, current) {
        if (this.tool === 'excavate' && this.selection) {
            const startGrid = this.renderer.toGridCoords(start.x, start.y);
            const currGrid = this.renderer.toGridCoords(current.x, current.y);
            
            // Clamp to grid
            const r1 = Math.max(0, Math.min(startGrid.r, currGrid.r));
            const c1 = Math.max(0, Math.min(startGrid.c, currGrid.c));
            let r2 = Math.min(this.grid.rows - 1, Math.max(startGrid.r, currGrid.r));
            let c2 = Math.min(this.grid.cols - 1, Math.max(startGrid.c, currGrid.c));
            
            // Limit selection size (max 25 cells area, e.g. 5x5)
            // Actually, let's strict limit width/height to max 5 to prevent long strips too?
            // The prompt asked to prevent "excavate whole area".
            // Let's enforce max area of 25 tiles.
            
            const w = c2 - c1 + 1;
            const h = r2 - r1 + 1;
            const area = w * h;
            
            if (area > 25) {
                // Constrain end point
                // This is tricky with drag. Visual feedback is better.
                // We will just render it invalid red if too big?
                // Or Clamp. Let's Clamp.
                
                // Simple clamp: Max 5x5 dimension
                if (w > 5) c2 = c1 + 4;
                if (h > 5) r2 = r1 + 4;
            }

            this.selection = {
                r: r1,
                c: c1,
                w: c2 - c1 + 1,
                h: r2 - r1 + 1
            };
        }
    }

    handleInputEnd(start, end) {
        const gridPos = this.renderer.toGridCoords(end.x, end.y);
        if (!this.isValid(gridPos)) {
            this.selection = null;
            return;
        }

        if (this.tool === 'scan') {
            this.performScan(gridPos);
        } else if (this.tool === 'lidar') {
            this.performLidar(gridPos);
        } else if (this.tool === 'drill') {
            this.performDrill(gridPos);
        } else if (this.tool === 'excavate' && this.selection) {
            this.performExcavation(this.selection);
            this.selection = null;
        } else if (this.tool === 'terraquest') {
            this.performTerraQuest(gridPos);
        }
    }

    handleTouchStart(coords) {
        const gridPos = this.renderer.toGridCoords(coords.x, coords.y);
        if (!this.isValid(gridPos)) return;

        if (this.tool === 'excavate') {
            this.selection = { r: gridPos.r, c: gridPos.c, w: 1, h: 1 };
        }
        
        this.hover = gridPos;
    }

    handleTouchEnd(start, end, isLongPress) {
        const gridPos = this.renderer.toGridCoords(end.x, end.y);
        if (!this.isValid(gridPos)) {
            this.selection = null;
            this.pendingTouchAction = null;
            return;
        }

        if (this.tool === 'excavate' && this.selection) {
            if (isLongPress) {
                this.performExcavation(this.selection);
            } else {
                this.uiCallbacks.logMessage("Hold to confirm excavation", "alert");
            }
            this.selection = null;
            return;
        }
        
        const isSameCell = this.pendingTouchAction && 
            this.pendingTouchAction.r === gridPos.r && 
            this.pendingTouchAction.c === gridPos.c &&
            this.pendingTouchAction.tool === this.tool;
        
        if (isLongPress) {
            this.executeTouchAction(gridPos);
            this.pendingTouchAction = null;
        } else if (isSameCell) {
            this.executeTouchAction(gridPos);
            this.pendingTouchAction = null;
        } else {
            this.pendingTouchAction = { r: gridPos.r, c: gridPos.c, tool: this.tool };
            this.uiCallbacks.logMessage(`Tap again to use ${TOOL_NAMES[this.tool]} at [${gridPos.c}, ${gridPos.r}]`);
        }
    }
    
    executeTouchAction(gridPos) {
        if (this.tool === 'scan') {
            this.performScan(gridPos);
        } else if (this.tool === 'lidar') {
            this.performLidar(gridPos);
        } else if (this.tool === 'drill') {
            this.performDrill(gridPos);
        } else if (this.tool === 'terraquest') {
            this.performTerraQuest(gridPos);
        }
    }

    isValid(pos) {
        return pos.r >= 0 && pos.r < this.grid.rows && pos.c >= 0 && pos.c < this.grid.cols;
    }

    performScan(pos) {
        if (this.economy.spend('scan')) {
            audio.scan();
            this.activeScans.push({ r: pos.r, c: pos.c });
            this.uiCallbacks.logMessage(`Imaging complete at [${pos.c}, ${pos.r}]`);
        } else {
            audio.error();
            this.uiCallbacks.logMessage("Insufficient funds for imaging!", "alert");
        }
    }

    performLidar(pos) {
        if (this.economy.spend('lidar')) {
            audio.lidar();
            this.activeLidars.push({ r: pos.r, c: pos.c });
            const proximity = this.grid.getProximity(pos.r, pos.c);
            if (proximity <= 2) {
                this.uiCallbacks.logMessage(`LiDAR: STRONG signal at [${pos.c}, ${pos.r}]! Structure very close.`, "success");
            } else if (proximity <= 5) {
                this.uiCallbacks.logMessage(`LiDAR: Moderate signal at [${pos.c}, ${pos.r}]. Structure nearby.`);
            } else {
                this.uiCallbacks.logMessage(`LiDAR: Weak signal at [${pos.c}, ${pos.r}]. No structures detected nearby.`);
            }
        } else {
            audio.error();
            this.uiCallbacks.logMessage("Insufficient funds for LiDAR!", "alert");
        }
    }

    performDrill(pos) {
        if (this.economy.spend('drill')) {
            audio.drill();
            const hit = this.grid.drill(pos.r, pos.c);
            if (hit) {
                audio.drillHit();
                this.uiCallbacks.logMessage(`GPR ECHO at [${pos.c}, ${pos.r}]!`, "success");
            } else {
                this.uiCallbacks.logMessage(`No echo at [${pos.c}, ${pos.r}].`);
            }
        } else {
            audio.error();
            this.uiCallbacks.logMessage("Insufficient funds for GPR!", "alert");
        }
    }

    performExcavation(rect) {
        if (this.economy.spend('excavate')) {
            audio.excavate();
            const foundStructure = this.grid.excavate(rect.r, rect.c, rect.w, rect.h);
            if (foundStructure) {
                audio.discovery();
                this.economy.reward('structure');
                this.uiCallbacks.logMessage(`${foundStructure.type.toUpperCase()} EXCAVATED! +$2000`, "success");
                this.uiCallbacks.updateTargets(this.grid.structures);
                
                if (this.uiCallbacks.showDiscovery) {
                    this.uiCallbacks.showDiscovery(foundStructure.type, 2000);
                }
                
                if (this.grid.allStructuresFound()) {
                    setTimeout(() => this.winGame(), 2000);
                }
            } else {
                this.uiCallbacks.logMessage("Excavation yielded no complete structures.");
            }
        } else {
            audio.error();
            this.uiCallbacks.logMessage("Insufficient funds for Excavation!", "alert");
        }
    }

    performTerraQuest(pos) {
        // Check if already used
        if (this.terraquestUsed) {
            this.uiCallbacks.logMessage("TerraQuest already deployed this mission!", "alert");
            return;
        }
        
        // Check if unlocked (3 structures found)
        const foundCount = this.grid.structures.filter(s => s.found).length;
        if (foundCount < 3) {
            this.uiCallbacks.logMessage("TerraQuest LOCKED! Find 3 structures first.", "alert");
            return;
        }
        
        if (this.economy.spend('terraquest')) {
            audio.terraquest();
            this.terraquestUsed = true;
            this.uiCallbacks.logMessage("TERRAQUEST DEPLOYED! Scanning entire site...", "success");
            
            // Reveal all remaining unfound structures by marking their cells
            let revealedCount = 0;
            this.grid.structures.forEach(structure => {
                if (!structure.found) {
                    // Mark all cells of this structure as drilled (showing yellow hits)
                    structure.cells.forEach(cellIdx => {
                        this.grid.drilled[cellIdx] = true;
                    });
                    revealedCount++;
                }
            });
            
            if (revealedCount > 0) {
                this.uiCallbacks.logMessage(`TerraQuest revealed ${revealedCount} hidden structure(s)!`, "success");
                
                // Show dramatic discovery for TerraQuest
                if (this.uiCallbacks.showDiscovery) {
                    this.uiCallbacks.showDiscovery('TerraQuest Scan', 0);
                }
            } else {
                this.uiCallbacks.logMessage("TerraQuest: No hidden structures remaining.");
            }
            
            // Switch back to excavate tool
            this.tool = 'excavate';
            this.uiCallbacks.updateTool('excavate');
        } else {
            this.uiCallbacks.logMessage("Insufficient funds for TerraQuest!", "alert");
        }
    }

    gameOver() {
        this.isRunning = false;
        this.uiCallbacks.logMessage("MISSION FAILED. INSUFFICIENT FUNDS.", "alert");
        alert("GAME OVER. Funds depleted.");
    }

    winGame() {
        this.isRunning = false;
        audio.victory();
        this.uiCallbacks.logMessage("ALL STRUCTURES FOUND. MISSION SUCCESS!", "success");
        
        // Call completion callback with game stats
        if (this.uiCallbacks.onComplete) {
            this.uiCallbacks.onComplete({
                finalFunds: this.economy.funds,
                structuresFound: this.grid.structures.filter(s => s.found).length,
                actionsUsed: this.economy.actionsUsed
            });
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawHeatMap(this.activeScans);
        this.renderer.drawLidarMap(this.activeLidars);
        this.renderer.drawCells(); // Excavated and Drilled
        
        if (this.tool === 'excavate' && this.selection) {
            this.renderer.drawSelection(this.selection.r, this.selection.c, this.selection.w, this.selection.h);
        } else if (this.hover.r !== -1) {
            // Show tool preview
            if (this.tool === 'scan') {
                // Preview scan area (5x5 centered)
                 this.renderer.drawSelection(this.hover.r - 2, this.hover.c - 2, 5, 5, true);
            } else if (this.tool === 'lidar') {
                // Preview lidar area (2x2)
                this.renderer.drawSelection(this.hover.r, this.hover.c, 2, 2, true, 'orange');
            } else if (this.tool === 'drill') {
                this.renderer.drawHover(this.hover.r, this.hover.c);
            }
        }

        requestAnimationFrame(this.loop);
    }
    
    resize() {
        this.renderer.resize();
    }
}
