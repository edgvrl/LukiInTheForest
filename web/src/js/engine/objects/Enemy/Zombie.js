import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import PhysicalMeshObject from "../physics/PhysicalMeshObject.js";
import RAPIER from "@dimforge/rapier3d-compat";
import FirstPersonPlayer from "../Player/FirstPersonPlayer.js";

export default class Zombie extends GameObject {
    constructor(args = {}) {
        super(args);

        const initialPosition = args.position || new THREE.Vector3(0, 0, 0);

        this.settings = {
            walkSpeed: 8,
            attackCooldown: 0.5,    // Time frozen + cooldown
            attackDamage: 10,
            attackRange: 1,       // Very close range
            colliderRadius: 1.0
        };

        this.Hp = 100;
        this.attackTimer = 0;

        this.playerObject = new PhysicalMeshObject({
            asset: "zombie_walk",
            position: initialPosition,
            fixed: false,
            mass: 70,
            restitution: 0,
            friction: 0,
            overrideCollider: RAPIER.ColliderDesc.ball(this.settings.colliderRadius)
        });

        this.playerObject.objectScene.userData.zombie = this;
    }

    onAdded() {
        super.onAdded();
        this.parentWorld.add(this.playerObject);

        if (this.playerObject.rigidbody) {
            this.playerObject.rigidbody.lockRotations(true, false, true);
        }

        this.parentWorld.gameObjects.forEach(o => {
            if (o instanceof FirstPersonPlayer) this.target = o;
        });
    }



    updateKHUD() {
        const kelem = document.getElementById("kills");

        if (kelem) kelem.textContent = parseInt(kelem.textContent) + 1;
    }

    takeDamage(damage) {
        this.Hp -= damage;
        if (this.Hp <= 0) {
            if (this.playerObject) this.playerObject.destroy();
            this.updateKHUD();
            this.destroy();
        }
    }

    update(delta) {
        super.update(delta);

        const rb = this.playerObject.rigidbody;
        if (!rb || !this.target) return;

        // 1. Handle Freezing / Cooldown
        if (this.attackTimer > 0) {
            this.attackTimer -= delta;

            // FREEZE: Zero out velocity while the timer is active
            rb.setLinvel({ x: 0, y: rb.linvel().y, z: 0 }, true);
            return; // Skip rotation and chasing logic while frozen
        }

        // Stop if player is dead
        if (this.target.Hp <= 0) {
            rb.setLinvel({ x: 0, y: rb.linvel().y, z: 0 }, true);
            return;
        }

        const zombiePos = rb.translation();
        const targetPos = this.target.playerObject.rigidbody.translation();

        const dx = targetPos.x - zombiePos.x;
        const dz = targetPos.z - zombiePos.z;
        const centerDist = Math.sqrt(dx * dx + dz * dz);

        // Actual distance minus collider widths (assuming player is 0.5)
        const actualDist = centerDist - (this.settings.colliderRadius + 0.5);

        // 2. Rotation (Only happens when NOT frozen)
        const lookAngle = Math.atan2(dx, dz) + Math.PI / 2;
        rb.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), lookAngle), true);

        // 3. Attack Logic
        if (actualDist <= this.settings.attackRange) {
            // Hit and Trigger Freeze
            console.log(`HIT! Dist: ${actualDist.toFixed(2)}. Freezing for ${this.settings.attackCooldown}s`);

            this.target.takeDamage(this.settings.attackDamage);
            this.attackTimer = this.settings.attackCooldown;

            rb.setLinvel({ x: 0, y: rb.linvel().y, z: 0 }, true);
        }
        // 4. Movement Logic
        else if (centerDist < 50) {
            const dirX = dx / centerDist;
            const dirZ = dz / centerDist;
            rb.setLinvel({
                x: dirX * this.settings.walkSpeed,
                y: rb.linvel().y,
                z: dirZ * this.settings.walkSpeed
            }, true);
        } else {
            rb.setLinvel({ x: 0, y: rb.linvel().y, z: 0 }, true);
        }
    }
}