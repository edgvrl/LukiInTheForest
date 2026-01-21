import * as THREE from "three"; // Three.js for rendering 3D graphics
import * as CANNON from "cannon-es"; // Cannon.js for physics simulation
import * as ColisionHelper from "../engine/utils/ColisionHelper.js"; // Custom helper for collision shapes
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Loader for .glb / .gltf models

const loader = new GLTFLoader(); // Initialize the GLTF loader

export default class GameObject {

    // Static map to keep track of all GameObjects
    static GameObjects = new Map();
    static NewID = 0;

    constructor(args = {}) {
        this.id = GameObject.NewID++;
        GameObject.GameObjects.set(this.id, this);

        this.mesh = null;
        this.body = null;
        this._pendingAdd = null;
        this._queuedPosition = null;

        const {
            mesh = null,
            body = null,
            glb = "",
            complexCollision = false,
            scale = new THREE.Vector3(1, 1, 1),
            position = new THREE.Vector3(0, 5, 0)
        } = args;

        this.setPosition(position); // queue initial position if needed


        // CASE 0: Load GLB model with ComplexCollision
        if (glb && complexCollision) {
            loader.load(glb, (gltf) => {
                const loadedMesh = gltf.scene;
                loadedMesh.scale.copy(scale);
                loadedMesh.traverse(n => n.isMesh && (n.castShadow = true));
                this.mesh = loadedMesh;

                // Add ComplexCollision (Landscape)
                const shape = ColisionHelper.createTrimeshFromMesh(loadedMesh);
                const staticBody = new CANNON.Body({ mass: 0, collisionResponse:true });
                staticBody.addShape(shape);
                staticBody.position.set(position.x, position.y, position.z);
                this.body = staticBody;

                // Apply queued position if any
                if (this._queuedPosition) {
                    const { x, y, z } = this._queuedPosition;
                    this.body.position.set(x, y, z); // shift body up
                    this.mesh.position.set(x, y, z); // mesh stays at original
                    this._queuedPosition = null;
                }

                this.mesh.position.copy(position); // mesh always at original position
                this._tryAdd();
            });

            // CASE 1: Load GLB model with physics body
        } else if (glb && body instanceof CANNON.Body) {
            loader.load(glb, (gltf) => {
                const loadedMesh = gltf.scene;
                loadedMesh.scale.copy(scale);
                loadedMesh.traverse(n => n.isMesh && (n.castShadow = true));
                this.mesh = loadedMesh;

                // Shift physics body up by half mesh height so origin is at mesh center
                body.position.set(position.x, position.y, position.z);

                this.body = body;

                // Apply queued position if any
                if (this._queuedPosition) {
                    const { x, y, z } = this._queuedPosition;
                    this.body.position.set(x, y, z); // shift body up
                    this.mesh.position.set(x, y, z); // mesh stays at original
                    this._queuedPosition = null;
                }

                this.mesh.position.copy(position); // mesh always at original position
                this._tryAdd();
            });

            // CASE 2: Mesh + Body provided directly
        } else if (mesh instanceof THREE.Object3D && body instanceof CANNON.Body) {
            this.mesh = mesh;

            // Compute bounding box height for shifting body
            const bbox = new THREE.Box3().setFromObject(mesh);
            const height = bbox.max.y - bbox.min.y;

            this.body = body;
            this.mesh.position.copy(position);
            this.body.position.set(position.x, position.y, position.z);
        } else {
            throw new Error("GameObject: Provide either { glb, body } or { mesh, body }");
        }
    }

    addTo(scene, world) {
        this._pendingAdd = { scene, world };
        this._tryAdd();
    }

    _tryAdd() {
        if (!this.mesh || !this.body || !this._pendingAdd) return;

        this.body.collisionResponse = true;

        const { scene, world } = this._pendingAdd;
        scene.add(this.mesh);
        world.addBody(this.body);
        this._pendingAdd = null;
    }

    update() {
        if (!this.mesh || !this.body) return;
        this.mesh.position.copy(this.body.position);
        this.mesh.position.y; // shift back so mesh stays at original origin
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    destroy() {
        if (this.mesh?.parent) this.mesh.parent.remove(this.mesh);
        if (this.body?.world) this.body.world.removeBody(this.body);
        GameObject.GameObjects.delete(this.id);
    }

    setPosition(x, y, z) {
        if (x instanceof THREE.Vector3) {
            y = x.y;
            z = x.z;
            x = x.x;
        }

        if (this.body && this.mesh) {
            const height = this.getMeshHeight();
            this.body.position.set(x, y + height / 2, z);
            this.mesh.position.set(x, y, z);
        } else {
            this._queuedPosition = { x, y, z };
        }
    }

    // Helper to compute mesh height safely
    getMeshHeight() {
        if (!this.mesh) return 0;
        const bbox = new THREE.Box3().setFromObject(this.mesh);
        return bbox.max.y - bbox.min.y;
    }

}
