"use strict";
const pathPlatformDependent = require("path");
const fs = require("fs-extra");
const sizeOf = require("fast-image-size");
const path = pathPlatformDependent.posix; // This works everythere, just use forward slashes
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
const extractRx = /(.+)(?:@(\d+(?:\.?\d+)?)x)?\.(\w+)/;
function assetHandlerImage(name, shortenFileNameAddPath, project) {
    let dir = path.join(project.dir, path.dirname(name));
    let files = fs.readdirSync(dir);
    let mnameext = extractRx.exec(path.basename(name));
    let matcher = new RegExp(escapeRegExp(mnameext[1]) + "(?:@(\\d+(?:\\.?\\d+)?)x)?\\." + escapeRegExp(mnameext[3]), "i");
    let width = 0;
    let height = 0;
    let was1 = false;
    let maxden = 0;
    let densFiles = [];
    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        let m = matcher.exec(f);
        if (m) {
            let ff = path.join(dir, f);
            let s = sizeOf(ff);
            if (!(s.width && s.height))
                continue;
            let density = 1;
            if (m[1]) {
                density = parseFloat(m[1]);
                if (density > maxden && !was1) {
                    maxden = density;
                    width = s.width / density;
                    height = s.height / density;
                }
            }
            else {
                width = s.width;
                height = s.height;
                was1 = true;
            }
            densFiles.push([density, path.relative(project.dir, ff)]);
        }
    }
    if (densFiles.length === 0) {
        return { _BBError: "Cannot find asset " + name };
    }
    densFiles.sort((a, b) => a[0] - b[0]);
    let result = [width, height];
    for (let i = 0; i < densFiles.length; i++) {
        let f = densFiles[i][1];
        let s = shortenFileNameAddPath(f);
        project.depAssetFiles[f] = s;
        result.push(densFiles[i][0], s);
    }
    return result;
}
exports.assetHandlerImage = assetHandlerImage;
//# sourceMappingURL=assetHandlerImage.js.map