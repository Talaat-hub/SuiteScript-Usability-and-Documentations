/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript   
*/
 define(['N/currentRecord', 'N/url'], function(currentRecord, url) {
        
        const pageInit = (context) => {
            try {
                return true;
            } catch (error) {
                
            }
        };

        function openAIAssistant() {
            // IMPORTANT: Replace 'customscript_ai_sl_using_https' and 'customdeploy_ai_sl_using_https'
            // with the actual Script ID and Deployment ID of your Suitelet.
            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_ai_sl_using_https',
                deploymentId: 'customdeploy_ai_sl_using_https'
            });
    
            window.open(suiteletUrl, 'ai_assistant', 'width=800,height=600');
        }
    
        /**
         * This function is exposed globally so the Suitelet pop-up can call it.
         * It receives the text from the Suitelet and sets it in the 'About' field.
         * @param {string} text - The AI-generated text to set.
         */
        function setAboutFieldText(text) {
            const rec = currentRecord.get();
            rec.setValue({
                fieldId: 'custentity_ai_generated_about',
                value: text
            });
        }

        return {
                pageInit: pageInit,
                openAIAssistant: openAIAssistant,
                setAboutFieldText: setAboutFieldText
            };
     }
);
