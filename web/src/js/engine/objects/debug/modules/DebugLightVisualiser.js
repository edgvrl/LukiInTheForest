import GameObject from "../../../base/GameObject.js";
import PointLightObject from "../../light/PointLightObject.js";
import SpotLightObject from "../../light/SpotlightObject.js";
import * as THREE from "three";

export default class DebugLightVisualiser extends GameObject {

    constructor(args = {}) {
        super(args);

        this.objectScene = new THREE.Group();
        this.visualisers = [];
    }

    onAdded() {
        super.onAdded();

        for (const gameObject of this.parentWorld.gameObjects.values()) {

            if (gameObject instanceof PointLightObject) {
                const helper = new THREE.PointLightHelper(gameObject.light);
                this.visualisers.push(helper);
                this.objectScene.add(helper);
            }

            else if (gameObject instanceof SpotLightObject) {
                const helper = new THREE.SpotLightHelper(gameObject.light);
                this.visualisers.push(helper);
                this.objectScene.add(helper);
            }
        }
    }

    update() {
        super.update();

        // Keep helpers in sync
        this.visualisers.forEach(v => v.update?.());
    }

    destroy() {
        this.visualisers.forEach(v => v.dispose?.());
        this.visualisers.length = 0;

        super.destroy();
    }
}
