export class Economy {
    constructor(initialFunds = 5000) {
        this.funds = initialFunds;
        this.actionsUsed = 0;
        this.costs = {
            scan: 50,
            lidar: 100,
            drill: 250,
            excavate: 500,
            terraquest: 60
        };
        this.rewards = {
            structure: 2000
        };
        this.onFundsChanged = null; // Callback
    }

    canAfford(action) {
        // Allow funds to go negative
        return true;
    }

    spend(action) {
        // Always allow spending
        this.funds -= this.costs[action];
        this.actionsUsed++;
        if (this.onFundsChanged) this.onFundsChanged(this.funds);
        return true;
    }

    reward(type) {
        if (this.rewards[type]) {
            this.funds += this.rewards[type];
            if (this.onFundsChanged) this.onFundsChanged(this.funds);
        }
    }

    checkGameOver() {
        return false; // No game over from funds
    }
}
