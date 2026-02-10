import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class DirectionalLightObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            color = 0xffffff,
            intensity = 1,
            castShadow = true,
        } = args;

        this.light = new THREE.DirectionalLight(color, intensity);
        this.light.castShadow =castShadow;
        this.objectScene.add(this.light);

    }

    update() {
        super.update();

        this.light.position.copy(this.position);
    }
}
