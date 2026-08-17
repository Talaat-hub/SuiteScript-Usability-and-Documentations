# NetSuite and AI

# N/llm Module (SuiteScript 2.1)

The `N/llm` module provides a high-level API for integrating Large Language Model (LLM) capabilities directly within NetSuite, backed by the Oracle Cloud Infrastructure (OCI) Generative AI service. It lets you build features like automated text generation, summarization, classification, and data extraction natively — no external API keys or outbound HTTPS calls required.

The module has been available since NetSuite **2024.1**, and Oracle has extended it release over release (retrieval-augmented generation in 2025.1, tool calling in 2025.2). Everything below reflects the module as of the latest general release; always check the [official N/llm Module reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_9123730083.html) for the newest additions.

> **Availability:** `N/llm` is only available for accounts in certain regions, and it requires the Server SuiteScript feature to be enabled (Setup > Company > Enable Features).

---

## What the module can do

| Capability | Method(s) | Notes |
|---|---|---|
| **Content generation** | `llm.generateText(options)` | Send a prompt, get a response from a supported LLM. |
| **Prompt Studio evaluation** | `llm.evaluatePrompt(options)` | Runs a saved prompt from Prompt Studio, with variable substitution. |
| **Retrieval-augmented generation (RAG)** | `options.documents` on `generateText` | Give the LLM source documents; it cites which ones it used. |
| **Embeddings** | `llm.embed(options)` | Converts text to vector embeddings for semantic search, classification, clustering. Has its own separate free-usage quota. |
| **Streaming** | `llm.generateTextStreamed(options)`, `llm.evaluatePromptStreamed(options)` | Receive the response as it's generated instead of waiting for the full reply. |
| **Tool calling** | `llm.createTool(options)` | Let the LLM request that your script run business logic (e.g. a SuiteQL lookup) and feed the result back into the response. |
| **Usage tracking** | `llm.getRemainingFreeUsage()`, `llm.getRemainingFreeEmbedUsage()` | Check your remaining free monthly requests. |

**Method aliases** — these do exactly the same thing as their counterparts, just with chat-oriented names: `llm.chat()` → `generateText()`, `llm.executePrompt()` → `evaluatePrompt()`, `llm.chatStreamed()` → `generateTextStreamed()`, `llm.executePromptStreamed()` → `evaluatePromptStreamed()`. Promise versions (`.promise()`) exist for every method above.

---

## `llm.generateText(options)` — the core method

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes* | The instruction sent to the LLM. *Not required if `toolResults` is provided instead. |
| `modelFamily` | `llm.ModelFamily` enum | No | Which model to use. Defaults to Cohere Command A (`cohere.command-a-03-2025`) if omitted. |
| `modelParameters` | Object | No | `{ temperature, maxTokens, topK, topP, frequencyPenalty, presencePenalty }` — all optional generation controls. |
| `preamble` | string | No | System-style instruction that sets the LLM's persona/tone before the prompt. |
| `documents` | `llm.Document[]` | No | Source documents for RAG (Cohere models only). Build them with `llm.createDocument(options)`. |
| `chatHistory` | `llm.ChatMessage[]` | No | Prior turns of a conversation, for multi-turn chat. |
| `responseFormat` | Object (JSON schema) | No | Forces the LLM to return structured JSON matching your schema (Cohere models only). |
| `tools` / `toolResults` | `llm.Tool[]` / `llm.ToolResult[]` | No | For tool-calling workflows — see below. |
| `safetyMode` | `llm.SafetyMode` enum | No | Defaults to `STRICT`. |
| `timeout` | number | No | Milliseconds, defaults to 30,000. |

**Governance cost:** 100 units per call (as of this writing — governance costs can change between releases, so verify against the current [SuiteScript Governance table](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4247337262.html) if you're budgeting a script's usage units).

⚠️ A common mistake (and one this repo's own earlier example made) is passing `model`, `temperature`, and `maxTokens` as flat top-level options. The current API nests generation controls under `modelParameters`, and the model selector is `modelFamily`, not `model`. Passing the old shape silently gets ignored rather than throwing, which makes the bug easy to miss in testing.

**Returns** an `llm.Response` object: `{ text, model, usage: { promptTokens, completionTokens, totalTokens }, citations, documents, chatHistory, toolCalls }`.

---

## Practical Example: Generating an Employee Bio

This example uses a User Event script to automatically generate a professional bio when an Employee record is created or edited.

**File:** [`ue_mt_llm_model.js`](./ue_mt_llm_model.js)

```javascript
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
            // Run only on CREATE and EDIT events
            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
                return;
            }

            const rec = context.newRecord;
            const employee_name = rec.getValue('name');
            const job_title = rec.getValue('custentity_job_title');
            const experience = rec.getValue('custentity_experience_summary'); // Custom field example

            // Construct a clear and specific prompt for the LLM
            const prompt = `Generate a professional bio for an employee named ${employee_name}, with job title ${job_title}, and experience: ${experience}. Keep it under 200 words.`;

            // Generate text using the default Cohere model
            const response = llm.generateText({
                modelFamily: llm.ModelFamily.COHERE_COMMAND,
                prompt: prompt,
                modelParameters: {
                    temperature: 0.7, // Controls creativity
                    maxTokens: 300    // Limit the length of the bio
                }
            });

            // Set the generated text directly into the employee's bio field
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
```

### Things worth knowing before you ship this pattern

- **Governance:** `beforeSubmit` runs on every save. At 100 governance units per `generateText` call, a high-volume record type can burn through a script's governance budget fast — consider gating the call behind a checkbox field ("Regenerate bio with AI") rather than firing on every edit.
- **Error handling:** if the LLM call fails or times out, the current code silently logs and moves on, leaving the record saved without a bio. Decide deliberately whether that's the behavior you want, or whether the save should be blocked until a bio exists.
- **Validate AI output:** generative responses are not guaranteed to be accurate. Oracle's own documentation is explicit that you, not NetSuite, are responsible for reviewing AI-generated content before it's used for anything user-facing.

---

# Connect to External AI via HTTPS

If you need to connect to LLMs that `N/llm` doesn't support natively (OpenAI, Anthropic Claude, or a specific Gemini model version, for example), you can call them directly over HTTPS with `N/https` instead.

The `Old Documentation` folder preserves the original conceptual write-up from before `N/llm` existed — kept here as a historical record of the workaround pattern, not as current-state documentation. The three files below are practical, working examples of the external-HTTPS integration pattern and remain useful whenever `N/llm`'s supported model list doesn't cover the model you need:

- [ai_cs_using_https.js](./Old%20Documentation/ai_cs_using_https.js) - Client Script example
- [ai_sl_using_https.js](./Old%20Documentation/ai_sl_using_https.js) - Suitelet example
- [ai_ue_using_https.js](./Old%20Documentation/ai_ue_using_https.js) - User Event example

### Note

In these HTTPS examples we call the `gemini-1.5-flash` model directly. Swap the model name in the endpoint URL inside the Suitelet's POST request to target a different model.

### `N/llm` vs. direct HTTPS — which should you use?

| | `N/llm` | Direct HTTPS |
|---|---|---|
| Setup | Nothing to configure beyond enabling the feature | Requires your own API key, stored as a NetSuite secret |
| Governance | Fixed governance cost per call | Governed by `N/https` call limits instead |
| Model choice | Limited to NetSuite's supported model list | Any provider/model reachable over HTTPS |
| Data handling | Stays inside Oracle's infrastructure | Leaves NetSuite — check your data-residency requirements |
| Maintenance | Oracle maintains the integration | You maintain the request/response contract yourself |

If the model you need is on NetSuite's supported list, prefer `N/llm` — it's one governance-tracked call with no key management. Reach for direct HTTPS only when you need a specific provider or model that `N/llm` doesn't expose.

## Authors

[Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) – NetSuite Developer

Feel free to connect or contribute!

Let me know if you have special focus and I'll tailor it even more!
