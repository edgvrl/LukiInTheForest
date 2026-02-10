import GameObject from "../../base/GameObject.js";
import * as THREE from "three";

export default class MeshObject extends GameObject {
    constructor(args = {}) {
        super(args);

        const {
            asset = "skybox",
            mesh = null,
            receiveShadows = true,
            castShadows = true,
        } = args;

        this.asset = asset; // Store name to fetch from manager
        this.mesh = mesh;
        this.mixer = null;
        this.animations = [];

        this.objectScene.castShadow = castShadows;
        this.objectScene.receiveShadow = receiveShadows;
    }

    onAdded() {
        if (!this.mesh) {
            // 1. Get the model from manager
            const rawAsset = this.parentWorld.assetManager.getModel(this.asset);

            if (!rawAsset) {
                console.error(`Asset "${this.asset}" not found!`);
                return;
            }

            // 2. Handle Animations: GLTF animations are on the root, not sub-meshes
            // If your manager clones models, we ensure the animations array comes along
            this.animations = rawAsset.animations || [];

            this.meshes = [];
            rawAsset.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = this.objectScene.castShadow;
                    node.receiveShadow = this.objectScene.receiveShadow;
                    this.meshes.push(node);
                }
            });

            this.mesh = this.meshes[0];

            // 3. Setup Mixer on the root asset
            if (this.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(rawAsset);
                // Play the first animation by default (e.g., "walk")
                const action = this.mixer.clipAction(this.animations[0]);
                action.play();
            }

            // Reset transforms before adding to our GameObject container
            rawAsset.position.set(0, 0, 0);
            rawAsset.rotation.set(0, 0, 0);
            rawAsset.scale.set(1, 1, 1);

            this.objectScene.add(rawAsset);
        }

        this.objectScene.position.copy(this.position);
        this.objectScene.rotation.copy(this.rotation);
        this.objectScene.scale.copy(this.scale);
    }

    update(delta) {
        super.update(delta);

        // 4. Progress the animation time
        if (this.mixer && delta) {
            this.mixer.update(delta);
        }
    }
}