export class Input {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.isDown = false;
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.isTouchDevice = 'ontouchstart' in window;

        this.pendingAction = null;
        this.confirmTimeout = null;
        this.touchStartTime = 0;
        this.LONG_PRESS_DURATION = 300;

        this.onDown = this.onDown.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onUp = this.onUp.bind(this);

        canvas.addEventListener('mousedown', this.onDown);
        canvas.addEventListener('mousemove', this.onMove);
        window.addEventListener('mouseup', this.onUp);

        canvas.addEventListener('touchstart', this.onDown, { passive: false });
        canvas.addEventListener('touchmove', this.onMove, { passive: false });
        window.addEventListener('touchend', this.onUp);
    }

    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Return CSS pixels relative to canvas top-left
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    onDown(e) {
        if (e.type === 'touchstart') {
            e.preventDefault();
            this.touchStartTime = Date.now();
        }

        this.isDown = true;
        const coords = this.getCoords(e);
        this.startPos = coords;
        this.currentPos = coords;

        if (this.isTouchDevice && e.type === 'touchstart') {
            this.game.handleTouchStart(coords);
        } else {
            this.game.handleInputStart(coords);
        }
    }

    onMove(e) {
        if (e.type === 'touchmove') e.preventDefault();

        const coords = this.getCoords(e);
        this.currentPos = coords;

        if (this.isDown) {
            this.game.handleInputDrag(this.startPos, this.currentPos);
        } else {
            this.game.handleInputHover(coords);
        }
    }

    onUp(e) {
        if (this.isDown) {
            this.isDown = false;
            const coords = this.getCoords(e);

            if (this.isTouchDevice && (e.type === 'touchend' || e.type === 'touchcancel')) {
                const holdDuration = Date.now() - this.touchStartTime;
                const isLongPress = holdDuration >= this.LONG_PRESS_DURATION;
                this.game.handleTouchEnd(this.startPos, coords, isLongPress);
            } else {
                this.game.handleInputEnd(this.startPos, this.currentPos);
            }
        }
    }

    destroy() {
        this.canvas.removeEventListener('mousedown', this.onDown);
        this.canvas.removeEventListener('mousemove', this.onMove);
        window.removeEventListener('mouseup', this.onUp);
        this.canvas.removeEventListener('touchstart', this.onDown);
        this.canvas.removeEventListener('touchmove', this.onMove);
        window.removeEventListener('touchend', this.onUp);
    }
}
