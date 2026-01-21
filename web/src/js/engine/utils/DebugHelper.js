import CannonDebugger from 'cannon-es-debugger';
import { GUI } from 'dat.gui';

export default class DebugHelper {
    constructor(world) {
        this.world = world;

        this.debug = true;

        this.cannonDebugger = new CannonDebugger(this.world.scene, this.world.physics);
        this.debugGui = new GUI();
    }

    update() {
        if (this.debug && this.world.scene && this.world.physics && this.cannonDebugger) {
            this.cannonDebugger.update();
        }
    }

}
