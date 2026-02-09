import LevelManager from "../../engine/base/systems/levels/LevelManager.js";
import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import PhysicalMeshObject from "../../engine/objects/physics/PhysicalMeshObject.js";
import PointLightObject from "../../engine/objects/light/PointLightObject.js";
import SkyBoxObject from "../../engine/objects/light/SkyBoxObject.js";
import BaseLevel from "../../engine/base/systems/levels/BaseLevel.js";

export default class Level_01 extends BaseLevel {

    constructor(args) {
        super(args);
    }

    load() {
        super.load();
        
        const { world, renderer } = this.components;

        // Environment
        world.add(new SkyBoxObject({ renderer, asset:"erergdfgdfg" }));

    }
}