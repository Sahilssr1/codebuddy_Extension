import * as vscode from 'vscode';
import { CharacterController } from '../character/CharacterController';
import { ShellIntegration } from './ShellIntegration';

export class TerminalManager implements vscode.Disposable {
    private shellIntegration: ShellIntegration;

    constructor(private characterController: CharacterController) {
        this.shellIntegration = new ShellIntegration(characterController);
    }

    public dispose() {
        this.shellIntegration.dispose();
    }
}
