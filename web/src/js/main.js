import * as THREE from "three";
import * as RenderHelper from "./engine/utils/RenderHelper.js";
import * as ControlsHandler from "./engine/ControlsHandler.js";
import AssetManager from "./engine/base/AssetManager.js";
import DebugMenu from "./engine/objects/debug/DebugMenu.js";
import Level_00 from "./game/levels/Level_00.js";

const components = {
    scene: new THREE.Scene(),
    camera: null,
    renderer: null,
    controls: null,
    world: null,
    debug: new DebugMenu({ key: "F2" }),
    assetPath: "/assets.json",
    assetManager: new AssetManager(),
    level: null
};

const clock = new THREE.Clock();

async function init() {
    RenderHelper.initViewport(true);
    components.camera = RenderHelper.createCamera();
    components.renderer = RenderHelper.createRenderer("#app");
    components.controls = ControlsHandler.setupControls(components.camera, components.renderer);

    components.level = new Level_00(components);
    await components.level.initLevelLoader();
    components.level.load();

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