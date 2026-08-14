(function () {
    const vscode = acquireVsCodeApi();

    const characterContainer = document.getElementById('character-container');
    const commandText = document.getElementById('command-text');
    const messageText = document.getElementById('message-text');

    document.getElementById('btn-reset').addEventListener('click', () => {
        vscode.postMessage({ type: 'reset' });
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        vscode.postMessage({ type: 'settings' });
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'characterState':
                updateState(message.state, message.message, message.command);
                break;
        }
    });

    function updateState(state, message, command) {
        if (characterContainer) {
            characterContainer.setAttribute('data-state', state);
            
            const img = document.getElementById('character-img');
            if (img) {
                if (state === 'error' || state === 'test-failure' || state === 'warning') {
                    img.src = characterContainer.getAttribute('data-sad-src');
                } else if (state === 'running' || state === 'success' || state === 'test-success') {
                    img.src = characterContainer.getAttribute('data-happy-src');
                } else {
                    img.src = characterContainer.getAttribute('data-default-src');
                }
            }
        }
        
        if (messageText) {
            messageText.textContent = message;
            
            // Add a little pop animation
            messageText.classList.remove('pop');
            void messageText.offsetWidth; // trigger reflow
            messageText.classList.add('pop');
        }

        if (commandText) {
            if (command) {
                commandText.textContent = '> ' + command;
            } else {
                commandText.textContent = 'Ready';
            }
        }
    }
}());
