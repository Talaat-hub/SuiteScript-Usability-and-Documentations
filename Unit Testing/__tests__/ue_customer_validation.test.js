/**
 * TUTORIAL NOTES:
 * Welcome to the Unit Test for ue_customer_validation.js!
 * Follow along with the comments to see how we test a SuiteScript.
 */

// Step 1: Tell Jest to mock the NetSuite modules our script uses.
// This tells Jest "Don't load real Netsuite, load the fake files from __mocks__"
jest.mock('N/record');
jest.mock('N/log');
jest.mock('N/error');

// Step 2: Require the mocked modules. We do this so we can control what they return during our tests.
const record = require('N/record');
const log = require('N/log');
const error = require('N/error');

// Step 3: Set up variables to hold our script's exported functions
let beforeSubmit;

describe('User Event Script - Customer Validation', () => {

    // Step 4: beforeAll runs ONCE before any tests start.
    // It loads our SuiteScript into memory and hooks it up to our fakes.
    beforeAll(() => {
        // We simulate NetSuite's 'define' function using global.define
        global.define = (deps, factory) => {
            // We pass our mocked modules into the script's factory function
            const module = factory(record, log, error);
            // We extract the exported beforeSubmit function
            beforeSubmit = module.beforeSubmit;
        };

        // require() loads the file. Because it has define(), it triggers the global.define above.
        require('../src/ue_customer_validation');
    });

    // Step 5: beforeEach runs before EACH test. We clear previous mock calls to keep tests isolated.
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST CASE 1: Validation should pass and set default tier if it is missing ---
    test('should pass validation and set tier to 1 if missing', () => {
        // We create a fake context object exactly like NetSuite would provide to beforeSubmit
        const context = {
            UserEventType: { CREATE: 'create', EDIT: 'edit' },
            type: 'create',
            newRecord: {
                getValue: jest.fn(),
                setValue: jest.fn()
            }
        };

        // We prepare our fake record to return specific values when our script calls getValue
        context.newRecord.getValue.mockImplementation(({ fieldId }) => {
            if (fieldId === 'companyname') return 'Acme Corp'; // Has a company name
            if (fieldId === 'custentity_tier') return ''; // Doesn't have a tier
            if (fieldId === 'subsidiary') return '123'; // Has a subsidiary ID
        });

        // We also need to mock record.load because our script now uses it
        const mockSubsidiaryRecord = {
            getValue: jest.fn().mockImplementation(({ fieldId }) => {
                if (fieldId === 'name') return 'Acme Subsidiary';
            })
        };
        record.load.mockReturnValue(mockSubsidiaryRecord);

        // ACTION: We run the script function!
        beforeSubmit(context);

        // ASSERTION: We check if the script did what we expect
        // 1. Did it log the debug message?
        expect(log.debug).toHaveBeenCalledWith('Checking Customer', 'Company Name: Acme Corp');

        // 2. Did it set the tier to 1?
        expect(context.newRecord.setValue).toHaveBeenCalledWith({
            fieldId: 'custentity_tier',
            value: '1'
        });

        // 3. Did it load the subsidiary record?
        expect(record.load).toHaveBeenCalledWith({
            type: record.Type.SUBSIDIARY,
            id: '123'
        });
        expect(log.debug).toHaveBeenCalledWith('Subsidiary Loaded', 'Acme Subsidiary');

        // 4. We check that log.error was NEVER called, because there was no error
        expect(log.error).not.toHaveBeenCalled();
    });

    // --- TEST CASE 2: Validation should throw an error if company name is missing ---
    test('should throw error when company name is missing', () => {
        // Setup the context
        const context = {
            UserEventType: { CREATE: 'create' },
            type: 'create',
            newRecord: {
                getValue: jest.fn(),
                setValue: jest.fn()
            }
        };

        // This time, we return nothing for companyname!
        context.newRecord.getValue.mockReturnValue('');

        // Provide a fake implementation for error.create so it returns a fake Error object
        error.create.mockReturnValue(new Error('Company Name is required for new customers.'));

        // ACTION: Execute the function. It should NOT throw because it has a try-catch that swallows errors.
        beforeSubmit(context);

        // ASSERTION: Did it log the error?
        expect(log.error).toHaveBeenCalledWith('Validation Failed', 'Company Name is empty');

        // ASSERTION: Did it log the caught error in the catch block?
        expect(log.debug).toHaveBeenCalledWith('errbeforeSubmit', expect.anything());

        // ASSERTION: It should NOT have tried to set the tier, because it threw an error first
        expect(context.newRecord.setValue).not.toHaveBeenCalled();
    });

    // --- TEST CASE 3: Should ignore EDIT events ---
    test('should do nothing if event type is not CREATE', () => {
        const context = {
            UserEventType: { CREATE: 'create', EDIT: 'edit' },
            type: 'edit', // Event type is EDIT!
            newRecord: {
                getValue: jest.fn()
            }
        };

        beforeSubmit(context);

        // ASSERTION: The script should have returned early. getValue should never have been called.
        expect(context.newRecord.getValue).not.toHaveBeenCalled();
    });
});
