import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/ControlsHandler.js";
import DebugHelper from "./engine/utils/DebugHelper.js";

import World from "./engine/Base/GameWorld.js";
import GameObject from "./engine/Base/GameObject.js";
import {Vector3} from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {deltaTime} from "three/tsl";
import PointLightObject from "./engine/Objects/PointLightObject.js";
import SpotLightObject from "./engine/Objects/SpotlightObject.js";

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

    world = new World(scene);

    debugHelper = new DebugHelper(world);

    // Create objects
    createGround();



    world.add(new PointLightObject({position: new THREE.Vector3(2,2,0),}));
    world.add(new SpotLightObject({position: new THREE.Vector3(0,2,0),}));

    console.log(world.gameObjects);


    animate();
}

function createGround() {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    scene.add(mesh);
}

function animate() {

    const delta = clock.getDelta();

    world.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);

    debugHelper.update(delta);
}



