import LevelManager from "../../engine/base/systems/levels/LevelManager.js";
import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import PointLightObject from "../../engine/objects/light/PointLightObject.js";
import SkyBoxObject from "../../engine/objects/light/SkyBoxObject.js";
import BaseLevel from "../../engine/base/systems/levels/BaseLevel.js";
import OrbitPlayerController from "../../engine/objects/Player/Orbit.js";
import TreeSpawner from "../prefabs/TreeSpawner.js";

export default class Level_01 extends BaseLevel {

    constructor(args) {
        super(args);
    }

    load() {
        super.load();

        const { world, renderer } = this.components;

        world.add(new SkyBoxObject({ renderer }));
        //world.add(new PointLightObject({ position: new THREE.Vector3(2, 2, 2) }));

        // Landscape
        world.add(new PhysicalMeshObject({
            asset: "landscape",
            fixed: true,
            scale: new THREE.Vector3(400, 400, 400),
            position: new THREE.Vector3(0, 0, 0),
        }));


        let playerInstance = new OrbitPlayerController({position: new THREE.Vector3(0, 0, 0)});
        world.add(playerInstance);

        // Kamera vom Player benutzen
        this.components.camera = playerInstance.camera;

        // Entities

        world.add(new PhysicalMeshObject({
            fixed: true,
            asset: "house",
            position: new THREE.Vector3(0, -0.5, 0),
            scale: new THREE.Vector3(12, 12, 12),
        }));


        world.add(new TreeSpawner())

    }
}