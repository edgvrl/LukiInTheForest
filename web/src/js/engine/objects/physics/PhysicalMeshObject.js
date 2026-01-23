import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import MeshObject from "../mesh/MeshObject.js";

export default class PhysicalMeshObject extends MeshObject {

    constructor(args = {}) {
        super(args);

        const {
            mass= 1,
            restitution = 0.5,
            fixed = false,
        } = args;

        this.physics = true;

        this.fixed = fixed;
        this.mass = mass;
        this.restitution = restitution;
    }

    onAdded(){
        const quat = new THREE.Quaternion().setFromEuler(this.rotation);

        if(this.fixed){
            this.rigidbody = this.parentWorld.physicsScene.createRigidBody(
                RAPIER.RigidBodyDesc.fixed()
                    .setTranslation(this.position.x, this.position.y, this.position.z)
                    .setRotation({
                        x: quat.x,
                        y: quat.y,
                        z: quat.z,
                        w: quat.w
                    })
            );
        }
        else{
            this.rigidbody = this.parentWorld.physicsScene.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(this.position.x, this.position.y, this.position.z)
                    .setRotation({
                        x: quat.x,
                        y: quat.y,
                        z: quat.z,
                        w: quat.w
                    })
            );
        }


        let vertices = new Float32Array(this.objectScene.geometry.attributes.position.array);
        let indices = new Uint32Array(this.objectScene.geometry.index.array);
        let colliderShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(this.mass).setRestitution(this.restitution);

        this.parentWorld.physicsScene.createCollider(colliderShape, this.rigidbody)
    }

    update() {
        super.update();

        this.objectScene.position.copy(this.rigidbody.translation())
        this.objectScene.quaternion.copy(this.rigidbody.rotation())
    }
}
