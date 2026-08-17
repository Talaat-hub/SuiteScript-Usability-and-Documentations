/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/error'], function (record, log, error) {

    const beforeSubmit = (context) => {
        try {
            if (context.type !== context.UserEventType.CREATE) {
                return;
            }

            const newCustomer = context.newRecord;

            const companyName = newCustomer.getValue({ fieldId: 'companyname' });

            log.debug('Checking Customer', 'Company Name: ' + companyName);

            if (!companyName) {
                log.error('Validation Failed', 'Company Name is empty');

                throw error.create({
                    name: 'MISSING_COMPANY_NAME',
                    message: 'Company Name is required for new customers.',
                    notifyOff: false
                });
            }

            const tier = newCustomer.getValue({ fieldId: 'custentity_tier' });
            if (!tier) {
                newCustomer.setValue({ fieldId: 'custentity_tier', value: '1' });
            }

            // Example of using N/record to load a related record
            const defaultSubsidiaryId = newCustomer.getValue({ fieldId: 'subsidiary' });
            if (defaultSubsidiaryId) {
                const subsidiaryRecord = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: defaultSubsidiaryId
                });
                log.debug('Subsidiary Loaded', subsidiaryRecord.getValue({ fieldId: 'name' }));
            }
        } catch (errbeforeSubmit) {
            log.debug('errbeforeSubmit', errbeforeSubmit);
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});
