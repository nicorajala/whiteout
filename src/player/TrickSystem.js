import * as THREE from 'three';

export class TrickSystem {
    constructor() {
        this.reset();
    }

    reset() {
        this.accumulatedRotation = new THREE.Vector3(0, 0, 0); // Yaw, Pitch, Roll
        this.lastQuaternion = new THREE.Quaternion();
        this.active = false;
        this.trickName = "";
        this.trickPoints = 0;
    }

    startJump() {
        this.active = true;
        this.accumulatedRotation.set(0, 0, 0);
        this.trickPoints = 0;
        this.trickName = "";
        // Reset isn't fully correct, we need to capture 'start' orientation?
        // Actually, just tracking delta every frame is easier.
        // We assume lastQuaternion is fresh from the update loop.
    }

    update(dt, currentQuaternion) {
        if (!this.active) {
            this.lastQuaternion.copy(currentQuaternion);
            return;
        }

        // Calculate Delta Rotation
        // deltaQ = current * inverse(last)
        const deltaQ = currentQuaternion.clone().multiply(this.lastQuaternion.clone().invert());

        // Extract Euler from Delta (Order YXZ usually works forYaw/Pitch)
        const euler = new THREE.Euler().setFromQuaternion(deltaQ, 'YXZ');

        // Accumulate (absolute values? No, signed allows rewinding)
        // But for scoring "Spin", we usually want total magnitude.
        // Let's track absolute rotation for simple scoring.

        this.accumulatedRotation.x += Math.abs(euler.x); // Pitch (Flip)
        this.accumulatedRotation.y += Math.abs(euler.y); // Yaw (Spin)
        this.accumulatedRotation.z += Math.abs(euler.z); // Roll (Cork)

        this.lastQuaternion.copy(currentQuaternion);
    }

    land(currentQuaternion) {
        if (!this.active) return { name: "", points: 0 };
        this.active = false;

        let nameParts = [];
        let score = 0;

        // Analyze Rotation
        const flipDeg = THREE.MathUtils.radToDeg(this.accumulatedRotation.x);
        const spinDeg = THREE.MathUtils.radToDeg(this.accumulatedRotation.y);
        // Roll is implicit in Corks usually

        // FLIPS
        // 360 flip = 1 flip. 
        // Threshold: > 150 deg maybe?
        const flips = Math.round(flipDeg / 180); // 180 deg = 0.5 flip? No. 360 is full flip.
        // Backflip is 360 deg rotation.
        // Wait, standard trick naming:
        // Backflip = 360 pitch.
        const flipCount = Math.round(flipDeg / 360);

        if (flipCount > 0) {
            if (flipCount === 1) nameParts.push("Backflip");
            else if (flipCount === 2) nameParts.push("Double Backflip");
            else nameParts.push("Triple Backflip");
            score += flipCount * 500;
        }

        // SPINS
        // 180, 360, 540...
        // Snap to nearest 180
        let spin = Math.round(spinDeg / 180) * 180;
        if (spin > 0) {
            nameParts.push(spin.toString());
            score += spin;
        }

        // CORKS / OFF-AXIS
        const rollDeg = THREE.MathUtils.radToDeg(this.accumulatedRotation.z);
        if (rollDeg > 90 && spin > 0 && flipCount > 0) {
            nameParts = [`Cork ${spin}`];
            score *= 1.5;
        } else if (rollDeg > 360) {
            nameParts.push("Barrel Roll");
            score += 500;
        }

        if (score === 0) return { name: "", points: 0 };

        return {
            name: nameParts.join(" + "),
            points: Math.floor(score)
        };
    }
}
