// engine/base/AssetManager.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default class AssetManager {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.registry = new Map();
    }

    getModel(asset) {
        if (this.registry.has(asset)) {
            return this.registry.get(asset).clone();
        }
        else{
            console.error("Unable to load model");
            return this.registry.get("error").clone();
        }
    }

    async loadRegistry(jsonPath) {
        const response = await fetch(jsonPath);
        const config = await response.json();

        const loadPromises = [];

        for (const [key, path] of Object.entries(config.models)) {
            loadPromises.push(this._loadModel(key, path));
        }

        await Promise.all(loadPromises);
    }

    async _loadModel(key, path) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(path, (gltf) => {
                gltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        this.registry.set(key, node);
                        resolve();
                    }
                });
            }, undefined, reject);
        });
    }
}