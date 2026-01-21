import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as RenderHelper from "./engine/utils/RenderHelper.js";

import World from "./engine/_world.js";
import GameObject from "./engine/_object.js";

let scene, camera, renderer;
let world;

window.addEventListener("load", init);

function init() {
    scene = new THREE.Scene();

    RenderHelper.initViewport(true);
    camera = RenderHelper.createCamera();
    renderer = RenderHelper.createRenderer("#app");

    world = new World(scene, camera);
    world.build();

    // Create objects
    createGround();
    createDice();

    // Start animation loop
    animate();
}

function createGround() {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(5, 5, 0.01)),
    });
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

    world.add(new GameObject({ mesh, body }));
}

function createDice() {
    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    });


    body.position.set(0, 5, 0);
    body.angularVelocity.set(0, 0, 10);
    body.angularDamping = 0.1;

    const dice = new GameObject({ glb : "/models/dice/dice.glb"});
    world.add(dice);


}
function animate() {
    world.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

