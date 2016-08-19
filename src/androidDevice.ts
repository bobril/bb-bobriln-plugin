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
        child_process.execFile(androidHome.getAdbPath(), ["-s", this.id, "reverse", "tcp:8080", "tcp:" + bb.interactivePort], (err) => {
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
            spawnAsync((line) => {
                if (this.logcb) this.logcb(line);
            }, androidHome.getAdbPath(), ["-s", this.id, "logcat", "-T", "1", "BobrilN:D", "*:S"]).then(() => {
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

    installDebug(): Promise<void> {
        return this.platform.compileCode(false).then(() => {
            return spawnAsync((line) => {
                if (this.logcb) this.logcb(line);
            }, androidHome.getAdbPath(), ["-s", this.id, "install", "-r", this.platform.compiledPackageName(false)]).then((code) => {
                if (code != 0) throw new Error("Installing package to device failed");
            });
        });
    }

    buildRelease(): Promise<void> {
        return this.platform.compileCode(true);
    }

    justRunDebug(): Promise<void> {
        return spawnAsync((line) => {
            if (this.logcb) this.logcb(line);
        }, androidHome.getAdbPath(), ["-s", this.id, "shell", "monkey", "-p", (this.platform as AndroidPlatform).packageName(), "1"]).then((code) => {
            if (code != 0) throw new Error("Running app on device failed");
        });
    }
}
