import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Import the asset - Vite will return the processed URL
import modelUrl from '../assets/mountain.glb?url';

export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group(); // Container for the model

        // Add container to scene immediately so it's there for update loops
        this.scene.add(this.mesh);

        this.init();
    }

    init() {
        const loader = new GLTFLoader();

        console.log("Loading terrain from:", modelUrl);

        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            console.log("Terrain GLB Loaded", model);

            // Traverse to setup materials/shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    // Ensure material handles light
                    if (child.material) {
                        // Check if it's already a standard material
                        if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                            // Tweak properties for snow look if needed
                            child.material.roughness = 0.9;
                        } else {
                            // Convert to Standard if it's something basic?
                            // Usually GLTFLoader uses Standard.
                        }
                    }
                }
            });

            // Adjust Scale/Position if necessary
            model.scale.set(10, 10, 10);
            model.position.set(0, -1000, 200);

            this.mesh.add(model);

        }, (xhr) => {
            // Progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error happened loading the terrain:', error);
        });
    }

    // Helper methods if we want to manually query height later (optional)
    getHeight(x, z) { return 0; }
    getNormal(x, z) { return new THREE.Vector3(0, 1, 0); }
}
