import * as THREE from "three";
import GameObject from "../../base/GameObject.js";
import {HDRLoader} from "three/addons";
import {FloatType} from "three";

const loader = new HDRLoader();

export default class SkyBoxObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            hdr = "/textures/env/test.hdr",
            renderer = null,
        } = args;

        this.hdrPath = hdr;
        this.objectScene = null;
        this.renderer = renderer;
    }

    async onAdded() {
        const hdrTexture = await loader.loadAsync(this.hdrPath);
        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

        this.parentWorld.scene.environment = envMap;
        this.parentWorld.scene.background = envMap;

        hdrTexture.dispose();
        pmremGenerator.dispose();

    }

    update() {
        super.update();
    }
}
