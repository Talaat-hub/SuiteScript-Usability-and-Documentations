/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], function (search, record, log) {

    const getInputData = () => {
        try {
            log.debug('Starting Map/Reduce', 'Getting inputs...');

            return search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['memo', 'isempty', '']
                ],
                columns: ['internalid', 'entity']
            });
        } catch (errgetInputData) {
            log.debug('errgetInputData', errgetInputData);
        }
    }

    const map = (context) => {
        try {
            const searchResult = JSON.parse(context.value);
            const invoiceId = searchResult.id;

            log.audit('Processing Invoice', 'Invoice ID: ' + invoiceId);

            const invoiceRecord = record.load({
                type: record.Type.INVOICE,
                id: invoiceId,
                isDynamic: true
            });

            invoiceRecord.setValue({
                fieldId: 'memo',
                value: 'Processed by automation'
            });

            const savedId = invoiceRecord.save();
            log.debug('Success', 'Updated Invoice ID: ' + savedId);

        } catch (errmap) {
            log.debug('errmap', errmap);
        }
    }

    const summarize = (summary) => {
        try {
            log.audit('Map/Reduce Finished', 'Total processed: ' + summary.mapSummary.keys.length);

            summary.mapSummary.errors.iterator().each(function (key, error) {
                log.error('Map Error for key: ' + key, error);
                return true;
            });
        } catch (errsummarize) {
            log.debug('errsummarize', errsummarize);
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});
