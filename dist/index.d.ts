import * as bb from 'bobril-build';
export declare function afterInteractiveCompile(): void;
export declare function registerActions(actions: bb.IActionsRegistry): void;
export declare function invokeAction(id: string): Promise<void>;
export declare function registerCommands(c: commander.ICommand, _bb: any, consumeCommand: Function): void;
