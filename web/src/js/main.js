import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
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

    await RAPIER.init()
    world = new World(scene);

    world.add(debug);

    world.add(new SkyBoxObject({renderer: renderer}));


    //world.add(new PointLightObject({position: new THREE.Vector3(2,2,2),}));
    //world.add(new AmbientLightObject({intensity: 0.75}));
    //world.add(new SpotLightObject({position: new THREE.Vector3(-2,2,-2),}));

    createGround();

    spawnCube(20)

    console.log(world.gameObjects);

    animate();
}

function createGround() {
    // const mesh = new THREE.Mesh(
    //     new THREE.PlaneGeometry(10, 10),
    //     new THREE.MeshStandardMaterial({ color: 0xffffff })
    // );
    //
    // var temp = new PhysicalMeshObject({mesh: mesh, receiveShadows: true, fixed: true});
    // temp.setRotation(-90,0,0);
    // world.add(temp);

    gltfLoader.load("/models/world/landscape/world.glb", (gltf) => {
        let tempmesh = null;

        gltf.scene.position.y = -0.5;
        gltf.scene.scale.set(0.5, 0.5, 0.5);

        gltf.scene.traverse((node) => {
            if (node.isMesh) tempmesh = node;
        });
        world.add(new PhysicalMeshObject({mesh: tempmesh, fixed: true, scale : new Vector3(100,100,100) }));
    });
}

function spawnCube(y){
    gltfLoader.load("/models/dice/dice.glb", (gltf) => {
        let tempmesh = null;

        gltf.scene.position.y = -0.5;
        gltf.scene.scale.set(0.5, 0.5, 0.5);

        gltf.scene.traverse((node) => {
            if (node.isMesh) tempmesh = node;
        });
        world.add(new PhysicalMeshObject({mesh: tempmesh, receiveShadows: true, position: new THREE.Vector3(0, y, 0) }));
    });

    // gltfLoader.load("/models/dice/dice.glb", (gltf) => { geom merge
    //     const geometries = [];
    //
    //     // 1. Traverse the scene to find all geometries
    //     gltf.scene.traverse((node) => {
    //         if (node.isMesh) {
    //             // Apply the node's world transform to the geometry so they stay in place
    //             node.updateMatrixWorld();
    //             const clonedGeometry = node.geometry.clone();
    //             clonedGeometry.applyMatrix4(node.matrixWorld);
    //             geometries.push(clonedGeometry);
    //         }
    //     });
    //
    //     // 2. Merge all collected geometries into one
    //     const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, true);
    //
    //     // 3. Create a single mesh (using the material from the first mesh found, or a default)
    //     const tempmesh = new THREE.Mesh(mergedGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    //
    //     // 4. Add to your physical world
    //     world.add(new PhysicalMeshObject({
    //         mesh: tempmesh,
    //         receiveShadows: true,
    //         position: new THREE.Vector3(0, y, 0)
    //     }));
    // });
}

function animate() {

    const delta = clock.getDelta();
    world.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update(delta);
}



