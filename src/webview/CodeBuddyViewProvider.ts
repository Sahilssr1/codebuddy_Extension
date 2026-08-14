import * as vscode from 'vscode';
import { CharacterController } from '../character/CharacterController';
import { CharacterState } from '../character/CharacterState';

export class CodeBuddyViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codebuddy.sidebar';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _characterController: CharacterController
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'reset':
                    this._characterController.reset();
                    break;
                case 'settings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'codeBuddy');
                    break;
            }
        });

        // Sync initial state
        this.updateState(this._characterController.getState(), this._characterController.getMessage());

        // Listen to character controller state changes
        this._characterController.onStateChange((state, message, command) => {
            this.updateState(state, message, command);
        });
    }

    public updateState(state: CharacterState, message: string, command?: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'characterState',
                state,
                message,
                command
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles', 'main.css'));
        const robotUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'characters', 'robot.svg'));
        const happyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'characters', 'happy.gif'));
        const sadUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'characters', 'sad.gif'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                    Use a content security policy to only allow loading local resources,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>CodeBuddy</title>
            </head>
            <body>
                <div class="container slide-in-right">
                    <div class="character-container" id="character-container" data-state="idle" data-happy-src="${happyUri}" data-sad-src="${sadUri}" data-default-src="${robotUri}">
                        <img src="${robotUri}" alt="CodeBuddy" class="character-img" id="character-img" />
                    </div>
                    
                    <div class="status-panel">
                        <div class="command-text" id="command-text">Ready</div>
                        <div class="message-text" id="message-text">Hi! I'm CodeBuddy 👋</div>
                    </div>

                    <div class="controls">
                        <button id="btn-reset">Reset</button>
                        <button id="btn-settings">Settings</button>
                    </div>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
