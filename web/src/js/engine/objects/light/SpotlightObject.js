import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class SpotLightObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            color = 0xffffff,
            intensity = 10,
            distance = 0,
            decay = 2,
            angle = Math.PI/3,
            penumbra = 0,
            castShadow = true,
        } = args;

        this.light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        this.light.castShadow =castShadow;
        this.objectScene.add(this.light);

        this.objectScene.position.copy(this.position);

        this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
    }

    lookAt(x, y, z) {
        if (x instanceof THREE.Vector3) {
            this.light.target.position.copy(x);
        } else {
            this.light.target.position.set(x, y, z);
        }
        this.light.target.updateMatrixWorld();
    }

    // rotation in degrees
    setRotation(x = 0, y = 0, z = 0) {
        // store rotation in GameObject Euler
        this.rotation.set(
            THREE.MathUtils.degToRad(x),
            THREE.MathUtils.degToRad(y),
            THREE.MathUtils.degToRad(z)
        );

        // compute spherical target
        const radius = 1; // 1 unit away from light
        const phi = this.rotation.x;   // vertical
        const theta = this.rotation.y; // horizontal

        const offset = new THREE.Vector3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(phi),
            radius * Math.cos(theta) * Math.cos(phi)
        );

        this.lookAt(this.objectScene.position.clone().add(offset));
    }

    update() {
        super.update();

        this.setRotation(0,this.getRotation().y+1,0) // TODO: REMOVE AFTER TEST
    }
}
