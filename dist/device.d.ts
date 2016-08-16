import * as bb from "bobril-build";
export declare enum DevicePlatform {
    Android = 0,
}
export declare enum DeviceStatus {
    Offline = 0,
    Online = 1,
}
export interface IDevice {
    id: string;
    platform: IPlatform;
    name: string;
    status: DeviceStatus;
    updateByProject(project: bb.IProject): any;
    logCallback(cb?: (text: string) => void): any;
    install(release: boolean, andRun: boolean): Promise<void>;
}
export interface IPlatform {
    platform: DevicePlatform;
    updateByProject(project: bb.IProject): any;
    logCallback(cb?: (text: string) => void): any;
    removeCode(): Promise<void>;
    prepareCode(): Promise<void>;
    compileCode(release: boolean): Promise<string>;
}
