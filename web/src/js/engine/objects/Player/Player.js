import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import { Vector3 } from "three";
import PhysicalMeshObject from "../physics/PhysicalMeshObject.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import RAPIER from "@dimforge/rapier3d-compat";

export default class Player extends GameObject {

    constructor(args = {}) {
        super(args);

        // Geschwindigkeit / Richtung
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 100;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Rigidbody Player
        this.playerObject = new PhysicalMeshObject({
            asset: "",
            position: new Vector3(0, 10, 0),
            fixed: false,
            mass: 40,
            restitution: 0,
            overrideCollider: RAPIER.ColliderDesc.ball(2)
        });

        // Kamera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 0); // Augenhöhe

        // PointerLockControls
        this.controls = new PointerLockControls(this.camera, document.body);
    }

    onAdded() {
        super.onAdded();

        // Player in die Welt einfügen
        this.parentWorld.add(this.playerObject);

        // Kamera an Mesh anhängen, sobald Mesh existiert
        if (this.playerObject.mesh) {
            this.playerObject.mesh.add(this.camera);
        } else {
            // Fallback, falls Mesh noch nicht geladen ist
            setTimeout(() => {
                this.playerObject.mesh.add(this.camera);
            }, 0);
        }
        this.playerObject.rigidbody.lockRotations(true, true, true);
        // Input Events
        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyW": this.moveForward = true; break;
                case "KeyA": this.moveLeft = true; break;
                case "KeyS": this.moveBackward = true; break;
                case "KeyD": this.moveRight = true; break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.code) {
                case "KeyW": this.moveForward = false; break;
                case "KeyA": this.moveLeft = false; break;
                case "KeyS": this.moveBackward = false; break;
                case "KeyD": this.moveRight = false; break;
            }
        });

        // PointerLock aktivieren
        document.body.addEventListener("click", () => {
            this.controls.lock();
        });
    }

    update(delta) {
        super.update();

        // Dämpfung
        this.velocity.x -= this.velocity.x * 10 * delta;
        this.velocity.z -= this.velocity.z * 10 * delta;

        // Richtung
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
        this.direction.normalize();

        // Geschwindigkeit anwenden
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;

        // Impuls auf Rigidbody
        if (this.playerObject.rigidbody) {
            this.playerObject.rigidbody.applyImpulse(
                { x: this.velocity.x, y: 0, z: this.velocity.z },
                true
            );
        }
    }
}
