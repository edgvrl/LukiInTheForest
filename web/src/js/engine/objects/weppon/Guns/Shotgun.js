import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Weapon from "../Weppon.js";
import MeshObject from "../../mesh/MeshObject.js";

export default class Shotgun extends Weapon {
    constructor() {
        super();

        this.settings = {
            damage: 10,
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
        if (this.isReloading) return;
        if (this.ammo <= 0) {
            this.reload();
            return;
        }

        this.ammo--;
        this.updateAmmoHUD();

        const origin = new THREE.Vector3();
        this.camera.getWorldPosition(origin);

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward).normalize();

        let root = this.camera;
        while (root.parent) root = root.parent;

        const numPellets = 20;
        const spreadAngle = 0.15; // radians

        for (let i = 0; i < numPellets; i++) {
            // Create a random spread direction
            const xRot = (Math.random() - 0.5) * spreadAngle;
            const yRot = (Math.random() - 0.5) * spreadAngle;
            const dir = forward.clone();
            const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(yRot, xRot, 0));
            dir.applyQuaternion(quat).normalize();


            const projectile = new MeshObject({
                asset: "m_error",
                position: origin.clone(),
                scale: new THREE.Vector3(0.1, 0.1, 0.1)
            });
            this.parentWorld.add(projectile);

            const speed = 200;
            projectile.update = (delta) => {
                projectile.objectScene.position.add(dir.clone().multiplyScalar(speed * delta));
            };
            setTimeout(() => {
                this.parentWorld.remove(projectile);
            }, 300);
            // Raycast for hit detection
            const raycaster = new THREE.Raycaster(origin, dir, 0, 100);
            const hits = raycaster.intersectObjects(root.children, true)
                .filter(hit => hit.object !== this.mesh);

            if (hits.length > 0) {
                const hit = hits[0];
                let obj = hit.object;
                while (obj && !obj.userData.zombie) obj = obj.parent;

                if (obj && obj.userData.zombie) {
                    obj.userData.zombie.takeDamage(this.settings.damage);
                    console.log("Hit zombie:", obj.name || obj, "HP:", obj.userData.zombie.Hp);
                }
            }
        }

        console.log("Shotgun fired | ammo:", this.ammo);
    }
}