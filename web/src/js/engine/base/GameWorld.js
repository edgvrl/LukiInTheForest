import * as THREE from "three";
import GameObject from "./GameObject.js";

export default class World {

    constructor(scene) {
        this.scene = scene;
        this.gameObjects = new Map();
        this._nextId = 1;
    }

    #getNewID() {
        return this._nextId++;
    }

    add(object) {
        if (!(object instanceof GameObject)) return;
        if (object.parentWorld) {
            throw new Error("GameObject already belongs to a world");
        }

        const id = this.#getNewID();

        object.id = id;
        object.parentWorld = this;

        this.gameObjects.set(id, object);

        if (object.objectScene) {
            this.scene.add(object.objectScene);
        }

        object.onAdded?.();
    }

    remove(object) {
        if (object.parentWorld !== this) return;

        if (object.objectScene) {
            this.scene.remove(object.objectScene);
        }

        this.gameObjects.delete(object.id);

        object.onDestroy?.();
        object.parentWorld = null;
        object.id = null;
    }


    update() {
        for (const obj of this.gameObjects.values()) {
            obj.update();
        }
    }
}
