import SkyBoxObject from "../objects/light/SkyBoxObject.js";
import PointLightObject from "../objects/light/PointLightObject.js";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import World from "./GameWorld.js";

export default class LevelLoader {
    constructor(components) {
        this.components = components;
    }

    async initLevelLoader(){
        await RAPIER.init()
        this.components.world = new World(this.components.scene, this.components.assetManager);
        this.components.world.add(this.components.debug);
        await this.components.assetManager.loadRegistry(this.components.assetPath)
    }

    load(){
        throw Error("Override Load Function With objects");
    }
}