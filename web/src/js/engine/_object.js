import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as ColisionHelper from "../engine/utils/ColisionHelper.js"
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export default class _Object {

    static _Objects = new Map();
    static NewID = 0;

    constructor(args = { mesh: null, body: null, glb: "/models/dice/dice.glb" }) {

        this.id = _Object.NewID++;
        _Object._Objects.set(this.id, this);

        // CASE 1: Load from GLB
        if (args.glb) {
            loader.load(args.glb, (gltf) => {
                const mesh = gltf.scene;
                mesh.scale.set(0.5, 0.5, 0.5);
                mesh.traverse(n => n.isMesh && (n.castShadow = true));

                this.mesh = mesh;


                const shape = ColisionHelper.createConvexPolyhedron(mesh);
                this.body = new CANNON.Body({ mass: 1, shape });
            });
        }
        // CASE 2: Provided mesh and body
        else if (args.mesh instanceof THREE.Mesh && args.body instanceof CANNON.Body) {
            this.mesh = args.mesh;
            this.body = args.body;
        }
        else {
            throw new Error("Parameter Error: Provide either a GLB path or valid mesh/body");
        }
    }

    addTo(scene, world) {
        if (this.mesh) scene.add(this.mesh);
        if (this.body) world.addBody(this.body);
    }

    update() {
        if (!this.mesh || !this.body) return

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    destroy() {
        if (this.mesh?.parent) this.mesh.parent.remove(this.mesh);
        if (this.body?.world) this.body.world.removeBody(this.body);
        _Object._Objects.delete(this.id);
    }

}
