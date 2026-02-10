import GameObject from "../../base/GameObject.js";
import * as THREE from "three";

export default class Spawner extends GameObject {
    constructor(args = {}) {
        super(args);

        // An array of PhysicalMeshObject instances used as templates
        this.templates = args.objects || [];
        this.count = args.count || 500;
        this.spawnArea = args.spawnArea || 300;
        this.exclusionZone = 20;
    }

    onAdded() {
        super.onAdded();
        const landscape = [...this.parentWorld.gameObjects.values()]
            .find(obj => obj.asset === "landscape");

        if (landscape) {
            setTimeout(() => this.spawn(landscape), 100);
        }
    }

    spawn(landscape) {
        const target = landscape.objectScene;
        target.updateMatrixWorld(true);

        const raycaster = new THREE.Raycaster();
        const downVector = new THREE.Vector3(0, -1, 0);

        for (let i = 0; i < this.count; i++) {
            const x = (Math.random() - 0.5) * this.spawnArea;
            const z = (Math.random() - 0.5) * this.spawnArea;

            if (Math.abs(x) < this.exclusionZone && Math.abs(z) < this.exclusionZone) continue;

            const origin = new THREE.Vector3(x, 200, z);
            raycaster.set(origin, downVector);
            const intersects = raycaster.intersectObject(target, true);

            if (intersects.length > 0) {
                const hitPoint = intersects[0].point;

                // Pick a random template from the array
                const template = this.templates[Math.floor(Math.random() * this.templates.length)];

                // Construct a NEW object using the template's properties
                // We clone the template's position to use as an offset
                const finalPos = hitPoint.clone().add(template.position);

                // Assuming PhysicalMeshObject is the constructor for these objects
                const NewObject = template.constructor;

                this.parentWorld.add(new NewObject({
                    ...template, // Spread the template's properties (asset, fixed, etc.)
                    position: finalPos,
                    overrideCollider: template.overrideCollider // Ensure collider is passed
                }));
            }
        }
    }
}