/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Generates a professional employee bio using the native N/llm module
 * whenever an Employee record is created or edited.
 */
define(['N/llm', 'N/record', 'N/log'], (llm, record, log) => {

    const beforeSubmit = (context) => {

        try {

            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
                return;
            }
            const rec = context.newRecord;
            const employee_name = rec.getValue('name');
            const job_title = rec.getValue('custentity_job_title');
            const experience = rec.getValue('custentity_experience_summary'); // Custom field example

            const prompt = `Generate a professional bio for an employee named ${employee_name}, with job title ${job_title}, and experience: ${experience}. Keep it under 200 words.`;

            // NOTE: as of NetSuite 2024.2, the model is selected via `modelFamily`
            // (not `model`), and generation controls live under `modelParameters`.
            // If `modelFamily` is omitted, NetSuite defaults to Cohere Command A.
            const response = llm.generateText({
                modelFamily: llm.ModelFamily.COHERE_COMMAND,
                prompt: prompt,
                modelParameters: {
                    temperature: 0.7, // Controls creativity
                    maxTokens: 300
                }
            });

            rec.setValue({
                fieldId: 'custentity_employee_bio',
                value: response.text
            });

        } catch (errbeforeSubmit) {
            log.debug('errbeforeSubmit', errbeforeSubmit);
        }
    };

    return {
        beforeSubmit: beforeSubmit
    };
});
