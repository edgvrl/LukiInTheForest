import GameObject from "../../base/GameObject.js";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Level_00 from "../../../game/levels/Level_00.js";

export default class OrbitPlayerController extends GameObject {
    constructor(args = {}) {
        super(args);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 20);

        // Attach to document.body
        this.controls = new OrbitControls(this.camera, document.body);
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.enableDamping = true;

        // Disable interactions so they don't fight with the next level's controls
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.enableRotate = false;

        this._onKeyDown = this._onKeyDown.bind(this);
    }


    _onKeyDown(e) {
        // Checking for Enter specifically
        if (e.code === "KeyS") {
            document.location.href = "https://github.com/edgvrl/LukiInTheForest"
        }else{
            this.transitionToLevel();
        }
    }

    transitionToLevel() {
        if (this.parentWorld?.cr?.levelManager) {
            // IMPORTANT: You must call destroy before loading the next level
            // to ensure the mouse is "freed" from OrbitControls
            this.parentWorld.cr.levelManager.load(Level_00);
            this.destroy();
        }
    }

    update(delta) {
        // Guard against updating after destruction
        if (this.controls) {
            this.controls.update();
        }
    }
    onAdded() {
        super.onAdded();
        this.objectScene.add(this.camera);

        // Bind resize
        this._onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            const renderer = this.parentWorld.renderer;
            if (renderer) {
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', this._onResize);
        document.addEventListener("keydown", this._onKeyDown);
    }

    destroy() {
        window.removeEventListener('resize', this._onResize);
        document.removeEventListener("keydown", this._onKeyDown);
        // 1. Stop listening for the Enter key
        document.removeEventListener("keydown", this._onKeyDown);

        // 2. THIS IS THE FIX: Completely unbind all mouse/touch listeners
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // 3. Call the base GameObject destroy (removes from scene)
        super.destroy();
    }
}