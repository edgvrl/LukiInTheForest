import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Weapon from "../Weppon.js";

export default class Shotgun extends Weapon {
    constructor() {
        super();

        this.settings = {
            damage: 80,
            fireRate: 1,
            magazineSize: 8,
            reloadTime: 3,
            automatic: false
        };

        this.ammo = this.settings.magazineSize;

        this._loadModel();
    }

    _loadModel() {
        const loader = new GLTFLoader();

        loader.load(
            "/models/weapons/shotgun.glb", // path from public folder
            (gltf) => {
                this.mesh = gltf.scene;
                console.log("Shotgun model loaded");


                this.mesh.position.set(0.3, -0.5, -0.4);
                this.mesh.rotation.set(-0.1, 0, 0);
                this.mesh.scale.setScalar(0.5);


                // If already equipped, attach immediately
                if (this.camera) {
                    this.camera.add(this.mesh);
                }
            }
        );
    }

    fire() {
        if (!this.camera) return;

        const origin = new THREE.Vector3();
        this.camera.getWorldPosition(origin);

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward).normalize();

        // Scene root
        let root = this.camera;
        while (root.parent) root = root.parent;

        const numPellets = 20;       // number of bullets per shot
        const spreadAngle = 0.4;     // radians, adjust for wider/narrower spread

        for (let i = 0; i < numPellets; i++) {
            // Random rotation for spread
            const xRot = (Math.random() - 0.5) * spreadAngle;
            const yRot = (Math.random() - 0.5) * spreadAngle;
            const dir = forward.clone();
            const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(yRot, xRot, 0));
            dir.applyQuaternion(quat).normalize();

            // Raycast
            const raycaster = new THREE.Raycaster(origin, dir, 0, 100);
            const hits = raycaster.intersectObjects(root.children, true)
                .filter(hit => hit.object !== this.mesh);

            // Default end point
            let endPoint = origin.clone().add(dir.clone().multiplyScalar(50));

            if (hits.length > 0) {
                const hit = hits[0];
                endPoint = hit.point;

                // Walk up parent chain to find Zombie
                let obj = hit.object;
                while (obj && !obj.userData.zombie) {
                    obj = obj.parent;
                }

                if (obj && obj.userData.zombie) {
                    const zombie = obj.userData.zombie;
                    console.log("Hit:", obj.name || obj, "HP:", zombie.Hp);
                    zombie.takeDamage(this.settings.damage);
                } else {
                    console.log("Hit object has no HP:", hit.object.name || hit.object);
                }
                this.updateAmmoHUD();
            }

            // Debug line for each pellet
            const cubeSize = 3;
            const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            cube.position.copy(endPoint);
            console.log("Shotgun cube spawned at:", endPoint, "Cube object:", cube);
            this.objectScene.add(cube);
            setTimeout(() => this.objectScene.remove(cube), 1000);

        }
    }
}