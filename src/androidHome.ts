import * as pathPlatformDependent from "path";
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
import * as fs from "fs";
import * as bb from "bobril-build";

let androidHomeCache: string;

function addAdbPath(home: string): string {
    if (process.platform === "win32")
        return path.join(home, "platform-tools/adb.exe");
    else
        return path.join(home, "platform-tools/adb");
}

export function getAndCheckAndroidHome(): string {
    if (androidHomeCache) return androidHomeCache;
    let home = process.env["ANDROID_HOME"];
    if (home) {
        home = bb.normalizePath(home);
        let adb = addAdbPath(home);
        if (fs.existsSync(adb)) {
            androidHomeCache = home;
            return androidHomeCache;
        }
    }
    let pathsToTry = ["c:/Program Files (x86)/Android/android-sdk", "c:/Android/android-sdk"];
    home = pathsToTry.find((h) => fs.existsSync(addAdbPath(h)));
    if (home) {
        process.env["ANDROID_HOME"] = home;
        androidHomeCache = home;
        return androidHomeCache;
    }
    throw new Error("ANDROID_HOME does not point to directory with Android sdk");
}

export function getAdbPath(): string {
    return addAdbPath(getAndCheckAndroidHome());
}
