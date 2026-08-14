export interface TestResult {
    passed: number;
    failed: number;
}

export class TestParser {
    public static parse(output: string): TestResult | null {
        if (!output) return null;

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
