import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrickSystem } from './TrickSystem.js';
import snowmanUrl from '../assets/snowman.glb?url';

export class PlayerController {
    constructor(scene, input, terrain) {
        this.scene = scene;
        this.input = input;
        this.terrain = terrain;
        this.trickSystem = new TrickSystem();

        this.mesh = null;
        this.body = null;
        this.board = null;

        this.position = new THREE.Vector3(0, 10, 40);
        this.velocity = new THREE.Vector3();
        this.speed = 0;

        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        this.grounded = false;

        // Constants
        this.gravity = 30.0;
        this.friction = 0.2;
        this.turnSpeed = 3.0;
        this.maxSpeed = 60.0;
        this.jumpForce = 35.0;
        this.jumpCharge = 0;
        this.maxJumpCharge = 1.0;

        this.heading = 0;

        this.score = 0;
        this.lastTruncName = "";

        this.init();
    }

    init() {
        // Player Container (Pivot)
        this.mesh = new THREE.Group();
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Load Snowman
        const loader = new GLTFLoader();
        loader.load(snowmanUrl, (gltf) => {
            const model = gltf.scene;
            this.body = model;

            // Setup Visuals
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Positioning
            // Snowboard is at y=0.05, height ~0.1.
            model.position.y = 0.1;

            // Scale
            model.scale.set(0.5, 0.5, 0.5);

            // Orientation
            model.rotation.y = Math.PI;

            this.mesh.add(model);
            console.log("Snowman Loaded");

        }, undefined, (err) => {
            console.error("Failed to load snowman:", err);
            // Fallback
            const bodyGeo = new THREE.BoxGeometry(0.5, 1.8, 0.5);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
            this.body = new THREE.Mesh(bodyGeo, bodyMat);
            this.body.position.y = 0.9;
            this.mesh.add(this.body);
        });

        // Snowboard (Keep it)
        const boardGeo = new THREE.BoxGeometry(0.4, 0.1, 1.6);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.board = new THREE.Mesh(boardGeo, boardMat);
        this.board.position.y = 0.05;
        this.board.castShadow = true;
        this.board.receiveShadow = true;
        this.mesh.add(this.board);
    }

    update(dt) {
        this.handleInput(dt);
        this.handlePhysics(dt);

        // Apply position
        this.mesh.position.copy(this.position);

        // Visual Rotation
        this.mesh.rotation.y = this.heading;

        // Bank (Tilt) 
        if (this.grounded) {
            const lean = (this.input.actions.left ? 1 : 0) - (this.input.actions.right ? 1 : 0);
            const targetLean = lean * 0.5;
            this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetLean, dt * 5);
        } else {
            this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt * 2);
        }
    }

    handleInput(dt) {
        let rotationDelta = 0;

        // Turning
        let turn = 0;
        if (this.input.actions.left) { turn += 1; }
        if (this.input.actions.right) { turn -= 1; }

        if (!this.grounded) {
            if (this.input.actions.spinLeft) turn += 1.5;
            else if (this.input.actions.spinRight) turn -= 1.5;
        }

        rotationDelta = turn * this.turnSpeed * dt;
        this.heading += rotationDelta;

        if (!this.grounded) {
            this.trickSystem.update(dt, rotationDelta);
        }

        // Jumping
        if (this.grounded) {
            if (this.input.actions.jump) {
                this.jumpCharge = Math.min(this.jumpCharge + dt * 0.5, this.maxJumpCharge);
                if (this.body) this.body.scale.y = 1.0 - (this.jumpCharge * 0.4); // Scale for squish if loaded
            } else {
                if (this.jumpCharge > 0) {
                    this.grounded = false;
                    const finalForce = this.jumpForce * (0.3 + this.jumpCharge * 0.7);
                    this.velocity.y += finalForce;
                    this.jumpCharge = 0;
                    if (this.body) this.body.scale.y = 1.0;
                    this.trickSystem.startJump();
                }
                if (this.body) this.body.scale.y = 1.0;
            }
        } else {
            this.jumpCharge = 0;
            if (this.body) this.body.scale.y = 1.0;
        }
    }

    handlePhysics(dt) {
        // Multi-point Raycast
        const offsets = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.3, 0, -0.7),
            new THREE.Vector3(0.3, 0, -0.7),
            new THREE.Vector3(-0.3, 0, 0.7),
            new THREE.Vector3(0.3, 0, 0.7)
        ];

        const rotationMatrix = new THREE.Matrix4().makeRotationY(this.heading);

        let avgHeight = 0;
        let validHits = 0;
        let avgNormal = new THREE.Vector3(0, 0, 0);

        for (const offset of offsets) {
            const worldOffset = offset.clone().applyMatrix4(rotationMatrix);
            const rayOrigin = this.position.clone().add(worldOffset);
            rayOrigin.y += 3.0;

            this.raycaster.set(rayOrigin, this.downVector);
            const intersects = this.raycaster.intersectObject(this.terrain.mesh, true);

            if (intersects.length > 0) {
                if (validHits === 0) avgHeight = intersects[0].point.y;
                else avgHeight += intersects[0].point.y;

                const obj = intersects[0].object;
                const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
                const worldNormal = intersects[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();

                avgNormal.add(worldNormal);
                validHits++;
            }
        }

        if (validHits > 1) avgHeight /= validHits;

        let groundHeight = -1000;
        let groundNormal = new THREE.Vector3(0, 1, 0);

        if (validHits > 0) {
            groundHeight = avgHeight;
            groundNormal = avgNormal.divideScalar(validHits).normalize();
        }

        const snapDistance = 0.5;
        const distToGround = this.position.y - groundHeight;

        // Check ground
        if (distToGround <= snapDistance + 0.5 && this.velocity.y <= 0.1) {
            if (!this.grounded) {
                const trick = this.trickSystem.land();
                if (trick.points > 0) {
                    this.score += trick.points;
                    this.lastTruncName = trick.name;
                    console.log("Trick:", trick.name);
                }
            }

            this.grounded = true;
            this.position.y = groundHeight;

            // Physics
            const gravityVec = new THREE.Vector3(0, -1, 0);
            const gravityComponent = gravityVec.clone().sub(groundNormal.clone().multiplyScalar(gravityVec.dot(groundNormal)));
            this.velocity.add(gravityComponent.multiplyScalar(this.gravity * dt));

            let currentFriction = this.friction;
            if (this.input.actions.backward) currentFriction = 5.0;
            this.velocity.multiplyScalar(1 - currentFriction * dt);

            const speed = this.velocity.length();
            if (speed > 0.1) {
                const desiredDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
                const slopeDir = desiredDir.clone().sub(groundNormal.clone().multiplyScalar(desiredDir.dot(groundNormal))).normalize();
                const grip = 8.0 * dt;
                this.velocity.copy(this.velocity.clone().normalize().lerp(slopeDir, grip).multiplyScalar(speed));
            }

            if (this.velocity.length() > this.maxSpeed) this.velocity.setLength(this.maxSpeed);

            const vn = this.velocity.dot(groundNormal);
            if (vn < 0) this.velocity.sub(groundNormal.clone().multiplyScalar(vn));

        } else {
            // AIR PHYSICS
            this.grounded = false;
            this.velocity.y -= this.gravity * dt;

            // AIR CONTROL
            const airControlSpeed = 10.0;

            if (this.input.actions.left || this.input.actions.right) {
                const desiredDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
                const currentSpeed = this.velocity.length();
                if (currentSpeed > 1.0) {
                    const steerFactor = 0.8 * dt;
                    const newVel = this.velocity.clone().lerp(desiredDir.multiplyScalar(currentSpeed), steerFactor);
                    newVel.y = this.velocity.y;
                    this.velocity.copy(newVel);
                }
            }

            if (this.input.actions.forward) {
                const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
                fwd.y = 0;
                this.velocity.add(fwd.multiplyScalar(airControlSpeed * dt));
            }
        }

        this.position.add(this.velocity.clone().multiplyScalar(dt));
    }
}
