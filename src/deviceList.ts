import * as bb from "bobril-build";
import * as dev from "./device";
import * as androidDeviceDetector from "./androidDeviceDetector";

export class DeviceList {
    private list: dev.IDevice[] = [];
    private selected: dev.IDevice = null;

    findById(id: string, platform: dev.DevicePlatform): dev.IDevice {
        let idx = this.list.findIndex((v) => v.id === id && v.platform.platform === platform);
        if (idx >= 0) return this.list[idx];
        return null;
    }

    add(device: dev.IDevice) {
        console.log("Detected device: " + device.name + " (" + device.id + ")");
        this.list.push(device);
        if (this.selected == null) {
            this.selected = device;
        }
        bb.invalidateActions();
    }

    select(device: dev.IDevice) {
        if (device == null && this.list.length > 0)
            device = this.list[0];
        this.selected = device;
        bb.invalidateActions();
    }

    getSelected() {
        return this.selected;
    }

    getList() {
        return this.list;
    }
}

export const deviceList: DeviceList = new DeviceList();

export function detectDevices() {
    androidDeviceDetector.androidDeviceDetector();
}
