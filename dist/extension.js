/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const CharacterController_1 = __webpack_require__(2);
const CodeBuddyViewProvider_1 = __webpack_require__(4);
const TerminalManager_1 = __webpack_require__(5);
const commands_1 = __webpack_require__(11);
const Configuration_1 = __webpack_require__(12);
function activate(context) {
    console.log('CodeBuddy is now active!');
    // Initialize core components
    const characterController = new CharacterController_1.CharacterController();
    // Register Webview Provider
    const provider = new CodeBuddyViewProvider_1.CodeBuddyViewProvider(context.extensionUri, characterController);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(CodeBuddyViewProvider_1.CodeBuddyViewProvider.viewType, provider));
    // Initialize Terminal Manager for Shell Integration
    if (Configuration_1.Configuration.enabled) {
        const terminalManager = new TerminalManager_1.TerminalManager(characterController);
        context.subscriptions.push(terminalManager);
    }
    // Register Commands
    (0, commands_1.registerCommands)(context, characterController);
    // Listen to configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('codeBuddy.enabled')) {
            if (!Configuration_1.Configuration.enabled) {
                characterController.reset();
            }
            else {
                // Could re-initialize TerminalManager if needed, but for simplicity, 
                // in this MVP we just rely on the existing one or require reload if toggled heavily.
                // Or we can let it run and check config inside the tracker.
            }
        }
    }));
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterController = void 0;
const vscode = __importStar(__webpack_require__(1));
const CharacterState_1 = __webpack_require__(3);
class CharacterController {
    constructor() {
        this.currentState = CharacterState_1.CharacterState.IDLE;
        this.currentMessage = "Hi! I'm CodeBuddy 👋";
        this.listeners = [];
        this.clearTimer = null;
    }
    getState() {
        return this.currentState;
    }
    getMessage() {
        return this.currentMessage;
    }
    setState(state, message, command) {
        this.currentState = state;
        this.currentMessage = message;
        this.notifyListeners(command);
        const isVisible = state !== CharacterState_1.CharacterState.IDLE;
        vscode.commands.executeCommand('setContext', 'codeBuddyVisible', isVisible);
        if (isVisible) {
            vscode.commands.executeCommand('codebuddy.sidebar.focus');
        }
        // Auto-reset to IDLE after some time if it's a transient state
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
            this.clearTimer = null;
        }
        if (state === CharacterState_1.CharacterState.SUCCESS || state === CharacterState_1.CharacterState.TEST_SUCCESS) {
            // Auto hide/reset after 3 seconds only for successful workflows
            this.clearTimer = setTimeout(() => {
                this.reset();
            }, 3000);
        }
    }
    reset() {
        this.setState(CharacterState_1.CharacterState.IDLE, "Ready for your next command.");
    }
    onStateChange(listener) {
        this.listeners.push(listener);
    }
    notifyListeners(command) {
        for (const listener of this.listeners) {
            listener(this.currentState, this.currentMessage, command);
        }
    }
}
exports.CharacterController = CharacterController;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterState = void 0;
var CharacterState;
(function (CharacterState) {
    CharacterState["IDLE"] = "idle";
    CharacterState["RUNNING"] = "running";
    CharacterState["SUCCESS"] = "success";
    CharacterState["ERROR"] = "error";
    CharacterState["WARNING"] = "warning";
    CharacterState["TESTING"] = "testing";
    CharacterState["TEST_SUCCESS"] = "test-success";
    CharacterState["TEST_FAILURE"] = "test-failure";
})(CharacterState || (exports.CharacterState = CharacterState = {}));


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CodeBuddyViewProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
class CodeBuddyViewProvider {
    constructor(_extensionUri, _characterController) {
        this._extensionUri = _extensionUri;
        this._characterController = _characterController;
    }
    resolveWebviewView(webviewView, context, _token) {
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
    updateState(state, message, command) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'characterState',
                state,
                message,
                command
            });
        }
    }
    _getHtmlForWebview(webview) {
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
exports.CodeBuddyViewProvider = CodeBuddyViewProvider;
CodeBuddyViewProvider.viewType = 'codebuddy.sidebar';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TerminalManager = void 0;
const ShellIntegration_1 = __webpack_require__(6);
class TerminalManager {
    constructor(characterController) {
        this.characterController = characterController;
        this.shellIntegration = new ShellIntegration_1.ShellIntegration(characterController);
    }
    dispose() {
        this.shellIntegration.dispose();
    }
}
exports.TerminalManager = TerminalManager;


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShellIntegration = void 0;
const vscode = __importStar(__webpack_require__(1));
const CommandTracker_1 = __webpack_require__(7);
class ShellIntegration {
    constructor(characterController) {
        this.characterController = characterController;
        this.disposables = [];
        this.activeTrackers = new Map();
        this.setup();
    }
    setup() {
        if (vscode.window.onDidStartTerminalShellExecution) {
            this.disposables.push(vscode.window.onDidStartTerminalShellExecution(event => {
                this.onStart(event.terminal, event.execution);
            }));
        }
        if (vscode.window.onDidEndTerminalShellExecution) {
            this.disposables.push(vscode.window.onDidEndTerminalShellExecution(event => {
                this.onEnd(event.terminal, event.execution, event.exitCode);
            }));
        }
    }
    async onStart(terminal, execution) {
        const commandLine = execution.commandLine.value;
        if (!commandLine.trim())
            return;
        const tracker = new CommandTracker_1.CommandTracker(terminal, commandLine, this.characterController);
        this.activeTrackers.set(execution, tracker);
        try {
            // Read stream of output.
            // TerminalShellExecution.read() returns an AsyncIterable<string>
            const stream = execution.read();
            for await (const chunk of stream) {
                tracker.appendOutput(chunk);
            }
        }
        catch (e) {
            // Ignore stream read errors, they can happen if terminal is closed
        }
    }
    onEnd(terminal, execution, exitCode) {
        const tracker = this.activeTrackers.get(execution);
        if (tracker) {
            tracker.finish(exitCode);
            this.activeTrackers.delete(execution);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.activeTrackers.clear();
    }
}
exports.ShellIntegration = ShellIntegration;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandTracker = void 0;
const CharacterState_1 = __webpack_require__(3);
const ErrorParser_1 = __webpack_require__(8);
const TestParser_1 = __webpack_require__(9);
const SuccessParser_1 = __webpack_require__(10);
class CommandTracker {
    constructor(terminal, commandLine, characterController) {
        this.terminal = terminal;
        this.commandLine = commandLine;
        this.characterController = characterController;
        this.outputData = '';
        // Set running state immediately when tracker is created
        this.characterController.setState(CharacterState_1.CharacterState.RUNNING, 'Running command...', this.commandLine);
    }
    appendOutput(data) {
        this.outputData += data;
    }
    finish(exitCode) {
        // Clean up output a bit (remove ANSI escape codes for easier parsing)
        const cleanOutput = this.outputData.replace(/\x1b\[[0-9;]*m/g, '').trim();
        // Check if it's a test runner first
        const testResult = TestParser_1.TestParser.parse(cleanOutput);
        if (testResult) {
            if (testResult.failed > 0) {
                this.characterController.setState(CharacterState_1.CharacterState.TEST_FAILURE, `Some tests failed 😭\n(${testResult.passed} passed, ${testResult.failed} failed)`, this.commandLine);
            }
            else {
                this.characterController.setState(CharacterState_1.CharacterState.TEST_SUCCESS, `All tests passed! 🎉\n(${testResult.passed} total)`, this.commandLine);
            }
            return;
        }
        // Handle normal exit codes if available
        if (exitCode !== undefined) {
            if (exitCode === 0) {
                // Double check for explicit warnings
                if (cleanOutput.toLowerCase().includes('warning')) {
                    this.characterController.setState(CharacterState_1.CharacterState.WARNING, 'It works, but there are some warnings.', this.commandLine);
                }
                else {
                    this.characterController.setState(CharacterState_1.CharacterState.SUCCESS, 'Nice! Your code worked! 🎉', this.commandLine);
                }
            }
            else {
                // Exit code non-zero, let's try to parse the error
                const parsedError = ErrorParser_1.ErrorParser.parse(cleanOutput);
                if (parsedError) {
                    let msg = `Uh oh... there is an error 😰\n${parsedError.type}: ${parsedError.message}`;
                    if (parsedError.location) {
                        msg += `\nLocation: ${parsedError.location}`;
                    }
                    this.characterController.setState(CharacterState_1.CharacterState.ERROR, msg, this.commandLine);
                }
                else {
                    this.characterController.setState(CharacterState_1.CharacterState.ERROR, `Command failed with exit code ${exitCode} 😰`, this.commandLine);
                }
            }
        }
        else {
            // No exit code (fallback if shell integration is wonky)
            // Use parsers on the output to guess success/failure
            const parsedError = ErrorParser_1.ErrorParser.parse(cleanOutput);
            if (parsedError) {
                this.characterController.setState(CharacterState_1.CharacterState.ERROR, `Uh oh... there is an error 😰\n${parsedError.type}`, this.commandLine);
            }
            else if (SuccessParser_1.SuccessParser.isSuccess(cleanOutput)) {
                this.characterController.setState(CharacterState_1.CharacterState.SUCCESS, 'Nice! Your code worked! 🎉', this.commandLine);
            }
            else {
                // Don't know what happened, just reset
                this.characterController.setState(CharacterState_1.CharacterState.IDLE, 'Done executing.', this.commandLine);
            }
        }
    }
}
exports.CommandTracker = CommandTracker;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorParser = void 0;
class ErrorParser {
    static parse(output) {
        if (!output)
            return null;
        // 1. JS/TS/Node TypeError, ReferenceError, etc.
        const jsErrorMatch = output.match(/([a-zA-Z0-9]+Error):\s*(.+)(\n\s*at\s+.+\((.+:\d+:\d+)\))?/);
        if (jsErrorMatch) {
            return {
                type: jsErrorMatch[1],
                message: jsErrorMatch[2].trim(),
                location: jsErrorMatch[4]
            };
        }
        // 2. Python Traceback
        if (output.includes('Traceback (most recent call last):')) {
            const lines = output.split('\n');
            let location = '';
            let typeAndMessage = '';
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line && !line.startsWith('File') && !typeAndMessage) {
                    typeAndMessage = line;
                }
                else if (line.startsWith('File "')) {
                    const match = line.match(/File "([^"]+)", line (\d+)/);
                    if (match)
                        location = `${match[1]}:${match[2]}`;
                    break;
                }
            }
            if (typeAndMessage) {
                const parts = typeAndMessage.split(':');
                return {
                    type: parts[0] ? parts[0].trim() : 'Python Error',
                    message: parts.slice(1).join(':').trim() || typeAndMessage,
                    location
                };
            }
        }
        // 3. C# / .NET error
        const csharpMatch = output.match(/([A-Z]:\\[^\s]+\.cs)\((\d+,\d+)\):\s+error\s+([A-Z0-9]+):\s+(.+)\s+\[/);
        if (csharpMatch) {
            return {
                type: `C# Error (${csharpMatch[3]})`,
                message: csharpMatch[4].trim(),
                location: `${csharpMatch[1]}:${csharpMatch[2]}`
            };
        }
        // 4. Generic "Error:" / "FAILED" matching
        const genericMatch = output.match(/(?:error|Error|ERROR):\s*(.+)/);
        if (genericMatch) {
            return {
                type: 'Error',
                message: genericMatch[1].trim()
            };
        }
        const failedMatch = output.match(/(?:failed|Failed|FAILED):\s*(.+)/);
        if (failedMatch && !output.includes('test')) {
            return {
                type: 'Failure',
                message: failedMatch[1].trim()
            };
        }
        return null;
    }
}
exports.ErrorParser = ErrorParser;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestParser = void 0;
class TestParser {
    static parse(output) {
        if (!output)
            return null;
        // 1. Jest / Vitest
        // Tests:       1 failed, 2 passed, 3 total
        const jestMatch = output.match(/Tests:\s*(?:(\d+)\s*failed,?\s*)?(?:(\d+)\s*passed,?\s*)?(\d+)\s*total/);
        if (jestMatch) {
            const failed = parseInt(jestMatch[1] || '0', 10);
            const passed = parseInt(jestMatch[2] || '0', 10);
            return { passed, failed };
        }
        // 2. Python pytest
        // ========================= 1 failed, 2 passed in 0.12s =========================
        const pytestMatch = output.match(/={2,}\s*(?:(\d+)\s*failed,?\s*)?(?:(\d+)\s*passed,?\s*)?in/);
        if (pytestMatch) {
            const failed = parseInt(pytestMatch[1] || '0', 10);
            const passed = parseInt(pytestMatch[2] || '0', 10);
            return { passed, failed };
        }
        // 3. .NET test
        // Passed!  - Failed:     0, Passed:    12, Skipped:     0, Total:    12
        // Failed!  - Failed:     1, Passed:    11, Skipped:     0, Total:    12
        const dotnetMatch = output.match(/(?:Passed!|Failed!)\s*-\s*Failed:\s*(\d+),\s*Passed:\s*(\d+)/);
        if (dotnetMatch) {
            const failed = parseInt(dotnetMatch[1], 10);
            const passed = parseInt(dotnetMatch[2], 10);
            return { passed, failed };
        }
        return null;
    }
}
exports.TestParser = TestParser;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuccessParser = void 0;
class SuccessParser {
    static isSuccess(output) {
        if (!output)
            return false;
        const lowerOutput = output.toLowerCase();
        // Common success phrases
        const successPhrases = [
            'build succeeded',
            'build completed successfully',
            'compiled successfully',
            'successfully compiled',
            'success!',
            'webpack compiled successfully'
        ];
        return successPhrases.some(phrase => lowerOutput.includes(phrase));
    }
}
exports.SuccessParser = SuccessParser;


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerCommands = registerCommands;
const vscode = __importStar(__webpack_require__(1));
const CharacterState_1 = __webpack_require__(3);
const Configuration_1 = __webpack_require__(12);
function registerCommands(context, characterController) {
    context.subscriptions.push(vscode.commands.registerCommand('codebuddy.open', () => {
        vscode.commands.executeCommand('codebuddy.sidebar.focus');
    }), vscode.commands.registerCommand('codebuddy.reset', () => {
        characterController.reset();
    }), vscode.commands.registerCommand('codebuddy.enable', async () => {
        await Configuration_1.Configuration.setEnabled(true);
        characterController.setState(CharacterState_1.CharacterState.IDLE, 'CodeBuddy enabled! 👋');
    }), vscode.commands.registerCommand('codebuddy.disable', async () => {
        await Configuration_1.Configuration.setEnabled(false);
        characterController.setState(CharacterState_1.CharacterState.IDLE, 'CodeBuddy disabled. 😴');
    }), vscode.commands.registerCommand('codebuddy.testReaction', async () => {
        // Cycle through all states for testing
        const states = [
            { s: CharacterState_1.CharacterState.RUNNING, m: "Let's see what happens... 🤔", c: "npm run build" },
            { s: CharacterState_1.CharacterState.SUCCESS, m: "Nice! Your code worked! 🎉", c: "npm run build" },
            { s: CharacterState_1.CharacterState.ERROR, m: "Uh oh... there is an error 😰\nTypeError: Cannot read properties of undefined", c: "node app.js" },
            { s: CharacterState_1.CharacterState.WARNING, m: "It works, but there are some warnings.", c: "npm run lint" },
            { s: CharacterState_1.CharacterState.TESTING, m: "Running tests... 🧐", c: "npm test" },
            { s: CharacterState_1.CharacterState.TEST_SUCCESS, m: "All tests passed! 🎉\n(10 passed)", c: "npm test" },
            { s: CharacterState_1.CharacterState.TEST_FAILURE, m: "Some tests failed 😭\n(8 passed, 2 failed)", c: "npm test" }
        ];
        vscode.commands.executeCommand('codebuddy.sidebar.focus');
        let delay = 0;
        for (const state of states) {
            setTimeout(() => {
                characterController.setState(state.s, state.m, state.c);
            }, delay);
            delay += 3000;
        }
        setTimeout(() => {
            characterController.reset();
        }, delay + 3000);
    }));
}


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Configuration = void 0;
const vscode = __importStar(__webpack_require__(1));
class Configuration {
    static get enabled() {
        return vscode.workspace.getConfiguration('codeBuddy').get('enabled', true);
    }
    static get character() {
        return vscode.workspace.getConfiguration('codeBuddy').get('character', 'robot');
    }
    static get showMessages() {
        return vscode.workspace.getConfiguration('codeBuddy').get('showMessages', true);
    }
    static async setEnabled(enabled) {
        await vscode.workspace.getConfiguration('codeBuddy').update('enabled', enabled, vscode.ConfigurationTarget.Global);
    }
}
exports.Configuration = Configuration;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(0);
/******/ 	const __webpack_export_target__ = exports;
/******/ 	for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map