import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class AmbientLightObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            color = 0xffffff,
            intensity = 0.1,
        } = args;

        this.light = new THREE.AmbientLight(color, intensity);
        this.objectScene = this.light;

    }

    update() {
        super.update();

        this.light.position.copy(this.position);
    }
}
