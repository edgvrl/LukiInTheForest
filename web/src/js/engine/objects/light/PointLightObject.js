import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class PointLightObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            color = 0xffffff,
            intensity = 10,
            distance = 0,
            decay = 2,
            castShadow = true,
        } = args;

        this.light = new THREE.PointLight(color, intensity, distance, decay);
        this.light.castShadow =castShadow;
        this.objectScene = this.light;

    }

    update() {
        super.update();

        this.light.position.copy(this.position);
    }
}
