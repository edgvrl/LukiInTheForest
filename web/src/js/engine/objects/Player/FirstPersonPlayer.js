import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import PhysicalMeshObject from "../physics/PhysicalMeshObject.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import RAPIER from "@dimforge/rapier3d-compat";

export default class FirstPersonPlayer extends GameObject {
    constructor(args = {}) {
        super(args);

        // Movement Settings
        this.settings = {
            walkSpeed: 15,
            acceleration: 10,
            jumpForce: 12,
            lookSensitivity: 0.15,
            playerHeight: 1.0 // Half-height of collider
        };

        // State
        this.yaw = 0;
        this.pitch = 0;
        this.input = { forward: 0, right: 0, jump: false };
        this.isGrounded = false;

        this.playerObject = new PhysicalMeshObject({
            asset: "",
            position: new THREE.Vector3(0, 10, 0),
            fixed: false,
            mass: 70,
            restitution: 0,
            friction: 0,
            overrideCollider: RAPIER.ColliderDesc.ball(this.settings.playerHeight)
        });

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 0);
        this.controls = new PointerLockControls(this.camera, document.body);
    }

    onAdded() {
        super.onAdded();
        const world = this.parentWorld;
        world.add(this.playerObject);

        if (this.playerObject.objectScene) {
            this.playerObject.objectScene.add(this.camera);
        }

        // Constraints
        this.playerObject.rigidbody.lockRotations(true, true, true);

        this._setupEventListeners();
    }

    _setupEventListeners() {
        const canvas = document.getElementById('app') || document.body;
        canvas.addEventListener("click", () => this.controls.lock());

        document.addEventListener("mousemove", (e) => {
            if (this.controls.isLocked) {
                this.yaw -= e.movementX * this.settings.lookSensitivity;
                this.pitch -= e.movementY/window.innerHeight ;

            }
        });

        document.addEventListener("keydown", (e) => this._handleKeys(e.code, true));
        document.addEventListener("keyup", (e) => this._handleKeys(e.code, false));
    }

    _handleKeys(code, isPressed) {
        switch (code) {
            case "KeyW": this.input.forward = isPressed ? 1 : 0; break;
            case "KeyS": this.input.forward = isPressed ? -1 : 0; break;
            case "KeyA": this.input.right = isPressed ? -1 : 0; break;
            case "KeyD": this.input.right = isPressed ? 1 : 0; break;
            case "Space": if (isPressed) this.input.jump = true; break;
        }
    }

    _checkGrounded() {
        const rb = this.playerObject.rigidbody;
        const ray = new RAPIER.Ray(rb.translation(), { x: 0, y: -1, z: 0 });

        // Ray length slightly longer than the ball radius
        const hit = this.parentWorld.physicsScene.castRay(
            ray,
            this.settings.playerHeight + 0.1,
            true
        );

        this.isGrounded = hit !== null;
    }

    update(delta) {
        super.update(delta);
        const rb = this.playerObject.rigidbody;
        if (!rb) return;

        this._checkGrounded();

        // 1. Calculate Direction
        const moveVector = new THREE.Vector3(this.input.right, 0, -this.input.forward);
        moveVector.normalize();
        moveVector.applyEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(this.yaw), 0));

        // 2. Velocity Math
        const currentVel = rb.linvel();
        const targetVelX = moveVector.x * this.settings.walkSpeed;
        const targetVelZ = moveVector.z * this.settings.walkSpeed;

        const lerpFactor = this.settings.acceleration * delta * 10;
        const newVelX = THREE.MathUtils.lerp(currentVel.x, targetVelX, lerpFactor);
        const newVelZ = THREE.MathUtils.lerp(currentVel.z, targetVelZ, lerpFactor);

        let newVelY = currentVel.y;

        // 3. Jump Logic
        if (this.input.jump && this.isGrounded) {
            newVelY = this.settings.jumpForce;
            this.input.jump = false; // Reset jump intent
        } else {
            this.input.jump = false; // Prevent buffered jumps
        }

        // Apply velocities
        rb.setLinvel({ x: newVelX, y: newVelY, z: newVelZ }, true);

        // 4. Sync Visuals
        this.playerObject.setRotation(0, this.yaw, 0);
        this.camera.rotation.set(this.pitch, 0, 0);
    }
}