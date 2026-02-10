import GameObject from "../../base/GameObject.js";
import { GUI } from "dat.gui";
import DebugFrameTimeMonitor from "./modules/DebugFrameTimeMonitor.js";
import DebugLightVisualiser from "./modules/DebugLightVisualiser.js";
import DebugCollisionVisualiser from "./modules/DebugCollisionVisualiser.js";

export default class DebugMenu extends GameObject {

    constructor(args = {}) {
        super(args);

        const { key = "F2" } = args;

        this.debugState = {
            frameTimeMonitor: false,
            lightVisualiser: false,
            collisionVisualiser: false,
        };

        this.debugGui = new GUI();

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

    onAdded() {
        this.constructGUI(this.debugGui);
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


    spawnCollisionVisualiser() {
        if (this.collisionVisualiser) return;

        this.collisionVisualiser = new DebugCollisionVisualiser();
        this.parentWorld.add(this.collisionVisualiser);
    }

    destroyCollisionVisualiser() {
        if (!this.collisionVisualiser) return;

        this.collisionVisualiser.destroy();
        this.collisionVisualiser = null;
    }




    update() {
        super.update();
    }

    destroy() {
        this.destroyFrameTimeMonitor();
        this.destroyLightVisualiser()
        this.destroyCollisionVisualiser()

        this.debugGui.destroy();

        super.destroy();
    }

    constructGUI(gui){
        var ro = gui.addFolder("Render Options");
        var po = gui.addFolder("Physics Options");

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

        ro.add(this.debugState, "collisionVisualiser")
            .name("Collision Visualiser")
            .onChange((enabled) => {
                enabled
                    ? this.spawnCollisionVisualiser()
                    : this.destroyCollisionVisualiser();
            });

        po.add(this.parentWorld.gravity, 'x', -10.0, 10.0, 0.1)
        po.add(this.parentWorld.gravity, 'y', -10.0, 10.0, 0.1)
        po.add(this.parentWorld.gravity, 'z', -10.0, 10.0, 0.1)

    }
}
