"use strict";
const dev = require("./device");
const androidHome = require("./androidHome");
const deviceList = require("./deviceList");
const androidDevice = require("./androidDevice");
const androidPlatform = require("./androidPlatform");
const spawn_1 = require("./spawn");
function androidDeviceDetector() {
    try {
        let command = androidHome.getAdbPath();
        return spawn_1.spawnAsync((line) => {
            let m = /^(.*?)\s+device\sproduct:(.*?)\smodel:(.*?)\sdevice:(.*?)$/.exec(line);
            if (m) {
                let id = m[1];
                let product = m[2];
                let model = m[3];
                let deviceName = m[4];
                let device = deviceList.deviceList.findById(id, dev.DevicePlatform.Android);
                if (!device) {
                    deviceList.deviceList.add(new androidDevice.AndroidDevice(androidPlatform.instance, id, `Android ${product}-${model}-${deviceName}`));
                }
            }
        }, command, ["devices", "-l"]).then(() => { });
    }
    catch (err) {
        return Promise.reject(err);
    }
}
exports.androidDeviceDetector = androidDeviceDetector;
//# sourceMappingURL=androidDeviceDetector.js.map