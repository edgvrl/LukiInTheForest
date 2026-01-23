import * as THREE from "three";
import GameObject from "../../base/GameObject.js";
import RAPIER from "@dimforge/rapier3d-compat";

export default class MeshObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            mesh = new THREE.Mesh(),
            receiveShadows: receiveShadows = true,
        } = args;
        mesh.receiveShadow = receiveShadows;

        this.objectScene = mesh;

        this.objectScene.position.set(this.position.x, this.position.y, this.position.z);
        this.objectScene.rotation.set(this.getRotation().x, this.getRotation().y, this.getRotation().z);
        this.objectScene.scale.set(this.scale.x, this.scale.y, this.scale.z);

    }

    update() {
        super.update();
    }
}
