import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/ControlsHandler.js";
import DebugHelper from "./engine/utils/DebugHelper.js";

import World from "./engine/_world.js";
import GameObject from "./engine/GameObject.js";
import {Vector3} from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {deltaTime} from "three/tsl";

const clock = new THREE.Clock();

let scene, camera, renderer, debugHelper, controls;
let world;

window.addEventListener("load", init);

async function init() {
    scene = new THREE.Scene();

    RenderHelper.initViewport(true);
    camera = RenderHelper.createCamera();
    renderer = RenderHelper.createRenderer("#app");
    controls = ControlsHandler.setupControls(camera,  renderer)

    world = new World(scene, camera);
    world.build();

    debugHelper = new DebugHelper(world);

    // Create objects
    createGround();

    var dice = new GameObject({
        glb: "/models/dice/dice.glb",
        scale: new Vector3(0.5,0.5,0.5),
        body: new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
        }),
        position: new Vector3(0,10,0),
    })
    world.add(dice)

    var test = new GameObject({
        //glb: "/models/AK47.glb",
        glb: "/models/world/landscape/world.glb",
        scale: new Vector3(100,100,100),
        position: new Vector3(0,0,0),
        complexCollision: true,
    })
    world.add(test)

    console.log(dice.id)
    //console.log(test.id)
    console.log(GameObject.GameObjects)


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

function animate() {

    const delta = clock.getDelta();

    world.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);

    debugHelper.update(delta);
}



