import * as bb from "bobril-build";
import * as dev from "./device";
import * as pathPlatformDependent from "path";
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
import * as androidHome from "./androidHome";
import { spawnAsync } from "./spawn";
import { AndroidPlatform } from "./androidPlatform";
import * as child_process from "child_process";

export class AndroidDevice implements dev.IDevice {
    id: string;
    platform: dev.IPlatform;
    name: string;
    status: dev.DeviceStatus;
    private logcb: (text: string) => void;
    private project: bb.IProject;

    constructor(platform: dev.IPlatform, id: string, name: string) {
        this.platform = platform;
        this.id = id;
        this.name = name;
        this.status = dev.DeviceStatus.Offline;
        this.logcb = (t) => console.log(t);
        setTimeout(() => this.checkStatus(), 100);
    }

    checkStatus() {
        // somehow using spawn does not work with next command, luckily execFile works ok.
        child_process.execFile(androidHome.getAdbPath(), ["-s", this.id, "reverse", "tcp:8080", "tcp:" + bb.getInteractivePort()], (err) => {
            let online = err == null;
            setTimeout(() => this.checkStatus(), 5000);
            if (online === (this.status === dev.DeviceStatus.Online))
                return;
            if (!online) {
                this.status = dev.DeviceStatus.Offline;
                if (this.logcb) this.logcb("Lost connection to " + this.name);
                bb.invalidateActions();
                return;
            }
            this.status = dev.DeviceStatus.Online;
            bb.invalidateActions();
            this.spawnAdb(["logcat", "-T", "1", "BobrilN:D", "*:S"]).then(() => {
                if (this.logcb) this.logcb("Logcat finished with " + this.name);
            }, (err) => {
                if (this.logcb) this.logcb("Logcat failed with " + JSON.stringify(err));
            })
        });
    }

    updateByProject(project: bb.IProject) {
        this.project = project;
        this.platform.updateByProject(project);
    }

    logCallback(cb?: (text: string) => void) {
        this.logcb = cb;
    }

    spawnAdb(params: string[], cb?: (line: string) => void): Promise<number> {
        return spawnAsync((line) => {
            if (this.logcb) this.logcb(line);
            if (cb) cb(line);
        }, androidHome.getAdbPath(), ["-s", this.id].concat(params));
    }

    spawnAdbShell(params: string[], cb?: (line: string) => void): Promise<number> {
        return this.spawnAdb(["shell"].concat(params), cb);
    }

    installRaw(packagePath: string, packageId: string): Promise<void> {
        let pathOnDevice = `/data/local/tmp/${path.basename(packagePath)}`;
        return this.spawnAdb(["push", packagePath, pathOnDevice]).then((code) => {
            if (code != 0) throw new Error("Uploading package to device failed");
            let failure = false;
            return this.spawnAdbShell(["pm", "install", "-r", pathOnDevice], (line) => {
                if (/Failure/.test(line)) {
                    failure = true;
                }
            }).then((code) => {
                if (code != 0 || failure) {
                    return this.spawnAdbShell(["pm", "uninstall", packageId]).then((code) => {
                        if (code != 0) throw new Error("Uninstalling old package from device failed");
                        return this.spawnAdbShell(["pm", "install", "-r", pathOnDevice]).then((code) => {
                            if (code != 0) throw new Error("Installing package after uninstalling old failed");
                        });
                    });
                }
            });
        })
    }

    installDebug(): Promise<void> {
        return this.platform.compileCode(false).then(() => {
            return this.installRaw(this.platform.compiledPackageName(false), (this.platform as AndroidPlatform).packageName());
        });
    }

    buildRelease(): Promise<void> {
        return this.platform.compileCode(true);
    }

    justRunDebug(): Promise<void> {
        return this.spawnAdbShell(["monkey", "-p", (this.platform as AndroidPlatform).packageName(), "1"]).then((code) => {
            if (code != 0) throw new Error("Running app on device failed");
        });
    }
}
