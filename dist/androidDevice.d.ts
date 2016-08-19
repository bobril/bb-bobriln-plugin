import * as bb from "bobril-build";
import * as dev from "./device";
export declare class AndroidDevice implements dev.IDevice {
    id: string;
    platform: dev.IPlatform;
    name: string;
    status: dev.DeviceStatus;
    private logcb;
    private project;
    constructor(platform: dev.IPlatform, id: string, name: string);
    checkStatus(): void;
    updateByProject(project: bb.IProject): void;
    logCallback(cb?: (text: string) => void): void;
    installDebug(): Promise<void>;
    buildRelease(): Promise<void>;
    justRunDebug(): Promise<void>;
}
