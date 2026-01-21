import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class World {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.physics = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0),
        });

        this.objects = [];
    }

    add(object) {
        object.addTo(this.scene, this.physics);
        this.objects.push(object);
    }

    build() {
        const light1 = new THREE.PointLight(0xffffff, 50);
        light1.position.set(4, 5, 5);
        light1.castShadow = true;
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xffffff, 50);
        light2.position.set(-4, 3, 5);
        light2.castShadow = true;
        this.scene.add(light2);
    }

    update() {
        this.physics.fixedStep();
        for (const obj of this.objects) obj.update();
    }
}
