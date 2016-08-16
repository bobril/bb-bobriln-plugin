"use strict";
const child_process = require("child_process");
const readline = require("readline");
function spawnAsync(onLine, command, args, cwd, shell) {
    return new Promise((resolve, reject) => {
        var proc = child_process.spawn(command, args, { cwd: cwd, shell: shell });
        readline.createInterface({
            input: proc.stdout,
            terminal: false
        }).on('line', function (line) {
            if (line == null || line.length === 0)
                return;
            onLine(line);
        });
        readline.createInterface({
            input: proc.stderr,
            terminal: false
        }).on('line', function (line) {
            if (line == null || line.length === 0)
                return;
            onLine(line);
        });
        proc.on("error", (err) => {
            console.log("spawnAsync error", err);
            reject(err);
        });
        proc.on("close", (code) => {
            resolve(code);
        });
    });
}
exports.spawnAsync = spawnAsync;
//# sourceMappingURL=spawn.js.map