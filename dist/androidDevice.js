"use strict";
const bb = require("bobril-build");
const dev = require("./device");
const pathPlatformDependent = require("path");
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
const androidHome = require("./androidHome");
const spawn_1 = require("./spawn");
const child_process = require("child_process");
class AndroidDevice {
    constructor(platform, id, name) {
        this.platform = platform;
        this.id = id;
        this.name = name;
        this.status = dev.DeviceStatus.Offline;
        this.logcb = (t) => console.log(t);
        setTimeout(() => this.checkStatus(), 100);
    }
    checkStatus() {
        // somehow using spawn does not work with next command, luckily execFile works ok.
        child_process.execFile(androidHome.getAdbPath(), ["-s", this.id, "reverse", "tcp:8080", "tcp:" + bb.interactivePort], (err) => {
            let online = err == null;
            setTimeout(() => this.checkStatus(), 5000);
            if (online === (this.status === dev.DeviceStatus.Online))
                return;
            if (!online) {
                this.status = dev.DeviceStatus.Offline;
                if (this.logcb)
                    this.logcb("Lost connection to " + this.name);
                bb.invalidateActions();
                return;
            }
            this.status = dev.DeviceStatus.Online;
            bb.invalidateActions();
            spawn_1.spawnAsync((line) => {
                if (this.logcb)
                    this.logcb(line);
            }, androidHome.getAdbPath(), ["-s", this.id, "logcat", "-T", "1", "BobrilN:D", "*:S"]).then(() => {
                if (this.logcb)
                    this.logcb("Logcat finished with " + this.name);
            }, (err) => {
                if (this.logcb)
                    this.logcb("Logcat failed with " + JSON.stringify(err));
            });
        });
    }
    updateByProject(project) {
        this.project = project;
        this.platform.updateByProject(project);
    }
    logCallback(cb) {
        this.logcb = cb;
    }
    install(release, andRun) {
        return this.platform.compileCode(release).then((apkfile) => {
            return spawn_1.spawnAsync((line) => {
                if (this.logcb)
                    this.logcb(line);
            }, androidHome.getAdbPath(), ["-s", this.id, "install", "-r", apkfile]);
        }).then(() => {
            if (andRun) {
                return spawn_1.spawnAsync((line) => {
                    if (this.logcb)
                        this.logcb(line);
                }, androidHome.getAdbPath(), ["-s", this.id, "shell", "monkey", "-p", this.platform.packageName(), "1"]).then(() => { });
            }
        });
    }
}
exports.AndroidDevice = AndroidDevice;
//# sourceMappingURL=androidDevice.js.map