/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/ui/dialog', 'N/log'], function (dialog, log) {

    const saveRecord = (context) => {
        try {
            const rec = context.currentRecord;

            const subtotal = rec.getValue({ fieldId: 'subtotal' }) || 0;
            const discountAmount = rec.getValue({ fieldId: 'discountamount' }) || 0;

            const maxDiscount = subtotal * 0.5;

            if (Math.abs(discountAmount) > maxDiscount) {
                dialog.alert({
                    title: 'Discount Too High',
                    message: 'You cannot provide a discount greater than 50% of the subtotal.'
                });

                return false;
            }

            return true;

        } catch (errsaveRecord) {
            log.debug('errsaveRecord', errsaveRecord);
        }
    }

    return {
        saveRecord: saveRecord
    };
});
