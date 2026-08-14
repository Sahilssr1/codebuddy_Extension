export interface ParsedError {
    type: string;
    message: string;
    location?: string;
}

export class ErrorParser {
    public static parse(output: string): ParsedError | null {
        if (!output) return null;

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
                } else if (line.startsWith('File "')) {
                    const match = line.match(/File "([^"]+)", line (\d+)/);
                    if (match) location = `${match[1]}:${match[2]}`;
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
