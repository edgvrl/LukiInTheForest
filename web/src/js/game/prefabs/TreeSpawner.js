import GameObject from "../../engine/base/GameObject.js";
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export default class TreeSpawner extends GameObject {
    constructor(args = {}) {
        super(args);
        // Configurable options
        this.treeCount = args.treeCount || 200;
        this.debug = args.debug || false;
        this.spawnArea = args.spawnArea || 350;

        // yOffset (buffer) per asset type
        // Positive moves up, negative moves down
        this.assetOffsets = {
            "tree1": -0.2,
            "tree2": -0.2,
            "bush": 0.1,
            "default": 0
        };
    }

    onAdded() {
        super.onAdded();

        const landscape = [...this.parentWorld.gameObjects.values()]
            .find(obj => obj.asset === "landscape");

        if (!landscape) {
            console.error("TreeSpawner: Landscape not found.");
            return;
        }

        // Wait for landscape meshes to initialize
        setTimeout(() => this.spawn(landscape), 100);
    }

    spawn(landscape) {
        const target = landscape.objectScene;
        target.updateMatrixWorld(true);

        const raycaster = new THREE.Raycaster();
        const downVector = new THREE.Vector3(0, -1, 0);
        const treeAssets = ["tree1", "tree2", "bush"];

        for (let i = 0; i < this.treeCount; i++) {
            const x = (Math.random() - 0.5) * this.spawnArea;
            const z = (Math.random() - 0.5) * this.spawnArea;
            const origin = new THREE.Vector3(x, 200, z);

            raycaster.set(origin, downVector);
            const intersects = raycaster.intersectObject(target, true);

            if (intersects.length > 0) {
                const hitPoint = intersects[0].point;
                const asset = treeAssets[Math.floor(Math.random() * treeAssets.length)];

                // Apply the specific buffer for this asset
                const offset = this.assetOffsets[asset] ?? this.assetOffsets["default"];
                const spawnPos = hitPoint.clone();
                spawnPos.y += offset;

                this.parentWorld.add(new PhysicalMeshObject({
                    fixed: true,
                    asset,
                    position: spawnPos,
                    overrideCollider: RAPIER.ColliderDesc.cuboid(0.5, 2, 0.5)
                }));

                if (this.debug) {
                    const arrow = new THREE.ArrowHelper(downVector, origin, origin.y - hitPoint.y, 0x00ff00);
                    this.parentWorld.scene.add(arrow);
                }
            }
        }
    }
}