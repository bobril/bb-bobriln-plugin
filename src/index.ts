import * as commander from 'commander';
import * as bb from 'bobril-build';
import * as androidPlatform from './androidPlatform';
import { isEnabled } from './enabled';
import * as dev from "./device";
import * as deviceList from './deviceList';
import { initCommand } from './initCommand';
import { assetHandlerImage } from './assetHandlerImage';

let first = true;

export function afterInteractiveCompile() {
    if (isEnabled() && first) {
        first = false;
        deviceList.detectDevices();
    }
}

export function handleAsset(name: string, shortenFileNameAddPath: (fn: string) => string, project: bb.IProject) {
    if (!isEnabled()) return undefined;
    return assetHandlerImage(name, shortenFileNameAddPath, project);
}

export function updateWatchPaths(paths: string[]) {
    paths.push("!./android/**");
    paths.push("!./node_modules/bobriln/android/**");
}

function device2actionId(device: dev.IDevice) {
    if (device == null) return null;
    return "bn.selectDevice." + device.platform.platform + "." + device.id;
}

function actionId2device(actionId: string) {
    if (!actionId.startsWith("bn.selectDevice.")) return null;
    return deviceList.deviceList.getList().find((d) => device2actionId(d) === actionId);
}

export function registerActions(actions: bb.IActionsRegistry) {
    if (!isEnabled()) return;
    actions.registerCommand("bn.prepareCode.android", "Repave Android Code");
    actions.registerCommand("bn.detectDevices", "Refresh devices");
    actions.registerCombo("Device", device2actionId(deviceList.deviceList.getSelected()), deviceList.deviceList.getList().map((d) => actions.option(device2actionId(d), d.name)));
    actions.registerCommand("bn.installAndRun", deviceList.deviceList.getSelected() != null ? "Run" : "Assemble");
    if (deviceList.deviceList.getSelected() != null) {
        actions.registerCommand("bn.justRunDebug", "Just Run");
    }
    actions.registerCommand("bn.buildRelease", "Build Release");
}

function setConsoleLogger() {
    deviceList.deviceList.getList().forEach((d) => d.logCallback((t) => console.log(t)));
    androidPlatform.instance.logCallback((t) => console.log(t));
}

export function invokeAction(id: string): Promise<void> {
    let selDevice = actionId2device(id);
    if (selDevice) {
        deviceList.deviceList.select(selDevice);
        return;
    }
    switch (id) {
        case "bn.prepareCode.android": {
            setConsoleLogger();
            androidPlatform.instance.updateByProject(bb.getProject());
            return androidPlatform.instance.prepareCode();
        }
        case "bn.detectDevices": {
            deviceList.detectDevices();
            return;
        }
        case "bn.installAndRun": {
            setConsoleLogger();
            let device = deviceList.deviceList.getSelected();
            if (device != null && device.status != dev.DeviceStatus.Online)
                device = null;
            if (device != null) {
                device.updateByProject(bb.getProject());
                return device.installDebug().then(() => device.justRunDebug());
            } else {
                androidPlatform.instance.updateByProject(bb.getProject());
                return androidPlatform.instance.compileCode(false).then(() => { });
            }
        }
        case "bn.justRunDebug": {
            setConsoleLogger();
            let device = deviceList.deviceList.getSelected();
            if (device != null && device.status != dev.DeviceStatus.Online)
                device = null;
            if (device != null) {
                device.updateByProject(bb.getProject());
                return device.justRunDebug();
            }
            return;
        }
        case "bn.buildRelease": {
            setConsoleLogger();
            androidPlatform.instance.updateByProject(bb.getProject());
            return androidPlatform.instance.compileCode(true);
        }
    }
}

export function registerCommands(c: commander.ICommand, _bb: any, consumeCommand: Function) {
    c
        .command("bobriln")
        .alias("n")
        .description("Bobriln commands")
        .option("-i, --init", "Create Bobril Native application in current directory")
        .action((c) => {
            consumeCommand();
            if ("init" in c) {
                initCommand();
                return;
            }
        });
    bb.invalidateActions();
}
