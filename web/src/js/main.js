import * as THREE from "three";

import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/ControlsHandler.js";

import World from "./engine/base/GameWorld.js";
import PointLightObject from "./engine/objects/light/PointLightObject.js";
import SpotLightObject from "./engine/objects/light/SpotlightObject.js";
import StaticMeshObject from "./engine/objects/mesh/StaticMeshObject.js";
import DebugMenu from "./engine/objects/debug/DebugMenu.js";

const clock = new THREE.Clock();

let scene, camera, renderer, debugHelper, controls;
let world;

const debug = new DebugMenu({key:"F2"})

window.addEventListener("load", init);


async function init() {
    scene = new THREE.Scene();

    RenderHelper.initViewport(true);
    camera = RenderHelper.createCamera();
    renderer = RenderHelper.createRenderer("#app");
    controls = ControlsHandler.setupControls(camera,  renderer)

    world = new World(scene);

    world.add(debug);


    createGround();



    world.add(new PointLightObject({position: new THREE.Vector3(2,5,2),}));
    world.add(new SpotLightObject({position: new THREE.Vector3(0,5,0),}));

    console.log(world.gameObjects);

    animate();
}

function createGround() {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    var temp = new StaticMeshObject({mesh: mesh, receiveShadows: true});
    temp.setRotation(-90,0,0);
    world.add(temp);
}

function animate() {

    const delta = clock.getDelta();

    world.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);
}



