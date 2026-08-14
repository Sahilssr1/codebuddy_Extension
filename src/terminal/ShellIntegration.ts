import * as vscode from 'vscode';
import { CharacterController } from '../character/CharacterController';
import { CommandTracker } from './CommandTracker';

export class ShellIntegration implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    private activeTrackers: Map<vscode.TerminalShellExecution, CommandTracker> = new Map();

    constructor(private characterController: CharacterController) {
        this.setup();
    }

    private setup() {
        if (vscode.window.onDidStartTerminalShellExecution) {
            this.disposables.push(
                vscode.window.onDidStartTerminalShellExecution(event => {
                    this.onStart(event.terminal, event.execution);
                })
            );
        }

        if (vscode.window.onDidEndTerminalShellExecution) {
            this.disposables.push(
                vscode.window.onDidEndTerminalShellExecution(event => {
                    this.onEnd(event.terminal, event.execution, event.exitCode);
                })
            );
        }
    }

    private async onStart(terminal: vscode.Terminal, execution: vscode.TerminalShellExecution) {
        const commandLine = execution.commandLine.value;
        if (!commandLine.trim()) return;

        const tracker = new CommandTracker(terminal, commandLine, this.characterController);
        this.activeTrackers.set(execution, tracker);

        try {
            // Read stream of output.
            // TerminalShellExecution.read() returns an AsyncIterable<string>
            const stream = execution.read();
            for await (const chunk of stream) {
                tracker.appendOutput(chunk);
            }
        } catch (e) {
            // Ignore stream read errors, they can happen if terminal is closed
        }
    }

    private onEnd(terminal: vscode.Terminal, execution: vscode.TerminalShellExecution, exitCode: number | undefined) {
        const tracker = this.activeTrackers.get(execution);
        if (tracker) {
            tracker.finish(exitCode);
            this.activeTrackers.delete(execution);
        }
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        this.activeTrackers.clear();
    }
}
