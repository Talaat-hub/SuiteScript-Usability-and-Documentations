# Netsuite and AI

# 1 - Netsuite AI module LLM (Large Language Model)

As of now, THERE IS NO OFFICIAL N/llm module in NetSuite's SuiteScript API, The information provided here is a conceptual documentation for what a hypothetical N/llm module could look like if NetSuite were to implement native Large Language Model (LLM) integration.

This documentation outlines potential objects, methods, and usage patterns based on common AI and LLM functionalities.

---

## N/llm Module

The hypothetical N/llm module would provide a powerful, high-level API for integrating Large Language Model (LLM) capabilities directly within NetSuite, This would enable developers to build intelligent features like automated text generation, summarization, classification, and data extraction into their scripts and workflows without needing to manage external API integrations.

- Purpose : To execute prompts, generate content, and perform natural language understanding tasks using a pre-configured LLM.

- Dependencies : Would likely require a feature to be enabled in the NetSuite account (Setup > Company > Enable Features).

---

## Module Members

### Methods

#### `llm.execute(options)`

- Basic:

`const response = llm.execute({ prompt: ``Summarize this customer email, ${customer_email}`` });`

- With model:

`model` (string) (Optional): The ID of the LLM model to use (e.g., 'text-bison', 'gemini-1.5-pro'), Defaults to the account's pre-configured model.

`const creativeResponse = llm.execute({ model: 'gemini-1.5-pro', prompt: 'Write a tagline for a coffee shop'});`

- With parameters:

`parameters` (Object) (Optional): An object to control the generation process:

1 - `temperature` (number): A value between 0.0 and 1.0 that controls the randomness of the output. A lower value is more deterministic.

2 - `maxTokens` (number): The maximum number of tokens to generate in the response.

`const creativeResponse = llm.execute({ model: 'gemini-1.5-pro', prompt: 'Write a tagline for a coffee shop', parameters: { temperature: 0.8 } });`

- With context

`context` (Object) (Optional): A JSON object providing structured context, for example, you could pass a NetSuite record's data. This helps the LLM provide a more relevant response.

1 - `recordType` (string): The type of the record (e.g., record.Type.SALES_ORDER).

2 - `recordId` (number): The internal ID of the record.

3 - `data` (Object): A key-value pair object representing fields from the record.

`const contextResponse = llm.execute({ prompt: 'Generate a follow-up email', context: { recordType: 'salesorder', recordId: 123, data: { total: 599.99, entity: 'John Doe' } } });`

---

#### `llm.createTask(options)`

Initiates an asynchronous LLM request, Ideal for long-running tasks like summarizing extensive case histories or generating detailed reports, which might otherwise time out.

- `Parameters`: Same as llm.execute(options).

- `Returns`: An llm.LLMTask object, which contains a taskId to monitor the request's status.

- `Throws`: LLM_TASK_CREATION_ERROR if the task cannot be initiated.

```
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 * This script finds support cases needing summarization, initiates an asynchronous LLM task
 * for each, and creates a custom record to track the task's progress.
 */
define(['N/search', 'N/record', 'N/llm', 'N/log'], (search, record, llm, log) => {

    // 1. getInputData: Find all support cases that need a summary.
    const getInputData = () => {
        try{
            return search.create({
                type: search.Type.SUPPORT_CASE,
                filters: [
                    ['custevent_case_summary', 'isempty', ''], // Custom field for the summary
                    'AND',
                    ['messagetext', 'isnotempty', ''] // Ensure there are messages to summarize
                ],
                columns: ['internalid', 'casenumber']
            });
        } catch (errgetInputData) {
            log.debug('errgetInputData', errgetInputData);
        }
    };

    // 2. map: Process each case found in the search.
    const map = (context) => {
        
        try {
            const searchResult = JSON.parse(context.value);
            const caseId = searchResult.id;

            // In a real script, you would gather all message texts here.
            // For demonstration, we'll use a placeholder.
            const fullMessageHistory = `... long message history for case ID ${caseId} ...`;

            // Initiate the asynchronous LLM task
            const llmTask = llm.createTask({
                model: 'gemini-1.5-pro',
                prompt: `Please provide a concise summary of the key issues and resolution steps from the following support case conversation:\n\n${fullMessageHistory}`,
                parameters: { maxTokens: 250 }
            });

            log.debug(`LLM Task created for Case ID ${caseId}`, `Task ID: ${llmTask.taskId}`);

            // Create a tracker record to monitor this task
            const tracker = record.create({
                type: 'customrecord_llm_task_tracker',
                isDynamic: true
            });
            tracker.setValue({ fieldId: 'custrecord_llm_task_id', value: llmTask.taskId });
            tracker.setValue({ fieldId: 'custrecord_llm_related_record', value: caseId });
            tracker.setValue({ fieldId: 'custrecord_llm_task_status', value: 'PENDING' }); // Use internal ID of 'Pending' status
            const trackerId = tracker.save();

            log.debug(`Tracker Record Created`, `ID: ${trackerId} for Case ID: ${caseId}`);

        } catch (errmap) {
            log.debug(`Failed to create LLM task for Case ID ${caseId}`, errmap);
        }
    };

    // The summarize stage is not needed for this example.
    const summarize = (summaryContext) => {
        try{
            log.debug('Summarization Complete', 'All map tasks have been processed.');
        } catch (errsummarize) {
            log.debug('errsummarize', errsummarize)
        }
    };

    return {
        getInputData: getInputData,
        map:map,
        summarize:summarize
    };
});
```

---

#### `llm.checkTaskStatus(options)`

Checks the status of an asynchronous task created by `llm.createTask`.

- Parameters:

1 - `taskId` (string) (Required): The ID of the task returned by `llm.createTask`.

2 - Returns An `llm.LLMTask` object with the current status and - if completed - the result.

```
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 *
 * This script periodically checks the status of pending LLM tasks created by the
 * 'llm_create_task_initiator' Map/Reduce script. If a task is complete,
 * it updates the related NetSuite record with the result.
 */
define(['N/search', 'N/record', 'N/llm', 'N/log'], (search, record, llm, log) => {

    const execute = (context) => {
        try {
            // Search for all tracker records that are still pending.
            const trackerSearch = search.create({
                type: 'customrecord_llm_task_tracker',
                filters: [
                    // Assuming 'PENDING' is the text value. Use the internal ID in a real scenario.
                    ['custrecord_llm_task_status', 'is', 'PENDING']
                ],
                columns: [
                    'internalid',
                    'custrecord_llm_task_id',
                    'custrecord_llm_related_record'
                ]
            });

            trackerSearch.run().each(result => {
                const trackerId = result.id;
                const taskId = result.getValue('custrecord_llm_task_id');
                const caseId = result.getValue('custrecord_llm_related_record');

                try {
                    // *** THIS IS THE KEY PART ***
                    // Use the taskId from the tracker record to check the status of the job.
                    const taskStatus = llm.checkTaskStatus({ taskId: taskId });
                    // *** END OF KEY PART ***

                    if (taskStatus.status === llm.TaskStatus.COMPLETED) {
                        // The task is done, get the result from the response object.
                        const summaryText = taskStatus.response.result;

                        // Update the original support case record with the new summary.
                        record.submitFields({
                            type: record.Type.SUPPORT_CASE,
                            id: caseId,
                            values: {
                                'custevent_case_summary': summaryText // Your custom field for the summary
                            }
                        });

                        // Update the tracker record to 'Completed'.
                        record.submitFields({
                            type: 'customrecord_llm_task_tracker',
                            id: trackerId,
                            values: {
                                'custrecord_llm_task_status': 'COMPLETED' // Use internal ID
                            }
                        });

                        log.debug(`Task ${taskId} Completed`, `Case ID ${caseId} has been updated.`);

                    } else if (taskStatus.status === llm.TaskStatus.FAILED) {
                        // The task failed. Log the error and update the tracker.
                        const errorMessage = taskStatus.response.error;
                        record.submitFields({
                            type: 'customrecord_llm_task_tracker',
                            id: trackerId,
                            values: {
                                'custrecord_llm_task_status': 'FAILED', // Use internal ID
                                'custrecord_llm_error_details': errorMessage
                            }
                        });
                        log.debug(`Task ${taskId} Failed for Case ID ${caseId}`, errorMessage);
                    }
                    // If the status is still PENDING or PROCESSING, we do nothing.
                    // The script will check again on its next scheduled run.

                } catch (e) {
                    log.debug(`Error processing tracker ID ${trackerId} for Task ID ${taskId}`, e);
                }

                return true; // Continue to the next search result.
            });
        } catch (errexecute) {
            log.debug('errexecute', errexecute);
        }
    };

    return {
        execute: execute
    };
});
```

---

### Objects

#### `llm.LLMResponse`

An object representing the result of a synchronous llm.execute call.

Properties:

- result (string): The main text content generated by the LLM.

- usage (Object): An object detailing the processing units consumed.

1 - `promptTokens` (number): The number of tokens in the input prompt.

2 - `completionTokens` (number): The number of tokens in the generated response.

3 - `totalTokens` (number): The total tokens consumed.

- error (string): An error message if the execution failed.

`const resultText = response.result; // Accessing the main generated text.`
`const tokensUsed = response.usage.totalTokens; // Accessing a specific usage property.`

---

#### `llm.LLMTask`

An object representing an asynchronous LLM task.

Properties:

- taskId (string): The unique identifier for the task.

- status (enum): The current status of the taskو Can be one of `llm.TaskStatus` values: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.

- response (llm.LLMResponse): The result of the execution, This property is only populated when the status is `COMPLETED`.

`const myTaskId = asyncTask.taskId; // Getting the ID to store for later.`
`const currentStatus = taskStatus.status; // Checking the current status of the task.`

---

#### `llm.TaskStatus` (Enum)

An enum containing the possible statuses for an LLMTask.

- `PENDING`: The task is in the queue waiting to be processed.

- `PROCESSING`: The task is actively being processed.

- `COMPLETED`: The task finished successfully.

- `FAILED`: The task failed due to an error.

`if (taskStatus.status === llm.TaskStatus.COMPLETED) { /* do something with the result */ }`

---

## Full Example for Synchronous Pattern

```
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * SYNCHRONOUS EXAMPLE
 * This script uses llm.execute() to generate a memo for a new Sales Order.
 * The script execution waits for the LLM response before the record is saved.
 */
define(['N/record', 'N/llm', 'N/log'], (record, llm, log) => {

    /**
     * Function executed before a record is submitted to the database.
     * @param {Object} context
     * @param {Record} context.newRecord - The new record being submitted
     * @param {string} context.type - The user event type (e.g., create, edit)
     */
    const beforeSubmit = (context) => {

        try {
            // Run only when a new Sales Order is being created
            if (context.type !== context.UserEventType.CREATE) {
                return;
            }

            const salesOrder = context.newRecord;
            const customerName = salesOrder.getText({ fieldId: 'entity' });
            const total = salesOrder.getValue({ fieldId: 'total' });
            const orderId = salesOrder.getValue({ fieldId: 'tranid' });

            // Construct a clear and specific prompt for the LLM
            const prompt = `Generate a short, friendly memo for our customer, ${customerName}, confirming their order #${orderId} with a total of $${total}. Mention that we appreciate their business and they will be notified upon shipment.`;

            log.debug('Executing Synchronous LLM Request', `Prompt: ${prompt}`);

            // --- SYNCHRONOUS CALL ---
            // The script will pause here and wait for the API to return a result.
            // This is suitable for tasks that are expected to be very fast.
            const llmResponse = llm.execute({
                model: 'text-bison', // A hypothetical fast model
                prompt: prompt,
                parameters: {
                    maxTokens: 100 // Limit the length of the memo
                }
            });
            // --- END OF CALL ---

            log.debug('LLM Response Received', `Result: ${llmResponse.result}`);

            // Set the generated text directly into the memo field
            salesOrder.setValue({
                fieldId: 'memo',
                value: llmResponse.result
            });

        } catch (errbeforeSubmit) {
            log.debug('errbeforeSubmit', errbeforeSubmit);
            // As a fallback, set a generic memo so the record can still be saved
            salesOrder.setValue({
                fieldId: 'memo',
                value: `Order confirmation for ${customerName}.`
            });
        }
    };

    return {
        beforeSubmit:beforeSubmit
    };
});
```

---

## Full Example for Asynchoronous Pattern

### SCRIPT 1: MAP/REDUCE TO INITIATE TASKS

```
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 * ASYNCHRONOUS EXAMPLE (Part 1 - Initiator)
 * This script finds records and initiates an asynchronous LLM task for each one.
 * It does NOT wait for the result.
 */
define(['N/search', 'N/record', 'N/llm', 'N/log'], (search, record, llm, log) => {

    const getInputData = () => {
        try{
            // Find support cases that have messages but no summary yet
            return search.create({
                type: search.Type.SUPPORT_CASE,
                filters: [
                    ['custevent_case_summary', 'isempty', ''],
                    'AND',
                    ['messagetext', 'isnotempty', '']
                ],
                columns: ['internalid']
            });
        } catch (errgetInputData) {
            log.debug('getInputData', getInputData);
        }
    };

    const map = (context) => {
        
        try {
            const caseId = JSON.parse(context.value).id;
            // In a real scenario, you would gather all message texts here.
            const fullMessageHistory = `... Pretend this is a very long message history for case ID ${caseId} ...`;

            // --- ASYNCHRONOUS CALL ---
            // This call is non-blocking. It returns a task object immediately
            // and the LLM processes the request in the background.
            const llmTask = llm.createTask({
                prompt: `Summarize the key points from this support case conversation:\n\n${fullMessageHistory}`
            });
            // --- END OF CALL ---

            log.debug(`LLM Task created for Case ID ${caseId}`, `Task ID: ${llmTask.taskId}`);

            // Create a custom record to track the task's status
            const tracker = record.create({ type: 'customrecord_llm_task_tracker' });
            tracker.setValue({ fieldId: 'custrecord_llm_task_id', value: llmTask.taskId });
            tracker.setValue({ fieldId: 'custrecord_llm_related_record', value: caseId });
            tracker.setValue({ fieldId: 'custrecord_llm_task_status', value: 'PENDING' });
            tracker.save();

        } catch (errmap) {
            log.debug(`Failed to create LLM task for Case ID ${caseId}`, errmap);
        }
    };

    return {
        getInputData: getInputData,
        map: map
    };
});
```

---

### SCRIPT 2: SCHEDULED SCRIPT TO CHECK STATUS AND GET RESULTS

```
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 *
 * ASYNCHRONOUS EXAMPLE (Part 2 - Processor)
 * This script runs periodically to check the status of the tasks created earlier.
 */
define(['N/search', 'N/record', 'N/llm', 'N/log'], (search, record, llm, log) => {

    const execute = (context) => {

        try{
            // Find all pending tracker records
            search.create({
                type: 'customrecord_llm_task_tracker',
                filters: [['custrecord_llm_task_status', 'is', 'PENDING']],
                columns: ['custrecord_llm_task_id', 'custrecord_llm_related_record']
            }).run().each(result => {
                const trackerId = result.id;
                const taskId = result.getValue('custrecord_llm_task_id');
                const caseId = result.getValue('custrecord_llm_related_record');

                try {
                    // Check the status of the task using its ID
                    const taskStatus = llm.checkTaskStatus({ taskId: taskId });

                    if (taskStatus.status === llm.TaskStatus.COMPLETED) {
                        const summaryText = taskStatus.response.result;

                        // Update the original support case with the summary
                        record.submitFields({
                            type: record.Type.SUPPORT_CASE,
                            id: caseId,
                            values: { 'custevent_case_summary': summaryText }
                        });

                        // Update the tracker record's status
                        record.submitFields({
                            type: 'customrecord_llm_task_tracker',
                            id: trackerId,
                            values: { 'custrecord_llm_task_status': 'COMPLETED' }
                        });

                        log.debug(`Task ${taskId} Completed`, `Case ID ${caseId} updated.`);
                    } else if (taskStatus.status === llm.TaskStatus.FAILED) {
                        record.submitFields({
                            type: 'customrecord_llm_task_tracker',
                            id: trackerId,
                            values: { 'custrecord_llm_task_status': 'FAILED' }
                        });
                        log.debug(`Task ${taskId} Failed for Case ID ${caseId}`, taskStatus.response.error);
                    }
                    // If still PENDING or PROCESSING, do nothing and check again next time.

                } catch (e) {
                    log.debug(`Error processing tracker ID ${trackerId}`, e);
                }
                return true;
            });
        } catch (errexecute) {
            log.debug('errexecute', errexecute);
        }
    };

    return {
        execute: execute
    };
});
```

---
---

# 2 - Netsuite AI using https

The primary goal of this Suitelet is to provide a practical, working example of how to connect NetSuite to any external AI or Large Language Model (LLM) service, Since NetSuite does not have a native N/llm module, this script demonstrates the standard, real-world method for achieving this integration using web technologies.

Please check it out and test it for yourself :

[Suitelet](https://github.com/Talaat-hub/Netsuite-Utility-Functions-and-Documentations/blob/main/Documentations/LLM/ai_sl_using_https.js)

[ClientScript](https://github.com/Talaat-hub/Netsuite-Utility-Functions-and-Documentations/blob/main/Documentations/LLM/ai_cs_using_https.js)

[UserEvent](https://github.com/Talaat-hub/Netsuite-Utility-Functions-and-Documentations/blob/main/Documentations/LLM/ai_ue_using_https.js)

## Note

In our case we are using ai model gemini-1.5-flash, feel free to change through the link inside the POST inside the suitelet.

## Authors

[Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) – NetSuite Developer

Feel free to connect or contribute!

Let me know if you have special focus (e.g., SuiteQL, OAuth, or CSV imports) and I’ll tailor it even more!