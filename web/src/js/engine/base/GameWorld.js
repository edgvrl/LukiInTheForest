import RAPIER from '@dimforge/rapier3d-compat';
import GameObject from "./GameObject.js";


export default class World {


    constructor(scene, assetManager, component) {
        this.gravity = new RAPIER.Vector3(0.0, -20, 0.0)

        this.scene = scene;
        this.physicsScene = new RAPIER.World(this.gravity)

        this.gameObjects = new Map();
        this._nextId = 1;

        this.assetManager = assetManager;

        this.cr = component;
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

        // 1. Remove from Three.js Scene
        if (object.objectScene) {
            this.scene.remove(object.objectScene);
        }

        // 2. Remove from Rapier Physics Scene
        if (object.rigidBody) {
            this.physicsScene.removeRigidBody(object.rigidBody);
        } else if (object.collider) {
            // If it's a static sensor or collider without a body
            this.physicsScene.removeCollider(object.collider);
        }

        // 3. Clean up internal state
        this.gameObjects.delete(object.id);

        object.onDestroy?.();
        object.parentWorld = null;
        object.id = null;
    }


    update(delta) {
        for (const obj of this.gameObjects.values()) {
            obj.update(delta);
        }

        this.physicsScene.timestep = Math.min(delta, 0.01)
        this.physicsScene.step()
    }
}
