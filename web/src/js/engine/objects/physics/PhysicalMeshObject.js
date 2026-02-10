import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import MeshObject from "../mesh/MeshObject.js";

export default class PhysicalMeshObject extends MeshObject {

    constructor(args = {}) {
        super(args);

        const {
            mass= 1,
            restitution = 0,
            friction = 1,
            fixed = false,
            overrideCollider = null

        } = args;

        this.physics = true;

        this.fixed = fixed;
        this.mass = mass;
        this.restitution = restitution; // basicaly wie gut es energie weitergibt
        this.friction = friction;

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
                const vertices = new Float32Array(m.geometry.attributes.position.array);
                const indices = m.geometry.index ? new Uint32Array(m.geometry.index.array) : null;

                // 2. Bake Scale (World Scale * Local Mesh Scale)
                const finalScale = new THREE.Vector3().copy(this.scale).multiply(m.scale);
                for (let i = 0; i < vertices.length; i += 3) {
                    vertices[i] *= finalScale.x;
                    vertices[i + 1] *= finalScale.y;
                    vertices[i + 2] *= finalScale.z;
                }

                // 3. Choose Shape: Convex Hull for dynamic, Trimesh for static
                if (this.fixed) {
                    this.colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
                } else {
                    this.colliderDesc = RAPIER.ColliderDesc.convexHull(vertices);
                }

                // 4. Apply Relative Offset
                // We multiply the local position by parent scale so the offset is correct
                this.colliderDesc
                    .setTranslation(
                        m.position.x * this.scale.x,
                        m.position.y * this.scale.y,
                        m.position.z * this.scale.z
                    )
                    .setRotation(m.quaternion)
                    .setMass(this.mass / this.meshes.length) // Split mass among parts
                    .setRestitution(this.restitution)
                    .setFriction(this.friction);

                // 5. ATTACH IMMEDIATELY (Don't overwrite a single variable)
                this.parentWorld.physicsScene.createCollider(this.colliderDesc, this.rigidbody);
            });
        }

    }

    // In PhysicalMeshObject.js
    destroy() {
        // 1. Remove from Rapier Physics World
        if (this.rigidbody && this.parentWorld.physicsScene) {
            // removeRigidBody also deletes all attached colliders automatically
            this.parentWorld.physicsScene.removeRigidBody(this.rigidbody);
            this.rigidbody = null;
        }

        // 2. Call super to handle Three.js and world list cleanup
        super.destroy();
    }


    update(delta) {
        if (!this.rigidbody) return;
        super.update();


    }
}