import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {HDRLoader} from "three/addons";


export default class AssetManager {
    constructor() {
        this.registry = new Map();

        this.gltfLoader = new GLTFLoader();
        this.hdrloader = new HDRLoader();
        this.textureLoader = new THREE.TextureLoader();
    }

    getModel(asset) {
        if (this.registry.has(asset)) {
            return this.registry.get(asset).clone();
        }
        else{
            console.error("Unable to load model");
            return this.registry.get("m_error").clone();
        }
    }

    getTexture(asset) {
        if (this.registry.has(asset)) {
            return this.registry.get(asset).clone();
        }
        else{
            return this.registry.get("t_error").clone();
        }
    }

    async loadRegistry(jsonPath) {
        const response = await fetch(jsonPath);
        const config = await response.json();

        const loadPromises = [];

        for (const [key, path] of Object.entries(config.models)) {
            loadPromises.push(this._loadModel(key, path));
        }
        for (const [key, path] of Object.entries(config.textures)) {
            loadPromises.push(this._loadTexture(key, path));
        }

        await Promise.all(loadPromises);
    }

    async _loadModel(key, path) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(path, (gltf) => {
                this.registry.set(key, gltf.scene);
                resolve();
            }, undefined, reject);
        });
    }

    async _loadTexture(key, path) {
        if(path.indexOf(".hdr") !== -1){
            let hdr = await this.hdrloader.loadAsync(path);
            this.registry.set(key, hdr);
        }
        else{
            let tex = await this.textureLoader.loadAsync(path);
            this.registry.set(key, tex);
        }
    }
}