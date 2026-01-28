import LevelManager from "../../engine/base/systems/levels/LevelManager.js";
import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import PointLightObject from "../../engine/objects/light/PointLightObject.js";
import SkyBoxObject from "../../engine/objects/light/SkyBoxObject.js";
import BaseLevel from "../../engine/base/systems/levels/BaseLevel.js";
import Player from "../../engine/objects/Player/Player.js";

export default class Level_00 extends BaseLevel {

    constructor(args) {
        super(args);
    }

    load() {
        super.load();
        
        const { world, renderer } = this.components;

        // Environment
        world.add(new SkyBoxObject({ renderer }));
        world.add(new PointLightObject({ position: new THREE.Vector3(2, 2, 2) }));

        // Landscape
        world.add(new PhysicalMeshObject({
            asset: "landscape",
            fixed: true,
            scale: new THREE.Vector3(400, 400, 400),
            position: new THREE.Vector3(0, 0, 0),
        }));

        world.add(new PhysicalMeshObject({
            asset: "gvfbhdmk",
            position: new THREE.Vector3(0, 65, 0),
        }));

        let playerInstance = new Player({});
        world.add(playerInstance);

        // Kamera vom Player benutzen
        this.components.camera = playerInstance.camera;


        // Entities
        this.spawnTree(0);

    }

    spawnTree(y) {
        this.components.world.add(new PhysicalMeshObject({
            fixed: true,
            asset: "tree2",
            receiveShadows: true,
            position: new THREE.Vector3(0, 2 * y + 0.5 * y, 0),
            overrideCollider: RAPIER.ColliderDesc.cuboid(1, 10, 1).setMass(100)
        }));
    }
}