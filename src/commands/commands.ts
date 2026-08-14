import * as vscode from 'vscode';
import { CharacterController } from '../character/CharacterController';
import { CharacterState } from '../character/CharacterState';
import { Configuration } from '../config/Configuration';

export function registerCommands(context: vscode.ExtensionContext, characterController: CharacterController) {
    context.subscriptions.push(
        vscode.commands.registerCommand('codebuddy.open', () => {
            vscode.commands.executeCommand('codebuddy.sidebar.focus');
        }),
        
        vscode.commands.registerCommand('codebuddy.reset', () => {
            characterController.reset();
        }),

        vscode.commands.registerCommand('codebuddy.enable', async () => {
            await Configuration.setEnabled(true);
            characterController.setState(CharacterState.IDLE, 'CodeBuddy enabled! 👋');
        }),

        vscode.commands.registerCommand('codebuddy.disable', async () => {
            await Configuration.setEnabled(false);
            characterController.setState(CharacterState.IDLE, 'CodeBuddy disabled. 😴');
        }),

        vscode.commands.registerCommand('codebuddy.testReaction', async () => {
            // Cycle through all states for testing
            const states = [
                { s: CharacterState.RUNNING, m: "Let's see what happens... 🤔", c: "npm run build" },
                { s: CharacterState.SUCCESS, m: "Nice! Your code worked! 🎉", c: "npm run build" },
                { s: CharacterState.ERROR, m: "Uh oh... there is an error 😰\nTypeError: Cannot read properties of undefined", c: "node app.js" },
                { s: CharacterState.WARNING, m: "It works, but there are some warnings.", c: "npm run lint" },
                { s: CharacterState.TESTING, m: "Running tests... 🧐", c: "npm test" },
                { s: CharacterState.TEST_SUCCESS, m: "All tests passed! 🎉\n(10 passed)", c: "npm test" },
                { s: CharacterState.TEST_FAILURE, m: "Some tests failed 😭\n(8 passed, 2 failed)", c: "npm test" }
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
        })
    );
}
