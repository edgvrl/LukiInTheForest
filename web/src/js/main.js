import * as THREE from "three";
import RAPIER, {Collider} from '@dimforge/rapier3d-compat';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
import DebugCollisionVisualiser from "./engine/objects/debug/modules/DebugCollisionVisualiser.js";
import {Vector3} from "three";
import AssetManager from "./engine/base/AssetManager.js";


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
    world = new World(scene);

    await assetManager.loadRegistry(assetPath)

    world.add(debug);

    world.add(new SkyBoxObject({renderer: renderer}));


    //world.add(new PointLightObject({position: new THREE.Vector3(2,2,2),}));
    //world.add(new AmbientLightObject({intensity: 0.75}));
    //world.add(new SpotLightObject({position: new THREE.Vector3(-2,2,-2),}));

    createLandscape();

    for(let i = 20; i < 30; i++) {
        spawnCube(i)
    }

    console.log(world.gameObjects);

    animate();
}

function createLandscape() {

    gltfLoader.load("/models/world/landscape/world.glb", (gltf) => {
        let tempmesh = null;

        gltf.scene.traverse((node) => {
            if (node.isMesh) tempmesh = node;
        });
        world.add(new PhysicalMeshObject({
            mesh: tempmesh,
            fixed: true,
            scale : new Vector3(100,100,100)
        }));
    });
}

function spawnCube(y){

    world.add(new PhysicalMeshObject({
        mesh: assetManager.getModel("none"),
        receiveShadows: true,
        position: new THREE.Vector3(0, 2*y+0.5*y, 0),
        //overrideCollider: RAPIER.ColliderDesc.cuboid(1, 1, 1).setMass(1).setRestitution(0.5)
    }));
}

function animate() {

    const delta = clock.getDelta();
    world.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);
}



