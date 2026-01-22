import GameObject from "../../base/GameObject.js";
import { GUI } from 'dat.gui';

export default class DebugMenu extends GameObject {

    constructor(args = {}) {
        super(args);

        const {
        } = args;

        this.debugGui = new GUI();

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
