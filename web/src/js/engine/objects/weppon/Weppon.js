import GameObject from "../../base/GameObject.js";

export default class Weapon extends GameObject {
    constructor(args = {}) {
        super(args);

        this.settings = {
            damage: 0,
            fireRate: 0,        // shots per second
            magazineSize: 0,
            reloadTime: 0,      // seconds
            automatic: false
        };

        this.ammo = this.settings.magazineSize;
        this.isReloading = false;
        this.lastShotTime = 0;

        this.mesh = null;
        this.camera = null;
    }

    equip(camera) {
        //console.log("Weapon equipped");
        this.camera = camera;
        if (this.mesh) {
            camera.add(this.mesh);
        }
        this.updateAmmoHUD();
    }

    unequip() {
        if (this.mesh && this.camera) {
            this.camera.remove(this.mesh);
        }
        this.camera = null;
        this.updateAmmoHUD();
    }

    reload() {
        if (this.isReloading) return; // prevent double reload
        this.isReloading = true;

        this.updateAmmoHUD();

        setTimeout(() => {
            this.ammo = this.settings.magazineSize;
            this.updateAmmoHUD();

            this.isReloading = false;

        }, this.settings.reloadTime * 1000);
    }



    tryFire(time) {
        if (this.isReloading) return;
        if (this.ammo <= 0) {
            this.reload();
            return;
        }

        const fireDelay = 1 / this.settings.fireRate;
        if (time - this.lastShotTime < fireDelay) return;

        this.lastShotTime = time;
        this.ammo--;

        this.fire();
        this.updateAmmoHUD();
    }



    fire() {
        throw new Error("Weapon.fire() must be overridden");
    }


    updateAmmoHUD() {
        const ammoElem = document.getElementById("ammoCount");
        const magElem = document.getElementById("magSize");
        const reloadElem = document.getElementById("reloadStatus");

        if (ammoElem) ammoElem.textContent = this.ammo;
        if (magElem) magElem.textContent = this.settings.magazineSize;
        if (reloadElem) reloadElem.textContent = this.isReloading ? "Reloading..." : "";
    }



    update(delta) {
        super.update(delta);
    }

}
