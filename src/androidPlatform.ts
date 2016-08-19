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

    compiledPackageName(release: boolean): string {
        return path.join(this.project.dir, "android/app/build/outputs/apk/" + (release ? "app-release-unsigned.apk" : "app-debug.apk"));
    }

    compileCode(release: boolean): Promise<void> {
        let prom = Promise.resolve();
        if (!fs.existsSync(this.projectPlatformDir())) {
            prom = prom.then(() => {
                return this.prepareCode();
            });
        }
        prom = prom.then(() => {
            fs.outputFileSync(path.join(this.project.dir, "android/app/src/main/java/com/bobril/bobriln/BobrilnConfig.java"), `package com.bobril.bobriln;
public final class BobrilnConfig {
    static final boolean LoadFromLocalhostUrl = ${ release ? "false" : "true"};
    static final boolean ShakeToMenu = ${ release ? "false" : "true"};
}
`);
            let content=fs.readFileSync(path.join(this.project.dir, "android/app/build.gradle"),"utf-8");
            content = content.replace(/applicationId \".+\"/, `applicationId "${this.packageName()}"`);
        });
        prom = prom.then(() => {
            return spawnAsync((line) => {
                if (this.logcb) this.logcb(line);
            }, "gradlew", ["assemble" + (release ? "Release" : "Debug")], this.projectPlatformDir(), true).then((code) => {
                if (code != 0) {
                    throw new Error("gradle assemble failed");
                }
            });
        });
        return prom;
    }
}

export const instance = new AndroidPlatform();
