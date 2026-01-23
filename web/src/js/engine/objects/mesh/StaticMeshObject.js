import * as THREE from "three";
import GameObject from "../../base/GameObject.js";
import RAPIER from "@dimforge/rapier3d-compat";

export default class StaticMeshObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            mesh = new THREE.Mesh(),
            receiveShadows: receiveShadows = true,
            physics = true,
            mass= 1,
            restitution = 0.5,
            fixed = false,
        } = args;

        this.physics = physics;

        this.fixed = fixed;
        this.mass = mass;
        this.restitution = restitution;

        mesh.receiveShadow = receiveShadows;

        this.objectScene = mesh;
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

        //this.setRotation(this.getRotation().x+1,0,0);
    }
}
