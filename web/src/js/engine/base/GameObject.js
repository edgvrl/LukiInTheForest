import * as THREE from "three";

export default class GameObject {

    constructor(args = {}) {
        this.parentWorld = null;
        this.id = null;

        this.physics = false;
        this.rigidbody = null;
        this.collider = null;
        this.colliderDesc = null;

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

    update(delta) {
        if(this.rigidbody){
            this.objectScene.position.copy(this.rigidbody.translation())
            this.objectScene.quaternion.copy(this.rigidbody.rotation())
        }
    }

    // In GameObject.js
    destroy() {
        if (!this.parentWorld) return;

        // 1. Remove Rapier Physics Body
        if (this.rigidbody && this.parentWorld.physicsWorld) {
            this.parentWorld.physicsWorld.removeRigidBody(this.rigidbody);

            // Nullify references to prevent memory leaks or accidental updates
            this.rigidbody = null;
            this.collider = null;
        }

        // 2. Remove the visual group from the Three.js scene
        if (this.objectScene.parent) {
            this.objectScene.parent.remove(this.objectScene);
        }

        // 3. Call the internal world removal logic (removes from your game loop array)
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
            this.rigidbody.setRotation({
                x: quat.x,
                y: quat.y,
                z: quat.z,
                w: quat.w
            }, true); // 'true' wakes up the body so it processes the change
        }
        else {
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

    getPosition() {
        // Just return the world position vector
        return this.objectScene.position.clone();
    }
}
