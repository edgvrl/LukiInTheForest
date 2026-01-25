import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import MeshObject from "../mesh/MeshObject.js";

export default class PhysicalMeshObject extends MeshObject {

    constructor(args = {}) {
        super(args);

        const {
            mass= 1,
            restitution = 0,
            fixed = false,
            overrideCollider = null
        } = args;

        this.physics = true;

        this.fixed = fixed;
        this.mass = mass;
        this.restitution = restitution; // basicaly wie gut es energie weitergibt

        this.overrideCollider = overrideCollider; // TODO: add simplex Collision as default, complex and override as option
    }

    onAdded() {
        super.onAdded();

        const quat = new THREE.Quaternion().setFromEuler(this.rotation);
        const bodyDesc = this.fixed ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();

        this.rigidbody = this.parentWorld.physicsScene.createRigidBody(
            bodyDesc
                .setTranslation(this.position.x, this.position.y, this.position.z)
                .setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })
        );

        if (this.overrideCollider) {
            this.parentWorld.physicsScene.createCollider(this.overrideCollider, this.rigidbody);
        } else {
            this.meshes.forEach((m) => {
                // 1. Get Geometry Data
                let vertices = new Float32Array(m.geometry.attributes.position.array);
                let indices = new Uint32Array(m.geometry.index.array);

                // 2. Apply the Global Scale to vertices
                // (Rapier colliders don't inherit scale from RigidBodies, so we bake it into the vertices)
                for (let i = 0; i < vertices.length; i += 3) {
                    vertices[i] *= this.scale.x;
                    vertices[i + 1] *= this.scale.y;
                    vertices[i + 2] *= this.scale.z;
                }

                // 3. Create Collider with the sub-mesh's RELATIVE transform
                let colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
                    .setTranslation(
                        m.position.x * this.scale.x,
                        m.position.y * this.scale.y,
                        m.position.z * this.scale.z
                    )
                    .setRotation({
                        x: m.quaternion.x,
                        y: m.quaternion.y,
                        z: m.quaternion.z,
                        w: m.quaternion.w
                    })
                    .setRestitution(this.restitution);

                this.parentWorld.physicsScene.createCollider(colliderDesc, this.rigidbody);
            });
        }
    }

    update() {
        super.update();

        this.objectScene.position.copy(this.rigidbody.translation())
        this.objectScene.quaternion.copy(this.rigidbody.rotation())


    }
}