import * as THREE from 'three';

export class CameraController {
    constructor(camera, target, input) {
        this.camera = camera;
        this.target = target;
        this.input = input;

        // Spherical Coordinates
        this.radius = 15;
        this.theta = Math.PI; // Start behind player (looking at back)
        this.phi = Math.PI / 3;

        this.lookAtOffset = new THREE.Vector3(0, 2, 0);
        this.smoothness = 10.0;

        this.currentPos = new THREE.Vector3();
    }

    update(dt) {
        if (!this.target) return;

        // Handle Input
        const sensitivity = 0.002;
        if (this.input.isLocked) {
            this.theta -= this.input.mouseDelta.x * sensitivity;
            this.phi -= this.input.mouseDelta.y * sensitivity;

            // Clamp Vertical
            const minPhi = 0.1;
            const maxPhi = Math.PI / 2.2;
            this.phi = Math.max(minPhi, Math.min(maxPhi, this.phi));

            // Consume delta
            this.input.resetDelta();
        }

        // Calculate Ideal Position relative to Target
        // DECOUPLED: Theta is independent of player rotation.
        // Pure Orbital.
        // To follow the player, we add the offset to the player's position.

        const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        const y = this.radius * Math.cos(this.phi);
        const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

        // "Stuck to the player" = Target Position + Offset
        const offset = new THREE.Vector3(x, y, z);
        const desiredPos = this.target.position.clone().add(offset);
        desiredPos.add(this.lookAtOffset);

        // Smooth
        this.camera.position.lerp(desiredPos, dt * this.smoothness);

        // Look At
        const lookTarget = this.target.position.clone().add(this.lookAtOffset);
        this.camera.lookAt(lookTarget);
    }
}
