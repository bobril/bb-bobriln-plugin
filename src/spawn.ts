import * as child_process from "child_process";
import * as readline from "readline";

export function spawnAsync(onLine: (text: string) => void, command: string, args?: string[], cwd?: string, shell?: boolean): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        var proc = child_process.spawn(command, args, { cwd, shell });
        readline.createInterface({
            input: proc.stdout,
            terminal: false
        }).on('line', function (line: string) {
            if (line == null || line.length === 0) return;
            onLine(line);
        });
        readline.createInterface({
            input: proc.stderr,
            terminal: false
        }).on('line', function (line) {
            if (line == null || line.length === 0) return;
            onLine(line);
        });
        proc.on("error", (err) => {
            console.log("spawnAsync error", err);
            reject(err);
        });
        proc.on("close", (code) => {
            resolve(code);
        })
    });
}
