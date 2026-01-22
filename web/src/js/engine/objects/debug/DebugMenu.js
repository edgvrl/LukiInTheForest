import GameObject from "../../base/GameObject.js";
import { GUI } from "dat.gui";
import DebugFrameTimeMonitor from "./DebugFrameTimeMonitor.js";

export default class DebugMenu extends GameObject {

    constructor(args = {}) {
        super(args);

        const { key = "F2" } = args;

        this.debugState = {
            frameTimeMonitor: false
        };

        this.debugGui = new GUI();

        this.debugGui
            .add(this.debugState, "frameTimeMonitor")
            .name("FPS/MS")
            .onChange((enabled) => {
                enabled
                    ? this.spawnFrameTimeMonitor()
                    : this.destroyFrameTimeMonitor();
            });

        this.debugGui.domElement.style.display = "none";

        document.addEventListener("keydown", (k) => {
            if (k.code === key) {
                this.debugGui.domElement.style.display =
                    this.debugGui.domElement.style.display === "none"
                        ? "block"
                        : "none";
            }
        });

    }

    spawnFrameTimeMonitor() {
        if (this.FTMonitor) return;

        this.FTMonitor = new DebugFrameTimeMonitor();
        this.parentWorld.add(this.FTMonitor);
    }

    destroyFrameTimeMonitor() {
        if (!this.FTMonitor) return;

        this.FTMonitor.destroy();
        this.FTMonitor = null;
    }

    update() {
        super.update();
        this.FTMonitor?.update();
    }

    destroy() {
        this.destroyFrameTimeMonitor();
        this.debugGui.destroy();
        super.destroy();
    }
}
