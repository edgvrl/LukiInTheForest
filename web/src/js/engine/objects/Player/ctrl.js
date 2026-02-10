import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
export function setupControls( camera, renderer) { //TODO: REFACTOR
    let controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set(0, 10, 20); // back a bit
    camera.lookAt(0, 0, 0);        // look at the center

    return controls;
}
