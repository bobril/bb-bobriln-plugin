import * as dev from "./device";
export declare class DeviceList {
    private list;
    private selected;
    findById(id: string, platform: dev.DevicePlatform): dev.IDevice;
    add(device: dev.IDevice): void;
    select(device: dev.IDevice): void;
    getSelected(): dev.IDevice;
    getList(): dev.IDevice[];
}
export declare const deviceList: DeviceList;
export declare function detectDevices(): void;
