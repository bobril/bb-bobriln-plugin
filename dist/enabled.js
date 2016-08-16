"use strict";
const bb = require('bobril-build');
let lastCheck = -1;
let lastEnabled = false;
function isEnabled() {
    let proj = bb.getProject();
    if (proj == null)
        return false;
    if (lastCheck !== proj.projectJsonTime) {
        lastCheck = proj.projectJsonTime;
        let newEnabled = proj.dependencies != null && proj.dependencies.indexOf("bobriln") >= 0;
        if (lastEnabled !== newEnabled) {
            lastEnabled = newEnabled;
            bb.invalidateActions();
        }
    }
    return lastEnabled;
}
exports.isEnabled = isEnabled;
//# sourceMappingURL=enabled.js.map