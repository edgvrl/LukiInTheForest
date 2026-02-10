import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Weapon from "../Weppon.js";

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
            "/models/weapons/AK47.glb", // <- use manifest path directly
            (gltf) => {
                this.mesh = gltf.scene;
                console.log("AK47 model loaded");

                this.mesh.position.set(-0.2, -0.25, -0.4);
                this.mesh.rotation.set(0, Math.PI / 2, 0);
                this.mesh.scale.setScalar(0.5);



                if (this.camera) {
                    this.camera.add(this.mesh);
                }
            }
        );
    }


    fire() {
        if (!this.camera) return;

        console.log("AK47 fired | ammo:", this.ammo);

        // Ray origin
        const origin = new THREE.Vector3();
        this.camera.getWorldPosition(origin);

        // Ray direction
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.normalize();

        const raycaster = new THREE.Raycaster(origin, direction, 0, 100);

        // Find the REAL scene root
        let root = this.camera;
        while (root.parent) root = root.parent;

        // Raycast (ignore the weapon itself)
        const hits = raycaster.intersectObjects(
            root.children,
            true
        ).filter(hit => hit.object !== this.mesh);

        // Debug / hit logic
        let endPoint = origin.clone().add(direction.clone().multiplyScalar(50));

        if (hits.length > 0) {
            const hit = hits[0];
            const endPoint = hit.point;

            // Start from the hit mesh
            let obj = hit.object;

            while (obj && !obj.userData.zombie) {
                obj = obj.parent;
            }

            if (obj && obj.userData.zombie) {
                const zombie = obj.userData.zombie;

                console.log("Hit:", obj.name || obj, "HP:", zombie.Hp);

                // Apply damage
                zombie.takeDamage(this.settings.damage);
            } else {
                console.log("Hit object has no HP:", hit.object.name || hit.object);
            }
            this.updateAmmoHUD();
        }


        // Debug line
        const geometry = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(geometry, material);

    }

}
