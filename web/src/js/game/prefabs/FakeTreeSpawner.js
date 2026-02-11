import Spawner from "../../engine/objects/spawner/Spawner.js";
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import MeshObject from "../../engine/objects/mesh/MeshObject.js";

export default class FakeTreeSpawner {
    constructor() {
        return new Spawner({
            count: 500,
            spawnArea: 495,
            objects: [
                new MeshObject({
                    asset: "tree1",
                    position: new THREE.Vector3(0, 4, 0), // Your offset
                }),
                new MeshObject({
                    asset: "tree2",
                    position: new THREE.Vector3(0, 1, 0), // Your offset
                })
            ]
        });
    }
}