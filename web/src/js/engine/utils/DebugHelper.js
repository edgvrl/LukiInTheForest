import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'dat.gui';

export default class DebugHelper {
    constructor(world) {
        this.world = world;

        this.debug = true;


        this.renderStats = this.initRenderStats()

        this.debugGui = new GUI();
    }

    initRenderStats(){
        var s = new Stats();
        s.domElement.style.position = 'absolute';
        s.domElement.style.top = '0px';
        s.domElement.style.display = 'block';
        s.domElement.style.cursor = 'pointer';
        s.domElement.style.height = '100%';
        document.body.appendChild( s.domElement );
        return s;
    }

    update() {
        if (this.debug && this.world.scene && this.renderStats) {
            this.renderStats.update();
        }
    }

}
