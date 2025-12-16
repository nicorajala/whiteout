import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import modelUrl from '../assets/mountain.glb?url';

export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        this.isLoaded = false;
        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        console.log("Loading terrain from:", modelUrl);

        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            console.log("Terrain GLB Loaded", model);

            // Custom Snow Material
            const snowMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false
            });

            // Traverse to setup materials/shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = snowMaterial; // Assign the new snow material
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Adjust Scale/Position
            model.scale.set(10, 10, 10);
            model.position.set(0, -1000, 200);

            this.mesh.add(model);
            this.isLoaded = true;

        }, (xhr) => {
            // Progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error happened loading the terrain:', error);
        });
    }

    // Helper methods
    getHeight(x, z) { return 0; }
    getNormal(x, z) { return new THREE.Vector3(0, 1, 0); }
}
