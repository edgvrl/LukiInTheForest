import GameObject from "../../../base/GameObject.js";
import PointLightObject from "../../light/PointLightObject.js";
import SpotLightObject from "../../light/SpotlightObject.js";
import * as THREE from "three";

export default class DebugCollisionVisualiser extends GameObject {

    constructor(args = {}) {
        super(args);

        this.objectScene = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }))
        this.objectScene.frustumCulled = false
        this.visualisers = [];
    }

    onAdded() {
        super.onAdded();


    }

    update() {
        super.update();
        for (const gameObject of this.parentWorld.gameObjects.values()) {

            if (gameObject.rigidbody) {
                const { vertices, colors } = this.parentWorld.physicsScene.debugRender()
                this.objectScene.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
                this.objectScene.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
            }
        }
    }

    destroy() {
        super.destroy();
    }
}
