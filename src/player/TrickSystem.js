export class TrickSystem {
    constructor() {
        this.inAir = false;
        this.totalRotation = 0;
        this.currentTrick = null;
    }

    startJump() {
        this.inAir = true;
        this.totalRotation = 0;
        this.currentTrick = null;
    }

    update(dt, rotationDelta) {
        if (!this.inAir) return;
        this.totalRotation += Math.abs(rotationDelta); // Sum absolute rotation
    }

    land() {
        this.inAir = false;
        const degrees = (this.totalRotation * 180 / Math.PI);

        let score = 0;
        let trickName = "";

        // Thresholds with some leniency
        if (degrees > 160) {
            if (degrees < 220) { trickName = "180"; score = 100; }
            else if (degrees < 400) { trickName = "360"; score = 300; }
            else if (degrees < 580) { trickName = "540"; score = 500; }
            else if (degrees < 760) { trickName = "720"; score = 800; }
            else { trickName = "Huge Spin"; score = 1000; }
        }

        return { name: trickName, points: score };
    }
}
