# CodeBuddy 🤖

CodeBuddy is an animated coding companion that lives in your VS Code sidebar. It watches your terminal and reacts to what happens during development! 

Using the official VS Code Terminal Shell Integration, CodeBuddy knows when your commands start, succeed, or fail, and provides helpful context and reactions.

## Features

- **Animated Companion:** A cute robot character that reacts to your workflow.
- **Terminal Integration:** Automatically detects when commands start and finish.
- **Smart Error Parsing:** Extracts exact errors (TypeError, Tracebacks) and line numbers for Node.js, Python, C#, etc.
- **Test Detection:** Recognizes when Jest, pytest, or .NET tests run and cheers you on!
- **Zero Configuration:** Works right out of the box with modern VS Code shell integration.

## Installation

Since this extension is in development, you can run it locally:

1. Clone or open the project folder.
2. Run `npm install`.
3. Press `F5` in VS Code to launch the Extension Development Host.

## Commands

- `CodeBuddy: Open` - Opens the CodeBuddy sidebar.
- `CodeBuddy: Reset Character` - Resets the character to the idle state.
- `CodeBuddy: Enable/Disable` - Toggles CodeBuddy tracking.
- `CodeBuddy: Test Reaction` - Cycles through all character animations (useful for testing!).

## Architecture

- **TerminalManager & ShellIntegration:** Hooks into `vscode.window.onDidStartTerminalShellExecution` and `onDidEndTerminalShellExecution`.
- **CommandTracker:** Tracks the execution of a single command and buffers output.
- **Parsers (Error/Success/Test):** Analyzes terminal output to provide rich messages.
- **CharacterController:** State machine managing the companion's current mood.
- **Webview UI:** Completely local HTML/CSS/JS frontend without any external dependencies.

## Known Limitations

- **Shell Integration Requirement:** This extension relies on VS Code's Terminal Shell Integration feature (introduced ~1.93). Ensure your terminal supports it (most default configurations do).
- Parsers rely on common regex patterns. Highly customized output might not be recognized correctly.

## Future Roadmap

- Additional characters to choose from (cats, dogs, fantasy creatures).
- Sound effects for success/errors.
- AI integration for explaining the terminal errors when they happen.
