import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import PhysicalMeshObject from "../physics/PhysicalMeshObject.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import RAPIER from "@dimforge/rapier3d-compat";
import AK47 from "../weppon/Guns/AK47.js";
import Shotgun from "../weppon/Guns/Shotgun.js";
import Level_01 from "../../../game/levels/Level_01.js";

export default class FirstPersonPlayer extends GameObject {
    constructor(args = {}) {
        super(args);

        // Movement Settings
        this.settings = {
            walkSpeed: 15,
            acceleration: 10,
            jumpForce: 9,
            lookSensitivity: 0.15,
            playerHeight: 1, // Half-height of collider
            playerWidth: 0.5, // Half-height of collider
            jumpCooldown: 1000 // 1 second delay in milliseconds
        };

        // State tracking
        this.reloadRequested = false;
        this.jumpRequested = false;
        this.lastJumpTime = 0;
        this.isSprinting = false;

        this.yaw = 0;
        this.pitch = 0;
        this.input = { forward: 0, right: 0 };

        this.playerObject = new PhysicalMeshObject({
            asset: "stick",
            position: new THREE.Vector3(0, 0.75, 0),
            fixed: false,
            mass: 70,
            restitution: 0,
            friction: 0,
            overrideCollider: RAPIER.ColliderDesc.capsule(this.settings.playerHeight, this.settings.playerWidth)
        });

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.3, 0);
        this.controls = new PointerLockControls(this.camera, document.body);

        this.Hp = 100;
    }

    onAdded() {
        super.onAdded();
        const world = this.parentWorld;
        world.add(this.playerObject);

        if (this.playerObject.objectScene) {
            this.playerObject.objectScene.add(this.camera);
        }

        // Constraints: Keep the player from tipping over
        this.playerObject.rigidbody.lockRotations(true, true, true);

        this._setupEventListeners();

        this.weapons = [
            new AK47(),
            new Shotgun()
        ];

        this.weapons.forEach(w => {
            w.parentWorld = this.parentWorld;
        })

        this.weapons.forEach(w => {
            w.parentWorld = this.parentWorld;
        });

        this.currentWeaponIndex = 0;
        this.weapon = this.weapons[this.currentWeaponIndex];
        this.weapon.equip(this.camera);

        this.updateHPHUD()
    }

    destroy() {

    }

    takeDamage(damage) {
        if (this.Hp <= 0) return;

        this.Hp -= damage;
        this.updateHPHUD();

        if (this.Hp <= 0) {
            console.log("DEAD");

            //this.parentWorld.cr.levelManager.load(Level_01)
            window.location.reload();
        }
    }

    updateHPHUD() {
        const hpElem = document.getElementById("health");

        if (hpElem) hpElem.textContent = this.Hp;
    }

    _setupEventListeners() {
        const canvas = document.getElementById('app') || document.body;

        // Ensure we clear any old state
        this.controls.unlock();

        canvas.addEventListener("click", () => {
            // This must be a direct result of a click to avoid security errors
            this.controls.lock();
        });

        document.addEventListener("mousemove", (e) => {
            if (this.controls.isLocked) {
                this.yaw -= e.movementX * this.settings.lookSensitivity;
                this.pitch -= e.movementY / window.innerHeight;
                const maxPitch = Math.PI / 2 - 0.05;
                this.pitch = THREE.MathUtils.clamp(this.pitch, -maxPitch, maxPitch);
            }
        });

        document.addEventListener("keydown", (e) => {
            this._handleKeys(e.code, true);

            // Weapon switching
            if (e.code === "Digit1") this._switchWeapon(0);
            if (e.code === "Digit2") this._switchWeapon(1);
        });

        document.addEventListener("keyup", (e) => this._handleKeys(e.code, false));

        document.addEventListener("mousedown", (e) => {
            if (e.button === 0) this.isShooting = true;
        });

        document.addEventListener("mouseup", (e) => {
            if (e.button === 0) this.isShooting = false;
        });
    }

    _switchWeapon(index) {
        if (index === this.currentWeaponIndex || !this.weapons[index]) return;
        if (this.weapon) this.weapon.unequip();

        this.currentWeaponIndex = index;
        this.weapon = this.weapons[index];
        this.weapon.equip(this.camera);
    }

    _handleKeys(code, isPressed) {
        switch (code) {
            case "KeyW": this.input.forward = isPressed ? 1 : 0; break;
            case "KeyS": this.input.forward = isPressed ? -1 : 0; break;
            case "KeyA": this.input.right = isPressed ? -1 : 0; break;
            case "KeyD": this.input.right = isPressed ? 1 : 0; break;
            case "Space":
                if (isPressed) {
                    const now = performance.now();
                    // Jump only if cooldown has passed
                    if (now - this.lastJumpTime > this.settings.jumpCooldown) {
                        this.jumpRequested = true;
                    }
                }
                break;
            case "KeyR":
                if (isPressed) this.reloadRequested = true;
                break;
            case "ShiftLeft":
                this.isSprinting = isPressed;
                break;
        }
    }

    update(delta) {
        super.update(delta);
        const rb = this.playerObject.rigidbody;
        if (!rb) return;

        // 1. Determine Target Speed
        const currentMaxSpeed = this.isSprinting ? 25 : 15;

        // 2. Calculate World-Space Direction
        const moveVector = new THREE.Vector3(this.input.right, 0, -this.input.forward);
        if (moveVector.lengthSq() > 0) moveVector.normalize();

        // Rotate move vector based on yaw
        moveVector.applyEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(this.yaw), 0));

        const targetVelX = moveVector.x * currentMaxSpeed;
        const targetVelZ = moveVector.z * currentMaxSpeed;

        // 3. Framerate Independent Acceleration (Exponential Decay)
        const currentVel = rb.linvel();
        const accelRate = this.settings.acceleration;
        const expTerm = 1 - Math.exp(-accelRate * delta);

        const newVelX = THREE.MathUtils.lerp(currentVel.x, targetVelX, expTerm);
        const newVelZ = THREE.MathUtils.lerp(currentVel.z, targetVelZ, expTerm);

        let newVelY = currentVel.y;

        // 4. Jump Logic (Time-based cooldown)
        if (this.jumpRequested) {
            newVelY = this.settings.jumpForce;
            this.lastJumpTime = performance.now();
            this.jumpRequested = false;
        }

        // Apply finalized velocity
        rb.setLinvel({ x: newVelX, y: newVelY, z: newVelZ }, true);

        // 5. Weapon and Visual Sync
        const time = performance.now() / 1000;
        if (this.weapon) {
            if (this.isShooting) this.weapon.tryFire(time);
            if (this.reloadRequested) {
                this.weapon.reload();
                this.reloadRequested = false;
            }
        }

        this.playerObject.setRotation(0, this.yaw, 0);
        this.camera.rotation.set(this.pitch, 0, 0);
    }
}