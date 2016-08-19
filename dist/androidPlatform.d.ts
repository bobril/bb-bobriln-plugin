import * as bb from "bobril-build";
import * as dev from "./device";
export declare class AndroidPlatform implements dev.IPlatform {
    platform: dev.DevicePlatform;
    private logcb;
    private project;
    constructor();
    updateByProject(project: bb.IProject): void;
    logCallback(cb?: (text: string) => void): void;
    projectPlatformDir(): string;
    removeCode(): Promise<void>;
    prepareCode(): Promise<void>;
    packageName(): string;
    compiledPackageName(release: boolean): string;
    compileCode(release: boolean): Promise<void>;
}
export declare const instance: AndroidPlatform;
