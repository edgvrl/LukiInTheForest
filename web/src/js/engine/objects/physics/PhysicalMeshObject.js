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
            overrideCollider = null
        } = args;

        this.physics = true;

        this.fixed = fixed;
        this.mass = mass;
        this.restitution = restitution;

        this.overrideCollider = overrideCollider;
    }

    onAdded() {
        super.onAdded();


        const quat = new THREE.Quaternion().setFromEuler(this.rotation);

        // 1. Create RigidBody (Fixed or Dynamic)
        const bodyDesc = this.fixed ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();

        this.rigidbody = this.parentWorld.physicsScene.createRigidBody(
            bodyDesc
                .setTranslation(this.position.x, this.position.y, this.position.z)
                .setRotation({
                    x: quat.x,
                    y: quat.y,
                    z: quat.z,
                    w: quat.w
                })
        );

        let colliderShape;

        if(this.overrideCollider){
            colliderShape = this.overrideCollider;
            colliderShape.setMass(this.mass)
                .setRestitution(this.restitution);
        }
        else{

            // 2. Handle Scaling for the Collider
            // We clone the position array so we don't accidentally modify the original Three.js geometry
            let vertices = new Float32Array(this.objectScene.geometry.attributes.position.array);

            // Iterate through vertices and apply scale (x, y, z)
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] *= this.scale.x;
                vertices[i + 1] *= this.scale.y;
                vertices[i + 2] *= this.scale.z;
            }

            let indices = new Uint32Array(this.objectScene.geometry.index.array);

            // 3. Create Collider with scaled vertices
            colliderShape = RAPIER.ColliderDesc.trimesh(vertices, indices)
                .setMass(this.mass)
                .setRestitution(this.restitution);
        }
        this.parentWorld.physicsScene.createCollider(colliderShape, this.rigidbody);
    }

    update() {
        super.update();

        this.objectScene.position.copy(this.rigidbody.translation())
        this.objectScene.quaternion.copy(this.rigidbody.rotation())
    }
}