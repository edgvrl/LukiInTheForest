import RAPIER from "@dimforge/rapier3d-compat";
import World from "../../GameWorld.js";
import BaseLevel from "./BaseLevel.js";

export default class LevelManager {
    constructor(components) {
        this.components = components;
        this.currentLevel = null;
    }

    async initLevelLoader(){
        await RAPIER.init()
        this.components.world = new World(this.components.scene, this.components.assetManager, this.components);
        this.components.world.add(this.components.debug);
        await this.components.assetManager.loadRegistry(this.components.assetPath)
    }

    load(level){
        if(this.currentLevel){
            this.dispose();
        }

        if(!(level.prototype instanceof BaseLevel)){
            throw Error("No LevelObject")
        }

        this.currentLevel = new level(this.components);
        this.currentLevel.load();
    }

    dispose() {
        if (this.currentLevel) {
            // Filter out the debug menu so it isn't removed,
            // OR let it be removed but ensure it is re-added correctly.
            this.components.world.gameObjects.forEach((object) => {
                if (object !== this.components.debug) {
                    this.components.world.remove(object);
                }
            });
        }
    }
}