import * as bb from "bobril-build";
import * as dev from "./device";
import * as androidHome from "./androidHome";
import * as deviceList from "./deviceList";
import * as androidDevice from "./androidDevice";
import * as androidPlatform from "./androidPlatform";

import { spawnAsync } from "./spawn";

export function androidDeviceDetector(): Promise<void> {
    try {
        let command = androidHome.getAdbPath();
        return spawnAsync((line) => {
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
        }, command, ["devices", "-l"]).then(()=>{});
    }
    catch (err) {
        return Promise.reject(err);
    }
}
