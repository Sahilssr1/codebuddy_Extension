import * as vscode from 'vscode';
import { CharacterState } from './CharacterState';

type StateListener = (state: CharacterState, message: string, command?: string) => void;

export class CharacterController {
    private currentState: CharacterState = CharacterState.IDLE;
    private currentMessage: string = "Hi! I'm CodeBuddy 👋";
    private listeners: StateListener[] = [];
    private clearTimer: NodeJS.Timeout | null = null;

    constructor() {}

    public getState(): CharacterState {
        return this.currentState;
    }

    public getMessage(): string {
        return this.currentMessage;
    }

    public setState(state: CharacterState, message: string, command?: string) {
        this.currentState = state;
        this.currentMessage = message;
        this.notifyListeners(command);

        const isVisible = state !== CharacterState.IDLE;
        vscode.commands.executeCommand('setContext', 'codeBuddyVisible', isVisible);
        
        if (isVisible) {
            vscode.commands.executeCommand('codebuddy.sidebar.focus');
        }

        // Auto-reset to IDLE after some time if it's a transient state
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
            this.clearTimer = null;
        }

        if (state === CharacterState.SUCCESS || state === CharacterState.TEST_SUCCESS) {
            // Auto hide/reset after 3 seconds only for successful workflows
            this.clearTimer = setTimeout(() => {
                this.reset();
            }, 3000);
        }
    }

    public reset() {
        this.setState(CharacterState.IDLE, "Ready for your next command.");
    }

    public onStateChange(listener: StateListener) {
        this.listeners.push(listener);
    }

    private notifyListeners(command?: string) {
        for (const listener of this.listeners) {
            listener(this.currentState, this.currentMessage, command);
        }
    }
}
