import * as bb from "bobril-build";

export enum DevicePlatform {
    Android
}

export enum DeviceStatus {
    Offline,
    Online
}

export interface IDevice {
    id: string;
    platform: IPlatform;
    name: string;
    status: DeviceStatus; 
    updateByProject(project:bb.IProject);
    logCallback(cb?: (text:string)=>void);
    installDebug(): Promise<void>;
    buildRelease(): Promise<void>;
    justRunDebug(): Promise<void>;
}

export interface IPlatform {
    platform: DevicePlatform;
    updateByProject(project:bb.IProject);
    logCallback(cb?: (text:string)=>void);
    removeCode(): Promise<void>;
    prepareCode(): Promise<void>;
    compiledPackageName(release: boolean): string;
    compileCode(release: boolean): Promise<void>;
}
