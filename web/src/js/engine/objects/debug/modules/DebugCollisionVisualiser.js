import GameObject from "../../../base/GameObject.js";
import * as THREE from "three";

export default class DebugCollisionVisualiser extends GameObject {

    constructor(args = {}) {
        super(args);

        this.collisionDisplay = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }));
        this.objectScene.add(this.collisionDisplay);
        this.objectScene.frustumCulled = false;
        this.visualisers = [];
    }

    onAdded() {
        super.onAdded();


    }

    update() {
        super.update();

        // 1. Only run this once per frame, not in a loop of gameObjects
        const { vertices, colors } = this.parentWorld.physicsScene.debugRender();

        // 2. Check if we actually have data to render
        if (vertices.length > 0) {
            // 3. Optimization: Update existing attributes instead of creating new ones if possible
            // But for a quick fix, just moving it out of the loop solves the "freaking out"
            this.collisionDisplay.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            this.collisionDisplay.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

            this.collisionDisplay.visible = true;
        } else {
            this.collisionDisplay.visible = false;
        }
    }

    destroy() {
        super.destroy();
    }
}
