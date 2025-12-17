import * as THREE from 'three';

export class TrailSystem {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.maxSegments = 200;
        this.spawnTimer = 0;
        this.spawnInterval = 0.02; // Frequent updates for smooth trail

        // Reusable geometry and material
        this.geometry = new THREE.PlaneGeometry(0.6, 0.8);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x88adc6, // Light blueish grey for compressed snow/shadow
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        // Initialize pool
        for (let i = 0; i < this.maxSegments; i++) {
            const mesh = new THREE.Mesh(this.geometry, this.material.clone());
            mesh.rotation.x = -Math.PI / 2;
            mesh.visible = false;
            mesh.userData = { life: 0 };
            this.scene.add(mesh);
            this.segments.push(mesh);
        }

        this.currentIdx = 0;
    }

    update(dt, player) {
        // Handle spawning
        if (player.grounded && (Math.abs(player.velocity.x) > 1 || Math.abs(player.velocity.z) > 1)) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.spawnSegment(player);
            }
        }

        // Handle fading
        for (const segment of this.segments) {
            if (segment.visible) {
                segment.userData.life -= dt * 0.5; // Fade over 2 seconds
                segment.material.opacity = Math.max(0, segment.userData.life * 0.6); // Scale opacity

                if (segment.userData.life <= 0) {
                    segment.visible = false;
                    segment.position.y = -1000; // Hide away
                }
            }
        }
    }

    spawnSegment(player) {
        const segment = this.segments[this.currentIdx];

        // Position at feet
        segment.position.copy(player.position);
        segment.position.y -= 0.4; // Slightly above terrain (assuming player pivot is center/bottom)
        // Adjust for terrain z-fighting - Terrain is at 0? Player y is on surface?
        // Player pivot seems to be center of body? check PlayerController
        // PlayerController: 
        //   rayOrigin.y += 5.0; ... 
        //   this.position.y = groundHeight; (So position is AT ground level)
        //   mesh is added to scene. 
        //   So we should put trail slightly above position.y

        segment.position.y += 0.05; // Lift slightly to sit on top of snow

        // Rotate to match player's facing direction (yaw only)
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(player.quaternion);
        segment.rotation.set(-Math.PI / 2, euler.y, 0); // Flat on ground, rotated Y

        segment.visible = true;
        segment.userData.life = 1.0;
        segment.material.opacity = 0.6;

        this.currentIdx = (this.currentIdx + 1) % this.maxSegments;
    }
}
