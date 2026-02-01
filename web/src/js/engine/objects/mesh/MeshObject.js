import GameObject from "../../base/GameObject.js";

export default class MeshObject extends GameObject {

    // In MeshObject.js constructor
    constructor(args = {}) {
        super(args);

        const {
            asset = "skybox",
            mesh = null,
            receiveShadows = true,
            castShadows = true,
        } = args;

        this.asset = asset;
        this.mesh = mesh;

        this.objectScene.castShadow = castShadows;
        this.objectScene.receiveShadow = receiveShadows;
    }

    onAdded() {
        if (!this.mesh) {
            let asset = this.parentWorld.assetManager.getModel(this.asset);
            this.meshes = [];

            asset.traverse((node) => {
                if (node.isMesh) {
                    // Ensure shadows are applied to all sub-meshes
                    node.castShadow = this.objectScene.castShadow;
                    node.receiveShadow = this.objectScene.receiveShadow;
                    this.meshes.push(node);
                }
            });

            this.mesh = this.meshes[0];

            // Reset ONLY the root asset container transforms
            asset.position.set(0, 0, 0);
            asset.rotation.set(0, 0, 0);
            asset.scale.set(1, 1, 1);

            this.objectScene.add(asset);
        }

        // Apply the GameObject transforms to the main container
        this.objectScene.position.copy(this.position);
        this.objectScene.rotation.copy(this.rotation);
        this.objectScene.scale.copy(this.scale);
    }

    update() {
        super.update();
    }
}
