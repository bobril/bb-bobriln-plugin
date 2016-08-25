"use strict";
const fs = require("fs-extra");
const spawn_1 = require("./spawn");
function initCommand() {
    fs.outputFileSync("index.ts", `import * as b from 'bobriln';

let prevTime = b.now();
let prevFrame = 0;
let fps = 0;
b.init(() => {
    b.invalidate();
    let nowTime = b.now();
    if (prevTime+1000<nowTime) {
        fps = (b.frame()-prevFrame)*1000/(nowTime-prevTime);
        prevTime = nowTime;
        prevFrame = b.frame();
    }
    return b.style({
        tag: "View", children: [
            b.style({ tag: "Text", children: "Fps: " + fps.toFixed(1) + " Frame: " + b.frame() }, { flex: 1, background: "powderblue" }),
            b.style({ tag: "Text", children: "Quickly shake device to see debug menu" }, { flex: 2, background: "skyblue" }),
            b.style({ tag: "Text", children: "Bobril Native " + b.platformName() }, { flex: 3, background: "steelblue" }),
        ]
    }, { padding: 5, background: "skyblue" });
});
`);
    fs.outputJsonSync("package.json", {
        "name": "test",
        "version": "0.0.1",
        "dependencies": {
            "bobriln": "*"
        },
        "private": true,
        "description": "",
        "main": "index.js",
        "scripts": {},
        "bobril": {
            "title": "Test",
            "androidPackage": "com.bobril.bobriln"
        },
        "author": "",
        "license": "ISC"
    });
    return spawn_1.spawnAsync((line) => console.log(line), "npm", ["install"], undefined, true).then(() => { });
}
exports.initCommand = initCommand;
//# sourceMappingURL=initCommand.js.map