import * as bb from "bobril-build";
import * as dev from "./device";
import * as pathPlatformDependent from "path";
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
import * as fs from "fs-extra";
import { spawnAsync } from "./spawn";

export class AndroidPlatform implements dev.IPlatform {
    platform = dev.DevicePlatform.Android;
    private logcb: (text: string) => void;
    private project: bb.IProject;

    constructor() {
        this.logcb = (t) => console.log(t);
    }

    updateByProject(project: bb.IProject) {
        this.project = project;
    }

    logCallback(cb?: (text: string) => void) {
        this.logcb = cb;
    }

    projectPlatformDir() {
        return path.join(this.project.dir, "android");
    }

    removeCode(): Promise<void> {
        fs.removeSync(this.projectPlatformDir());
        return Promise.resolve();
    }

    prepareCode(): Promise<void> {
        fs.copySync(path.join(this.project.dir, "node_modules/bobriln/android"), this.projectPlatformDir());
        return Promise.resolve();
    }

    packageName(): string {
        let pn = "com.bobril.native";
        if (this.project.packageJsonBobril != null && this.project.packageJsonBobril["androidPackage"]) {
            pn = this.project.packageJsonBobril["androidPackage"];
        }
        return pn;
    }

    compileCode(release: boolean): Promise<string> {
        return spawnAsync((line) => {
            if (this.logcb) this.logcb(line);
        }, "gradlew", ["assemble" + (release ? "Release" : "Debug")], this.projectPlatformDir(), true).then((code) => {
            return path.join(this.project.dir, "android/app/build/outputs/apk/" + (release ? "app-release-unsigned.apk" : "app-debug.apk"));
        });
    }
}

export const instance = new AndroidPlatform();
