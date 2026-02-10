import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import PhysicalMeshObject from "../physics/PhysicalMeshObject.js";
import RAPIER from "@dimforge/rapier3d-compat";

export default class Zombie extends GameObject {
    constructor(args = {}) {
        super(args);

        this.settings = {
            walkSpeed: 10,
            acceleration: 5,
            jumpForce: 12,
            lookSensitivity: 0.15,
            playerHeight: 1.0
        };

        this.Hp = 100;
        this.debugDone = false;

        this.playerObject = new PhysicalMeshObject({
            asset: "zombie_walk",
            position: new THREE.Vector3(0, 10, 0),
            fixed: false,
            mass: 70,
            restitution: 0,
            friction: 0,
            overrideCollider: RAPIER.ColliderDesc.ball(this.settings.playerHeight)
        });

        this.playerObject.objectScene.userData.zombie = this;
    }

    onAdded() {
        super.onAdded();
        const world = this.parentWorld;
        world.add(this.playerObject);

        this.playerObject.rigidbody.lockRotations(true, true, true);
    }
    takeDamage(damage) {
        this.Hp -= damage;
        console.log("Zombie HP:", this.Hp);

        if (this.Hp <= 0) {
            console.log("Zombie dead");
            this.parentWorld.remove(this.playerObject);
        }
    }

    update(delta) {
        super.update(delta);
        if(this.Mesh)
        {
            let mixer = new THREE.AnimationMixer();

            let animations = this.mesh.animations;
            let action = mixer.clipAction( animations[0] , model);
            action.play();
            const world = this.parentWorld;
        }

        const rb = this.playerObject.rigidbody;
        if (!rb) return;
        
        if (!this.debugDone && this.playerObject.objectScene) {
            const obj = this.playerObject.objectScene;

            console.log("===== ZOMBIE DEBUG =====");
            console.log("ObjectScene:", obj);
            console.log("Type:", obj.type);
            console.log("Children:", obj.children);
            console.log("Animations on objectScene:", obj.animations);

            obj.traverse(child => {
                console.log("Child:", child.name, "| type:", child.type);
            });

            console.log("========================");

            this.debugDone = true;
        }
    }
}
