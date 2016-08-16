"use strict";
const bb = require("bobril-build");
const androidDeviceDetector = require("./androidDeviceDetector");
class DeviceList {
    constructor() {
        this.list = [];
        this.selected = null;
    }
    findById(id, platform) {
        let idx = this.list.findIndex((v) => v.id === id && v.platform.platform === platform);
        if (idx >= 0)
            return this.list[idx];
        return null;
    }
    add(device) {
        console.log("Detected device: " + device.name + " (" + device.id + ")");
        this.list.push(device);
        if (this.selected == null) {
            this.selected = device;
        }
        bb.invalidateActions();
    }
    select(device) {
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
exports.DeviceList = DeviceList;
exports.deviceList = new DeviceList();
function detectDevices() {
    androidDeviceDetector.androidDeviceDetector();
}
exports.detectDevices = detectDevices;
//# sourceMappingURL=deviceList.js.map