import * as assert from 'assert';
import { ErrorParser } from '../../parser/ErrorParser';
import { SuccessParser } from '../../parser/SuccessParser';
import { TestParser } from '../../parser/TestParser';

suite('Extension Test Suite', () => {
    test('ErrorParser identifies JS Error', () => {
        const output = 'TypeError: Cannot read properties of undefined\n    at Object.<anonymous> (c:/app.js:10:1)';
        const result = ErrorParser.parse(output);
        assert.ok(result);
        assert.strictEqual(result.type, 'TypeError');
        assert.strictEqual(result.message, 'Cannot read properties of undefined');
        assert.strictEqual(result.location, 'c:/app.js:10:1');
    });

    test('ErrorParser identifies Python Error', () => {
        const output = 'Traceback (most recent call last):\n  File "main.py", line 42, in <module>\nValueError: invalid literal for int()';
        const result = ErrorParser.parse(output);
        assert.ok(result);
        assert.strictEqual(result.type, 'ValueError');
        assert.strictEqual(result.message, 'invalid literal for int()');
        assert.strictEqual(result.location, 'main.py:42');
    });

    test('SuccessParser identifies build success', () => {
        const output = '... webpack compiled successfully in 120ms';
        assert.strictEqual(SuccessParser.isSuccess(output), true);
    });

    test('TestParser identifies Jest output', () => {
        const output = 'Tests:       1 failed, 2 passed, 3 total';
        const result = TestParser.parse(output);
        assert.ok(result);
        assert.strictEqual(result.passed, 2);
        assert.strictEqual(result.failed, 1);
    });

    test('TestParser identifies pytest output', () => {
        const output = '========================= 1 failed, 2 passed in 0.12s =========================';
        const result = TestParser.parse(output);
        assert.ok(result);
        assert.strictEqual(result.passed, 2);
        assert.strictEqual(result.failed, 1);
    });
});
