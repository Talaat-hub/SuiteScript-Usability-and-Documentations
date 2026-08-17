/**
 * TUTORIAL NOTES:
 * Testing a Map/Reduce script means testing getInputData, map, and summarize individually.
 */

// Step 1: Mock modules
jest.mock('N/search');
jest.mock('N/record');
jest.mock('N/log');

// Step 2: Require them to control them
const search = require('N/search');
const record = require('N/record');
const log = require('N/log');

// Step 3: Variables for entry points
let getInputData, map, summarize;

describe('Map/Reduce Script - Invoice Memo', () => {

    // Step 4: Loading the script
    beforeAll(() => {
        global.define = (deps, factory) => {
            const module = factory(search, record, log);
            getInputData = module.getInputData;
            map = module.map;
            summarize = module.summarize;
        };
        require('../src/mr_invoice_memo');
    });

    // Step 5: Clear mocks
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST getInputData ---
    describe('getInputData', () => {
        test('should return a search object for invoices', () => {
            // We set up the mock so search.create returns 'fake_search'
            search.create.mockReturnValue('fake_search');

            // Action
            const result = getInputData();

            // Assertions
            expect(log.debug).toHaveBeenCalledWith('Starting Map/Reduce', 'Getting inputs...');

            // Check that search.create was called with the right parameters
            expect(search.create).toHaveBeenCalledWith({
                type: search.Type.INVOICE,
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['memo', 'isempty', '']
                ],
                columns: ['internalid', 'entity']
            });

            // Check that the returned value is what we expected
            expect(result).toBe('fake_search');
        });

        test('should log try/catch error', () => {
            // Force search.create to throw an error to trigger the catch block
            search.create.mockImplementation(() => {
                throw new Error('Search failed');
            });

            getInputData();

            expect(log.debug).toHaveBeenCalledWith('Starting Map/Reduce', 'Getting inputs...');
            expect(log.debug).toHaveBeenCalledWith('errgetInputData', expect.anything());
        });
    });

    // --- TEST map ---
    describe('map', () => {
        test('should load invoice, set memo, and save', () => {
            // The context passed to map contains a "value" which is a stringified JSON
            const mapContext = {
                value: JSON.stringify({
                    id: '12345',
                    recordType: 'invoice'
                })
            };

            // Prepare a fake record to be returned when record.load is called
            const mockInvoice = {
                setValue: jest.fn(),
                save: jest.fn().mockReturnValue('12345') // save() will return the ID
            };
            record.load.mockReturnValue(mockInvoice);

            // Action
            map(mapContext);

            // Assertions
            expect(log.audit).toHaveBeenCalledWith('Processing Invoice', 'Invoice ID: 12345');

            // Did it load the correct record?
            expect(record.load).toHaveBeenCalledWith({
                type: record.Type.INVOICE,
                id: '12345',
                isDynamic: true
            });

            // Did it set the new memo?
            expect(mockInvoice.setValue).toHaveBeenCalledWith({
                fieldId: 'memo',
                value: 'Processed by automation'
            });

            // Did it save the record?
            expect(mockInvoice.save).toHaveBeenCalled();
            expect(log.debug).toHaveBeenCalledWith('Success', 'Updated Invoice ID: 12345');
        });

        test('should log an error if saving the record fails', () => {
            const mapContext = {
                value: JSON.stringify({ id: '999' })
            };

            // Force record.load to throw an error
            record.load.mockImplementation(() => {
                throw new Error('Database disconnected');
            });

            // Action
            map(mapContext);

            // ASSERTION: The script now logs errmap with debug when an error occurs
            expect(log.debug).toHaveBeenCalledWith('errmap', expect.anything());
        });
    });

    // --- TEST summarize ---
    describe('summarize', () => {
        test('should log total processed and errors, if any', () => {
            // Summary object mock
            const mockSummary = {
                mapSummary: {
                    keys: { length: 2 }, // Pretend 2 keys were processed
                    errors: {
                        iterator: jest.fn().mockReturnValue({
                            // Pretend there was 1 error
                            each: jest.fn((callback) => {
                                callback('key456', 'Fake error message');
                                return true;
                            })
                        })
                    }
                }
            };

            // Action
            summarize(mockSummary);

            // Assertions
            expect(log.audit).toHaveBeenCalledWith('Map/Reduce Finished', 'Total processed: 2');
            expect(log.error).toHaveBeenCalledWith('Map Error for key: key456', 'Fake error message');
        });

        test('should log try/catch error gracefully', () => {
            // Passing null instead of an object will cause a TypeError when trying to read 
            // summary.mapSummary, triggering the catch block properly.
            const mockSummary = null;

            summarize(mockSummary);

            expect(log.debug).toHaveBeenCalledWith('errsummarize', expect.anything());
        });
    });
});
