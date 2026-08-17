/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/https', 'N/log'], (serverWidget, https, log) => {

    const onRequest = (context) => {

        try {
            const request = context.request;
            const response = context.response;
            const form = serverWidget.createForm({ title: 'AI Content Assistant' });

            if (request.method === 'POST' && request.parameters.custpage_accepted_text) {
                try {
                    // --- User clicked "Proceed". Send text back to parent record. ---
                    const acceptedText = request.parameters.custpage_accepted_text;

                    const html = `
                        <html>
                            <body>
                                <script>
                                    window.opener.require(['N/currentRecord'], function(currentRecord) {
                                        var rec = currentRecord.get();
                                        rec.setValue({
                                            fieldId: 'custentity_ai_generated_about',
                                            value: ${JSON.stringify(acceptedText)}
                                        });
                                    });
                                    window.close();
                                </script>
                                <p>Content accepted. This window will now close.</p>
                            </body>
                        </html>`;

                    response.write(html);
                } catch (erraccepted_text) {
                    log.debug('erraccepted_text', erraccepted_text);
                }

            } else if (request.method === 'POST' && request.parameters.custpage_prompt) {

                try {
                    // --- User submitted a prompt. Call AI and show result. ---
                    const promptText = request.parameters.custpage_prompt;
                    let apiResponseText = '';

                    try {

                        // IMPORTANT: Replace 'YOUR_API_KEY' with your actual key from Google AI Studio.
                        const apiKey = '';
                        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                        const headers = {
                            'Content-Type': 'application/json'
                        };

                        const body = {
                            "contents": [{
                                "parts": [{
                                    "text": promptText
                                }]
                            }]
                        };

                        const apiResponse = https.post({
                            url: apiUrl,
                            headers: headers,
                            body: JSON.stringify(body)
                        });

                        if (apiResponse.code === 200) {
                            const responseData = JSON.parse(apiResponse.body);
                            // It's good practice to check if the path exists to prevent errors.
                            if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content.parts[0]) {
                                apiResponseText = responseData.candidates[0].content.parts[0].text;
                            } else {
                                apiResponseText = 'Error: Could not parse the AI response structure.';
                                log.debug('AI Response Parse Error', apiResponse.body);
                            }
                        } else {
                            apiResponseText = `Error: API returned status ${apiResponse.code}. Body: ${apiResponse.body}`;
                            log.debug('AI API Error', `Code: ${apiResponse.code}, Body: ${apiResponse.body}`);
                        }

                    } catch (e) {
                        apiResponseText = 'Error: Could not connect to the AI service. Details: ' + e.message;
                        log.debug('AI Suitelet Catch Error', e);
                    }

                    // Display the original prompt and the AI response
                    form.addField({ id: 'custpage_original_prompt', type: serverWidget.FieldType.INLINEHTML, label: ' ' })
                        .defaultValue = `<b>Your Prompt:</b><br/><i>${promptText}</i><hr/>`;

                    form.addField({ id: 'custpage_ai_response', type: serverWidget.FieldType.INLINEHTML, label: ' ' })
                        .defaultValue = `<b>Suggested Content:</b><br/><p style="background-color:#f0f0f0; padding:10px; border-radius:5px;">${apiResponseText}</p>`;

                    form.addField({ id: 'custpage_accepted_text', type: serverWidget.FieldType.LONGTEXT, label: 'Accepted Text' }).defaultValue = apiResponseText;
                    form.getField({ id: 'custpage_accepted_text' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    form.addSubmitButton({ label: 'Proceed and Use This Content' });
                    form.addButton({ id: 'custpage_cancel', label: 'Cancel', functionName: 'window.close' });
                    response.writePage(form);
                } catch (errpost) {
                    log.debug('errpost', errpost);
                }

            } else {
                try {
                    // --- Initial GET request. Show the prompt field. ---
                    form.addField({
                        id: 'custpage_prompt',
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Enter a prompt to generate the "About" text (e.g., "Write a professional bio for a senior software engineer with 10 years of experience in cloud technologies.")'
                    }).isMandatory = true;

                    form.addSubmitButton({ label: 'Generate Content' });
                    response.writePage(form);
                } catch (errget) {
                    log.debug('errget', errget);
                }
            }
        } catch (erronRequest) {
            log.debug('erronRequest', erronRequest);
        }
    };

    return {
        onRequest: onRequest
    };
});