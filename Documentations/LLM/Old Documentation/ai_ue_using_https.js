/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
*/
 define(['N/log'], function(log) {


        const beforeLoad = (context) => {
            try {

                log.debug('Hello')
                
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

                    context.form.addButton({
                        id: 'custpage_ai_help',
                        label: 'Tailor "About" with AI',
                        functionName: `openAIAssistant`
                    });

                    // Update this path to match where ai_cs_using_https.js is deployed in your File Cabinet
                    context.form.clientScriptModulePath = 'SuiteScripts/suiteScript2/ai_cs_using_https.js';
    
                }

            } catch (errbeforeLoad) {
                log.debug('errbeforeLoad', errbeforeLoad)
            }
        };

        return {
                beforeLoad : beforeLoad
          }
   }
)