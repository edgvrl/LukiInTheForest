import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Weapon from "../Weppon.js";
import MeshObject from "../../mesh/MeshObject.js";

export default class AK47 extends Weapon {
    constructor() {
        super();

        this.settings = {
            damage: 35,
            fireRate: 10,
            magazineSize: 30,
            reloadTime: 3,
            automatic: true
        };

        this.ammo = this.settings.magazineSize;

        this._loadModel();
    }

    _loadModel() {
        const loader = new GLTFLoader();

        loader.load(
            "/models/weapons/AK47.glb",
            (gltf) => {
                this.mesh = gltf.scene;
                console.log("AK47 model loaded");

                this.mesh.position.set(0.4, -0.3, -0.4);
                this.mesh.rotation.set(0, Math.PI / 2, 0);
                this.mesh.scale.setScalar(0.5);

                if (this.camera) {
                    this.camera.add(this.mesh);
                }
            }
        );
    }


    fire() {
        if (!this.camera) return;             // sanity check
        if (this.isReloading) return;         // block while reloading
        if (this.ammo <= 0) {                 // auto-reload if empty
            this.reload();
            return;
        }

        this.ammo--;
        this.updateAmmoHUD();

        // --- Get origin and direction ---
        const origin = new THREE.Vector3();
        this.camera.getWorldPosition(origin);

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction).normalize();

        // --- Spawn projectile in front of camera ---
        const projectile = new MeshObject({
            asset: "m_error",
            position: origin.clone(),
            scale: new THREE.Vector3(0.1,0.1,0.1)
        });
        this.parentWorld.add(projectile);

        // move projectile along camera direction each frame
        const speed = 300; // units per second
        projectile.update = (delta) => {
            projectile.objectScene.position.add(direction.clone().multiplyScalar(speed * delta));
        };
        setTimeout(() => {
            this.parentWorld.remove(projectile);
        }, 300);
        // --- Raycast for hits ---
        const raycaster = new THREE.Raycaster(origin, direction, 0, 100);

        // find the top-level scene
        let root = this.camera;
        while (root.parent) root = root.parent;

        const hits = raycaster.intersectObjects(root.children, true)
            .filter(hit => hit.object !== this.mesh);

        // Debug line endpoint
        let endPoint = origin.clone().add(direction.clone().multiplyScalar(50));

        if (hits.length > 0) {
            const hit = hits[0];
            endPoint = hit.point;

            // check if hit object has a zombie
            let obj = hit.object;
            while (obj && !obj.userData.zombie) obj = obj.parent;

            if (obj && obj.userData.zombie) {
                obj.userData.zombie.takeDamage(this.settings.damage);
                console.log("Hit zombie:", obj.name || obj, "HP:", obj.userData.zombie.Hp);
            } else {
                console.log("Hit object has no HP:", hit.object.name || hit.object);
            }
        }
        console.log("AK47 fired | ammo:", this.ammo);
    }
}
