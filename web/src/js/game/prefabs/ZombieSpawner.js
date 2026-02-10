import Spawner from "../../engine/objects/spawner/Spawner.js";
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import Zombie from "../../engine/objects/Enemy/Zombie.js";

export default class ZombieSpawner {
    constructor() {
        return new Spawner({
            count: 200,
            exclusionZone: 70,
            objects: [
                new Zombie({
                    position: new THREE.Vector3(0, 10, 0), // Your offset
                })
            ]
        });
    }
}