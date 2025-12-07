import { Game } from './Game.js';

export function initGame(user, onGameComplete) {
    const canvas = document.getElementById('game-canvas');
    const fundsEl = document.getElementById('funds-display');
    const logEl = document.getElementById('message-log');
    
    if (!canvas) return;

    // UI Callbacks
    const uiCallbacks = {
        updateFunds: (amount) => {
            if (fundsEl) fundsEl.innerText = `$${amount.toLocaleString()}`;
        },
        logMessage: (msg, type = 'normal') => {
            if (logEl) {
                const div = document.createElement('div');
                div.className = `message ${type}`;
                div.innerText = `> ${msg}`;
                logEl.appendChild(div);
                logEl.scrollTop = logEl.scrollHeight;
            }
        },
        updateTool: (toolName) => {
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tool === toolName) btn.classList.add('active');
            });
        },
        updateTargets: (structures) => {
            const list = document.getElementById('target-list');
            if (!list) return;
            list.innerHTML = ''; // clear
            
            structures.forEach(s => {
                const item = document.createElement('div');
                item.className = `target-item ${s.found ? 'found' : ''}`;
                
                // Create visual representation (Mini Grid)
                const icon = document.createElement('div');
                icon.className = 'target-icon-grid';
                icon.style.display = 'grid';
                icon.style.gridTemplateColumns = `repeat(${s.w}, 4px)`;
                icon.style.gridTemplateRows = `repeat(${s.h}, 4px)`;
                icon.style.gap = '1px';
                
                // Render shape
                for (let i = 0; i < s.h; i++) {
                    for (let j = 0; j < s.w; j++) {
                        const cell = document.createElement('div');
                        let filled = true;
                        if (s.shape && s.shape[i] && s.shape[i][j] === 0) filled = false;
                        
                        cell.style.backgroundColor = filled ? 'currentColor' : 'transparent';
                        cell.style.width = '4px';
                        cell.style.height = '4px';
                        if (filled) cell.style.borderRadius = '1px';
                        icon.appendChild(cell);
                    }
                }
                
                const label = document.createElement('span');
                label.innerText = s.type.toUpperCase();
                
                item.appendChild(icon);
                item.appendChild(label);
                
                if (s.found) {
                    const check = document.createElement('span');
                    check.innerText = '✓';
                    check.className = 'check';
                    item.appendChild(check);
                }
                
                list.appendChild(item);
            });
        },
        onComplete: (gameData) => {
            if (onGameComplete) {
                onGameComplete(gameData);
            }
        },
        showDiscovery: (structureType, reward) => {
            // Create dramatic discovery popup
            const existing = document.getElementById('discovery-popup');
            if (existing) existing.remove();
            
            const popup = document.createElement('div');
            popup.id = 'discovery-popup';
            popup.className = 'discovery-popup';
            popup.innerHTML = `
                <div class="discovery-content">
                    <div class="discovery-flash"></div>
                    <div class="discovery-icon">🏛️</div>
                    <div class="discovery-title">DISCOVERY!</div>
                    <div class="discovery-structure">${structureType.toUpperCase()}</div>
                    <div class="discovery-reward">+$${reward.toLocaleString()}</div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Remove after animation
            setTimeout(() => {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 500);
            }, 1500);
        }
    };

    const game = new Game(canvas, uiCallbacks);

    // Bind UI buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.currentTarget.dataset.tool; // use currentTarget to get button, not icon/span
            game.setTool(tool);
        });
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        game.resize();
    });
    
    // Trigger initial resize
    game.resize();
    
    return game;
}
