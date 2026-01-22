import * as THREE from "three";
import GameObject from "../Base/GameObject.js";

export default class PointLightObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            color = 0xffffff,
            intensity = 10,
            distance = 0,
            decay = 2
        } = args;

        this.light = new THREE.PointLight(color, intensity, distance, decay);
        this.objectScene = this.light;

        this.light.position.copy(this.position);
    }

    update() {
        super.update();

        this.light.position.copy(this.position);
    }
}
