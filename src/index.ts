import * as commander from 'commander';
import * as bb from 'bobril-build';
import * as androidPlatform from './androidPlatform';
import { isEnabled } from './enabled';
import * as dev from "./device";
import * as deviceList from './deviceList';

let first = true;

export function afterInteractiveCompile() {
    if (isEnabled() && first) {
        first = false;
        deviceList.detectDevices();
    }
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
    actions.registerCommand("bn.prepareCode.android", "Prepare Android Code");
    actions.registerCommand("bn.detectDevices", "Refresh devices");
    actions.registerCombo("Device", device2actionId(deviceList.deviceList.getSelected()), deviceList.deviceList.getList().map((d) => actions.option(device2actionId(d), d.name)));
    actions.registerCommand("bn.installAndRun", deviceList.deviceList.getSelected() != null ? "Run" : "Assemble");
}

function setConsoleLogger() {
    deviceList.deviceList.getList().forEach((d)=>d.logCallback((t)=>console.log(t)));
    androidPlatform.instance.logCallback((t)=>console.log(t));
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
                return device.install(false, true);
            } else {
                androidPlatform.instance.updateByProject(bb.getProject());
                return androidPlatform.instance.compileCode(false).then(()=>{});
            }
        }
    }
}

export function registerCommands(c: commander.ICommand, _bb: any, consumeCommand: Function) {
    c
        .command("bobriln")
        .alias("n")
        .description("Bobriln commands")
        .option("-i, --init <name>", "Create Bobril Native application in current directory")
        //.option("-d, --deploy", "Deploy result to device/emulator")
        //.option("-b, --build", "Build for deployment to device")
        .action((c) => {
            consumeCommand();
            console.log("Running native");
        });
    bb.invalidateActions();
}
