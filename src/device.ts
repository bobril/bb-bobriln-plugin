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
    install(release: boolean, andRun: boolean): Promise<void>;
}

export interface IPlatform {
    platform: DevicePlatform;
    updateByProject(project:bb.IProject);
    logCallback(cb?: (text:string)=>void);
    removeCode(): Promise<void>;
    prepareCode(): Promise<void>;
    compileCode(release: boolean): Promise<string>;
}
