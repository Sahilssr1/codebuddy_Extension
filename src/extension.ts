import * as vscode from 'vscode';
import { CharacterController } from './character/CharacterController';
import { CodeBuddyViewProvider } from './webview/CodeBuddyViewProvider';
import { TerminalManager } from './terminal/TerminalManager';
import { registerCommands } from './commands/commands';
import { Configuration } from './config/Configuration';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeBuddy is now active!');

    // Initialize core components
    const characterController = new CharacterController();
    
    // Register Webview Provider
    const provider = new CodeBuddyViewProvider(context.extensionUri, characterController);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CodeBuddyViewProvider.viewType, provider)
    );

    // Initialize Terminal Manager for Shell Integration
    if (Configuration.enabled) {
        const terminalManager = new TerminalManager(characterController);
        context.subscriptions.push(terminalManager);
    }

    // Register Commands
    registerCommands(context, characterController);

    // Listen to configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('codeBuddy.enabled')) {
            if (!Configuration.enabled) {
                characterController.reset();
            } else {
                // Could re-initialize TerminalManager if needed, but for simplicity, 
                // in this MVP we just rely on the existing one or require reload if toggled heavily.
                // Or we can let it run and check config inside the tracker.
            }
        }
    }));
}

export function deactivate() {}
