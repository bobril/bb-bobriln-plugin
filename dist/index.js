"use strict";
const bb = require('bobril-build');
const androidPlatform = require('./androidPlatform');
const enabled_1 = require('./enabled');
const dev = require("./device");
const deviceList = require('./deviceList');
const initCommand_1 = require('./initCommand');
let first = true;
function afterInteractiveCompile() {
    if (enabled_1.isEnabled() && first) {
        first = false;
        deviceList.detectDevices();
    }
}
exports.afterInteractiveCompile = afterInteractiveCompile;
function updateWatchPaths(paths) {
    paths.push("!/android/**");
}
exports.updateWatchPaths = updateWatchPaths;
function device2actionId(device) {
    if (device == null)
        return null;
    return "bn.selectDevice." + device.platform.platform + "." + device.id;
}
function actionId2device(actionId) {
    if (!actionId.startsWith("bn.selectDevice."))
        return null;
    return deviceList.deviceList.getList().find((d) => device2actionId(d) === actionId);
}
function registerActions(actions) {
    if (!enabled_1.isEnabled())
        return;
    actions.registerCommand("bn.prepareCode.android", "Repave Android Code");
    actions.registerCommand("bn.detectDevices", "Refresh devices");
    actions.registerCombo("Device", device2actionId(deviceList.deviceList.getSelected()), deviceList.deviceList.getList().map((d) => actions.option(device2actionId(d), d.name)));
    actions.registerCommand("bn.installAndRun", deviceList.deviceList.getSelected() != null ? "Run" : "Assemble");
    if (deviceList.deviceList.getSelected() != null) {
        actions.registerCommand("bn.justRunDebug", "Just Run");
    }
    actions.registerCommand("bn.buildRelease", "Build Release");
}
exports.registerActions = registerActions;
function setConsoleLogger() {
    deviceList.deviceList.getList().forEach((d) => d.logCallback((t) => console.log(t)));
    androidPlatform.instance.logCallback((t) => console.log(t));
}
function invokeAction(id) {
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
            }
            else {
                androidPlatform.instance.updateByProject(bb.getProject());
                return androidPlatform.instance.compileCode(false).then(() => { });
            }
        }
        case "bn.justRunDebug": {
            let device = deviceList.deviceList.getSelected();
            if (device != null && device.status != dev.DeviceStatus.Online)
                device = null;
            if (device != null) {
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
exports.invokeAction = invokeAction;
function registerCommands(c, _bb, consumeCommand) {
    c
        .command("bobriln")
        .alias("n")
        .description("Bobriln commands")
        .option("-i, --init", "Create Bobril Native application in current directory")
        .action((c) => {
        consumeCommand();
        if ("init" in c) {
            initCommand_1.initCommand();
            return;
        }
    });
    bb.invalidateActions();
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=index.js.map