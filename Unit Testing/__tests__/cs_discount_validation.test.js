/**
 * TUTORIAL NOTES:
 * Testing client scripts involves simulating user actions like saving a record,
 * and checking if our dialogs (alerts/confirmations) were triggered.
 */

// Step 1: Mocking modules. Note we test currentRecord instead of record for client scripts
jest.mock('N/ui/dialog');

const dialog = require('N/ui/dialog');

let saveRecord;

let logMock = {
    debug: jest.fn(),
    error: jest.fn()
}

describe('Client Script - Discount Validation', () => {

    // Step 2: Setup script
    beforeAll(() => {
        global.log = logMock; // Fallback so log is still available even if the script's own N/log import is missing
        global.define = (deps, factory) => {
            const mod = factory(dialog, logMock); // script now imports both N/ui/dialog and N/log
            saveRecord = mod.saveRecord;
        };
        require('../src/cs_discount_validation');
    });

    // Step 3: Clear mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST 1: Allowed to save ---
    test('should allow saving when discount is 50% or less', () => {
        // Setup a fake currentRecord object
        const mockCurrentRec = {
            getValue: jest.fn()
        };

        // When script asks for subtotal, return 100. When it asks for discount, return -20.
        mockCurrentRec.getValue.mockImplementation(({ fieldId }) => {
            if (fieldId === 'subtotal') return 100;
            if (fieldId === 'discountamount') return -20;
        });

        // The context given to saveRecord
        const context = {
            currentRecord: mockCurrentRec
        };

        // Action: Call saveRecord
        const result = saveRecord(context);

        // Assertion: We expect it to return true!
        expect(result).toBe(true);
        // And we expect NO alert popup
        expect(dialog.alert).not.toHaveBeenCalled();
    });

    // --- TEST 2: Blocked from saving ---
    test('should block saving and show alert when discount is more than 50%', () => {
        const mockCurrentRec = {
            getValue: jest.fn()
        };

        // Subtotal = 100, but discount = -60 (which is > 50% of 100!)
        mockCurrentRec.getValue.mockImplementation(({ fieldId }) => {
            if (fieldId === 'subtotal') return 100;
            if (fieldId === 'discountamount') return -60;
        });

        const context = { currentRecord: mockCurrentRec };

        // Action: Call saveRecord
        const result = saveRecord(context);

        // Assertion: We expect it to return false to block the save
        expect(result).toBe(false);

        // And we expect our dialog alert to have been called!
        expect(dialog.alert).toHaveBeenCalledWith({
            title: 'Discount Too High',
            message: 'You cannot provide a discount greater than 50% of the subtotal.'
        });
    });

    // --- TEST 3: Edge Case ---
    test('should handle empty/missing values gracefully', () => {
        const mockCurrentRec = {
            getValue: jest.fn().mockReturnValue('') // Assuming fields are completely empty
        };

        const context = { currentRecord: mockCurrentRec };

        // Action
        const result = saveRecord(context);

        // Assertion: Empty subtotal (0) and empty discount (0) means 0 <= 0, which is valid
        expect(result).toBe(true);
        expect(dialog.alert).not.toHaveBeenCalled();

        // Business-Need wise, this test might be wrong, no invoice can be saved with zero subtotal.
    });

    test('should handle try/catch error gracefully', () => {
        // Trigger an error by passing an invalid context (empty object)
        // This will cause an error when the script tries to access context.currentRecord.getValue
        saveRecord({});

        // Assertion: Check if log.debug was called with the error label
        expect(log.debug).toHaveBeenCalledWith('errsaveRecord', expect.anything());
    });
});
