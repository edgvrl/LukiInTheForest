import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class StaticMeshObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            mesh = new THREE.Mesh(),
            receiveShadows: receiveShadows = true,
        } = args;

        mesh.receiveShadow = receiveShadows;

        this.objectScene = mesh;


    }

    update() {
        super.update();
    }
}
