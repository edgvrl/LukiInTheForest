import * as THREE from "three";

export default class GameObject {

    constructor(args = {}) {
        this.parentWorld = null;
        this.id = null;

        this.physics = false;
        this.rigidbody = null;

        const {
            position = new THREE.Vector3(),
            rotation = new THREE.Vector3(),
            scale = new THREE.Vector3(1, 1, 1)
        } = args;

        this.position = position.clone();
        this.rotation = new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            'XYZ'
        );
        this.scale = scale.clone();


        this.objectScene = new THREE.Group();
    }

    onAdded(){}

    update() {
    }

    destroy() {
        if (!this.parentWorld) return;
        this.parentWorld.remove(this);
    }

    // --- Position ---
    setPosition(x, y, z) {
        if (x instanceof THREE.Vector3) {
            this.position.copy(x);
        } else {
            this.position.set(x, y, z);
        }

        if (this.objectScene) {
            this.objectScene.position.copy(this.position);
        }
    }

    // --- Scale ---
    setScale(x, y, z) {
        if (x instanceof THREE.Vector3) {
            this.scale.copy(x);
        } else {
            this.scale.set(x, y, z);
        }

        if (this.objectScene) {
            this.objectScene.scale.copy(this.scale);
        }
    }

    // --- Rotation in degrees ---
    setRotation(x, y, z) {
        if (x instanceof THREE.Vector3) {
            this.rotation.set(
                THREE.MathUtils.degToRad(x.x),
                THREE.MathUtils.degToRad(x.y),
                THREE.MathUtils.degToRad(x.z)
            );
        } else {
            this.rotation.set(
                THREE.MathUtils.degToRad(x),
                THREE.MathUtils.degToRad(y),
                THREE.MathUtils.degToRad(z)
            );
        }

        if (this.rigidbody) {
            const quat = new THREE.Quaternion().setFromEuler(this.rotation);
            this.rigidbody.setRotation(
                { x: quat.x, y: quat.y, z: quat.z, w: quat.w },
                true
            );
        } else if (this.objectScene) {
            this.objectScene.rotation.copy(this.rotation);
        }
    }


    // --- Rotation getters in degrees ---
    getRotation() {
        return new THREE.Vector3(
            THREE.MathUtils.radToDeg(this.rotation.x),
            THREE.MathUtils.radToDeg(this.rotation.y),
            THREE.MathUtils.radToDeg(this.rotation.z)
        );
    }
}
