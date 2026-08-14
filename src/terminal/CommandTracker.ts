import * as vscode from 'vscode';
import { CharacterState } from '../character/CharacterState';
import { CharacterController } from '../character/CharacterController';
import { ErrorParser } from '../parser/ErrorParser';
import { TestParser } from '../parser/TestParser';
import { SuccessParser } from '../parser/SuccessParser';

export class CommandTracker {
    private outputData: string = '';
    
    constructor(
        public readonly terminal: vscode.Terminal,
        public readonly commandLine: string,
        private characterController: CharacterController
    ) {
        // Set running state immediately when tracker is created
        this.characterController.setState(CharacterState.RUNNING, 'Running command...', this.commandLine);
    }

    public appendOutput(data: string) {
        this.outputData += data;
    }

    public finish(exitCode: number | undefined) {
        // Clean up output a bit (remove ANSI escape codes for easier parsing)
        const cleanOutput = this.outputData.replace(/\x1b\[[0-9;]*m/g, '').trim();

        // Check if it's a test runner first
        const testResult = TestParser.parse(cleanOutput);
        if (testResult) {
            if (testResult.failed > 0) {
                this.characterController.setState(
                    CharacterState.TEST_FAILURE, 
                    `Some tests failed 😭\n(${testResult.passed} passed, ${testResult.failed} failed)`,
                    this.commandLine
                );
            } else {
                this.characterController.setState(
                    CharacterState.TEST_SUCCESS, 
                    `All tests passed! 🎉\n(${testResult.passed} total)`,
                    this.commandLine
                );
            }
            return;
        }

        // Handle normal exit codes if available
        if (exitCode !== undefined) {
            if (exitCode === 0) {
                // Double check for explicit warnings
                if (cleanOutput.toLowerCase().includes('warning')) {
                    this.characterController.setState(CharacterState.WARNING, 'It works, but there are some warnings.', this.commandLine);
                } else {
                    this.characterController.setState(CharacterState.SUCCESS, 'Nice! Your code worked! 🎉', this.commandLine);
                }
            } else {
                // Exit code non-zero, let's try to parse the error
                const parsedError = ErrorParser.parse(cleanOutput);
                if (parsedError) {
                    let msg = `Uh oh... there is an error 😰\n${parsedError.type}: ${parsedError.message}`;
                    if (parsedError.location) {
                        msg += `\nLocation: ${parsedError.location}`;
                    }
                    this.characterController.setState(CharacterState.ERROR, msg, this.commandLine);
                } else {
                    this.characterController.setState(CharacterState.ERROR, `Command failed with exit code ${exitCode} 😰`, this.commandLine);
                }
            }
        } else {
            // No exit code (fallback if shell integration is wonky)
            // Use parsers on the output to guess success/failure
            const parsedError = ErrorParser.parse(cleanOutput);
            if (parsedError) {
                this.characterController.setState(CharacterState.ERROR, `Uh oh... there is an error 😰\n${parsedError.type}`, this.commandLine);
            } else if (SuccessParser.isSuccess(cleanOutput)) {
                this.characterController.setState(CharacterState.SUCCESS, 'Nice! Your code worked! 🎉', this.commandLine);
            } else {
                // Don't know what happened, just reset
                this.characterController.setState(CharacterState.IDLE, 'Done executing.', this.commandLine);
            }
        }
    }
}
