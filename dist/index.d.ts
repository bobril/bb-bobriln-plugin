import * as bb from 'bobril-build';
export declare function afterInteractiveCompile(): void;
export declare function handleAsset(name: string, shortenFileNameAddPath: (fn: string) => string, project: bb.IProject): any;
export declare function updateWatchPaths(paths: string[]): void;
export declare function registerActions(actions: bb.IActionsRegistry): void;
export declare function invokeAction(id: string): Promise<void>;
export declare function registerCommands(c: commander.ICommand, _bb: any, consumeCommand: Function): void;
