"use strict";
const dev = require("./device");
const pathPlatformDependent = require("path");
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
const fs = require("fs-extra");
const spawn_1 = require("./spawn");
class AndroidPlatform {
    constructor() {
        this.platform = dev.DevicePlatform.Android;
        this.logcb = (t) => console.log(t);
    }
    updateByProject(project) {
        this.project = project;
    }
    logCallback(cb) {
        this.logcb = cb;
    }
    projectPlatformDir() {
        return path.join(this.project.dir, "android");
    }
    removeCode() {
        fs.removeSync(this.projectPlatformDir());
        return Promise.resolve();
    }
    prepareCode() {
        fs.copySync(path.join(this.project.dir, "node_modules/bobriln/android"), this.projectPlatformDir());
        return Promise.resolve();
    }
    packageName() {
        let pn = "com.bobril.native";
        if (this.project.packageJsonBobril != null && this.project.packageJsonBobril["androidPackage"]) {
            pn = this.project.packageJsonBobril["androidPackage"];
        }
        return pn;
    }
    compiledPackageName(release) {
        return path.join(this.project.dir, "android/app/build/outputs/apk/" + (release ? "app-release-unsigned.apk" : "app-debug.apk"));
    }
    compileCode(release) {
        let prom = Promise.resolve();
        if (!fs.existsSync(this.projectPlatformDir())) {
            prom = prom.then(() => {
                return this.prepareCode();
            });
        }
        prom = prom.then(() => {
            fs.outputFileSync(path.join(this.project.dir, "android/app/src/main/java/com/bobril/bobriln/BobrilnConfig.java"), `package com.bobril.bobriln;
public final class BobrilnConfig {
    static final boolean LoadFromLocalhostUrl = ${release ? "false" : "true"};
    static final boolean ShakeToMenu = ${release ? "false" : "true"};
}
`);
            let content = fs.readFileSync(path.join(this.project.dir, "android/app/build.gradle"), "utf-8");
            content = content.replace(/applicationId \".+\"/, `applicationId "${this.packageName()}"`);
        });
        prom = prom.then(() => {
            return spawn_1.spawnAsync((line) => {
                if (this.logcb)
                    this.logcb(line);
            }, "gradlew", ["assemble" + (release ? "Release" : "Debug")], this.projectPlatformDir(), true).then((code) => {
                if (code != 0) {
                    throw new Error("gradle assemble failed");
                }
            });
        });
        return prom;
    }
}
exports.AndroidPlatform = AndroidPlatform;
exports.instance = new AndroidPlatform();
//# sourceMappingURL=androidPlatform.js.map