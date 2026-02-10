import * as THREE from "three";
import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/objects/Player/ctrl.js";
import AssetManager from "./engine/base/systems/AssetManager.js";
import DebugMenu from "./engine/objects/debug/DebugMenu.js";
import Level_00 from "./game/levels/Level_00.js";
import LevelManager from "./engine/base/systems/levels/LevelManager.js";
import Level_01 from "./game/levels/Level_01.js";

const components = {
    scene: new THREE.Scene(),
    camera: null,
    renderer: null,
    controls: null,
    world: null,
    debug: new DebugMenu({ key: "F2" }),
    assetPath: "/assets.json",
    assetManager: new AssetManager(),
    levelManager: null,
};

const clock = new THREE.Clock();

async function init() {
    RenderHelper.initViewport(true);
    components.camera = RenderHelper.createCamera();
    components.renderer = RenderHelper.createRenderer("#app");
    components.controls = ControlsHandler.setupControls(components.camera, components.renderer);

    components.levelManager = new LevelManager(components);
    await components.levelManager.initLevelLoader();
    components.levelManager.load(Level_01);

    // document.addEventListener("keydown", (k) => {
    //     if (k.code === "F7") {
    //         components.levelManager.load(Level_01);
    //     }
    // });

    animate();
}

function animate() {
    const delta = clock.getDelta();

    if (components.world) {
        components.world.update(delta);
    }

    components.renderer.render(components.scene, components.camera);
    components.controls.update(delta);
    requestAnimationFrame(animate);
}

window.addEventListener("load", init);


// import Engine from "./engine/Engine.js";
//
// const app = new Engine();
//
// window.addEventListener("load", () => {
//     app.init().catch(console.error);
// });