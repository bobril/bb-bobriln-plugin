import * as bb from 'bobril-build';

let lastCheck: number = -1;
let lastEnabled: boolean = false;

export function isEnabled() {
    let proj = bb.getProject();
    if (proj == null) return false;
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