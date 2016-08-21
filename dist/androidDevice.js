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
            this.spawnAdb(["logcat", "-T", "1", "BobrilN:D", "*:S"]).then(() => {
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
    spawnAdb(params, cb) {
        return spawn_1.spawnAsync((line) => {
            if (this.logcb)
                this.logcb(line);
            if (cb)
                cb(line);
        }, androidHome.getAdbPath(), ["-s", this.id].concat(params));
    }
    spawnAdbShell(params, cb) {
        return this.spawnAdb(["shell"].concat(params), cb);
    }
    installRaw(packagePath, packageId) {
        let pathOnDevice = `/data/local/tmp/${path.basename(packagePath)}`;
        return this.spawnAdb(["push", packagePath, pathOnDevice]).then((code) => {
            if (code != 0)
                throw new Error("Uploading package to device failed");
            let failure = false;
            return this.spawnAdbShell(["pm", "install", "-r", pathOnDevice], (line) => {
                if (/Failure/.test(line)) {
                    failure = true;
                }
            }).then((code) => {
                if (code != 0 || failure) {
                    return this.spawnAdbShell(["pm", "uninstall", packageId]).then((code) => {
                        if (code != 0)
                            throw new Error("Uninstalling old package from device failed");
                        return this.spawnAdbShell(["pm", "install", "-r", pathOnDevice]).then((code) => {
                            if (code != 0)
                                throw new Error("Installing package after uninstalling old failed");
                        });
                    });
                }
            });
        });
    }
    installDebug() {
        return this.platform.compileCode(false).then(() => {
            return this.installRaw(this.platform.compiledPackageName(false), this.platform.packageName());
        });
    }
    buildRelease() {
        return this.platform.compileCode(true);
    }
    justRunDebug() {
        return this.spawnAdbShell(["monkey", "-p", this.platform.packageName(), "1"]).then((code) => {
            if (code != 0)
                throw new Error("Running app on device failed");
        });
    }
}
exports.AndroidDevice = AndroidDevice;
//# sourceMappingURL=androidDevice.js.map