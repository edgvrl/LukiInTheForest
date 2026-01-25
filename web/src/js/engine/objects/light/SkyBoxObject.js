import * as THREE from "three";
import GameObject from "../../base/GameObject.js";

export default class SkyBoxObject extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
            asset = "skybox",
            renderer = null,
        } = args;


        this.asset = asset;
        this.objectScene = null;
        this.renderer = renderer;
    }

    async onAdded() {
        super.onAdded();

        const hdrTexture = this.parentWorld.assetManager.getTexture("skybox");
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
