import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let camera, renderer;
let autoscale = true;

export function initViewport(autoScale = true) {
    autoscale = autoScale;

    window.addEventListener("resize", () => {
        if (!camera || !renderer || !autoscale) return;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

export function createCamera(fov = 60, near = 0.1, far = 1000) {
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    camera.position.set(0, 5, 10);
    return camera;
}

export function createRenderer(containerSelector = "#app") {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const container = document.querySelector(containerSelector);
    if (!container) throw new Error(`Container "${containerSelector}" not found.`);
    container.appendChild(renderer.domElement);

    return renderer;
}

export function startRenderLoop(updateCallback) {
    if (!camera || !renderer) throw new Error("Camera or renderer not initialized.");

    function loop() {
        if (updateCallback) updateCallback();
        renderer.render(scene, camera); // We'll pass scene via updateCallback or closure
        requestAnimationFrame(loop);
    }
    loop();
}
