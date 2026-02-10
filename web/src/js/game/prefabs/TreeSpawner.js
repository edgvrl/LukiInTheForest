import Spawner from "../../engine/objects/spawner/Spawner.js";
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

export default class TreeSpawner {
    constructor() {
        return new Spawner({
            count: 500,
            spawnArea: 495,
            objects: [
                new PhysicalMeshObject({
                    asset: "tree1",
                    fixed: true,
                    position: new THREE.Vector3(0, 4, 0), // Your offset
                    overrideCollider: RAPIER.ColliderDesc.cuboid(1, 10, 1)
                }),
                new PhysicalMeshObject({
                    asset: "tree2",
                    fixed: true,
                    position: new THREE.Vector3(0, 1, 0), // Your offset
                    overrideCollider: RAPIER.ColliderDesc.cuboid(1, 10, 1)
                })
            ]
        });
    }
}