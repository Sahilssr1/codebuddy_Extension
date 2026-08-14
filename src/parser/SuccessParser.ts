export class SuccessParser {
    public static isSuccess(output: string): boolean {
        if (!output) return false;

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
