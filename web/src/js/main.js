import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';

import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/ControlsHandler.js";

import World from "./engine/base/GameWorld.js";
import PointLightObject from "./engine/objects/light/PointLightObject.js";
import SpotLightObject from "./engine/objects/light/SpotlightObject.js";
import MeshObject from "./engine/objects/mesh/MeshObject.js";
import PhysicalMeshObject from "./engine/objects/physics/PhysicalMeshObject.js";
import AmbientLightObject from "./engine/objects/light/AmbientLightObject.js";
import SkyBoxObject from "./engine/objects/light/SkyBoxObject.js";



import DebugMenu from "./engine/objects/debug/DebugMenu.js";
import {Vector3} from "three";
import AssetManager from "./engine/base/AssetManager.js";
import TreeSpawner from "./game/prefabs/TreeSpawner.js";


const clock = new THREE.Clock();

let scene, camera, renderer, controls;
let world;

const debug = new DebugMenu({key:"F2"})

const assetManager = new AssetManager();
const assetPath = "/assets.json"

window.addEventListener("load", init);


async function init() {
    scene = new THREE.Scene();

    RenderHelper.initViewport(true);
    camera = RenderHelper.createCamera();
    renderer = RenderHelper.createRenderer("#app");
    controls = ControlsHandler.setupControls(camera,  renderer)


    await RAPIER.init()
    world = new World(scene, assetManager);
    world.add(debug);

    await assetManager.loadRegistry(assetPath)

    world.add(new SkyBoxObject({renderer: renderer}));


    world.add(new PointLightObject({position: new THREE.Vector3(2,2,2),}));
    //world.add(new AmbientLightObject({intensity: 0.2}));
    world.add(new SpotLightObject({position: new THREE.Vector3(-2,2,-2),}));

    createLandscape();

    world.add(new TreeSpawner({}));

    console.log(world.gameObjects);

    animate();
}

function createLandscape() {

    world.add(new PhysicalMeshObject({
        asset:"landscape",
        fixed: true,
        scale : new Vector3(200,200,200),
        position: new Vector3(0, 0, 0),
    }));
}



function animate() {

    const delta = clock.getDelta();
    world.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);
}



