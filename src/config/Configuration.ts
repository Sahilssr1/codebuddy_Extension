import * as vscode from 'vscode';

export class Configuration {
    public static get enabled(): boolean {
        return vscode.workspace.getConfiguration('codeBuddy').get<boolean>('enabled', true);
    }

    public static get character(): string {
        return vscode.workspace.getConfiguration('codeBuddy').get<string>('character', 'robot');
    }

    public static get showMessages(): boolean {
        return vscode.workspace.getConfiguration('codeBuddy').get<boolean>('showMessages', true);
    }

    public static async setEnabled(enabled: boolean): Promise<void> {
        await vscode.workspace.getConfiguration('codeBuddy').update('enabled', enabled, vscode.ConfigurationTarget.Global);
    }
}
