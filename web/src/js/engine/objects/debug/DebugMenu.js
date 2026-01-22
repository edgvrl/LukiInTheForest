import GameObject from "../../base/GameObject.js";
import { GUI } from "dat.gui";
import DebugFrameTimeMonitor from "./modules/DebugFrameTimeMonitor.js";
import DebugLightVisualiser from "./modules/DebugLightVisualiser.js";

export default class DebugMenu extends GameObject {

    constructor(args = {}) {
        super(args);

        const { key = "F2" } = args;

        this.debugState = {
            frameTimeMonitor: false,
            lightVisualiser: false,
        };

        this.debugGui = new GUI();

         var ro = this.debugGui.addFolder("Render Options");
         ro.add(this.debugState, "frameTimeMonitor")
            .name("FPS/MS")
            .onChange((enabled) => {
                enabled
                    ? this.spawnFrameTimeMonitor()
                    : this.destroyFrameTimeMonitor();
            });

        ro.add(this.debugState, "lightVisualiser")
            .name("Light Visualiser")
            .onChange((enabled) => {
                enabled
                    ? this.spawnLightVisualiser()
                    : this.destroyLightVisualiser();
            });


        //this.debugGui.domElement.style.display = "none"; TODO: only for debug purposes

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

    spawnLightVisualiser() {
        if (this.lightVisualiser) return;

        this.lightVisualiser = new DebugLightVisualiser();
        this.parentWorld.add(this.lightVisualiser);
    }

    destroyLightVisualiser() {
        if (!this.lightVisualiser) return;

        this.lightVisualiser.destroy();
        this.lightVisualiser = null;
    }

    update() {
        super.update();
    }

    destroy() {
        this.destroyFrameTimeMonitor();
        this.destroyLightVisualiser()
        this.debugGui.destroy();
        super.destroy();
    }
}
