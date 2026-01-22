import GameObject from "../../base/GameObject.js";
import Stats from "three/addons/libs/stats.module.js";

export default class DebugFrameTimeMonitor extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
        } = args;

        this.FTMonitor = new Stats();
        this.FTMonitor.domElement.id = "d_R_FT";
        document.body.appendChild( this.FTMonitor.domElement );

        this.objectScene = null;

    }

    destroy() {
        this.FTMonitor.domElement.remove();
        super.destroy();
    }

    update() {
        super.update();
        this.FTMonitor.update();
    }
}
