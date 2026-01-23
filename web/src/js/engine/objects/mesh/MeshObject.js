import * as THREE from "three";
import GameObject from "../../base/GameObject.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

export default class MeshObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            mesh = null,
            receiveShadows = true,
            castShadows = true,
        } = args;
        this.mesh = mesh;

        this.objectScene = this.mesh;

        this.objectScene.castShadow = castShadows;
        this.objectScene.receiveShadow = receiveShadows;

        this.objectScene.position.set(this.position.x, this.position.y, this.position.z);
        this.objectScene.rotation.set(this.getRotation().x, this.getRotation().y, this.getRotation().z);
        this.objectScene.scale.set(this.scale.x, this.scale.y, this.scale.z);

    }

    onAdded() {

    }

    update() {
        super.update();
    }
}
