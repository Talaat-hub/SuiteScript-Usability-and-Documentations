# ♠ ♥ ♦ ♣ SuiteScripts Unit Testing — The Full Guide ♠ ♥ ♦ ♣

> This document might be out of date and methods can be changed in the future, but here is a step by step guide to help you get started.

---

## 1. Project Setup

Let's say you have a SuiteScript and you want to test it. Here is **exactly** what you do, step by step, as if you have never done it before.

---

### Step 1 — Create a new folder for your testing project

Open File Explorer (or your terminal) and create a new empty folder. This will be your testing project. It can be anywhere you like.

```
📁 my-netsuite-tests/           ← this is your project root
```

---

### Step 2 — Create the folder structure inside it

Inside your project folder, create **three** sub-folders:

```
📁 my-netsuite-tests/
├── 📁 src/                     ← put your SuiteScript files here
├── 📁 __tests__/               ← put your test files here
└── 📁 __mocks__/               ← put your fake N/ modules here
```

- ♠ **src/** => This is where you copy your real SuiteScript files. For example `ue_create_customer.js` or `mr_create_journal.js`. You do **not** edit them here, you only test them.

- ♥ **__tests__/** => This is where you write your test files. Each test file has the same name as the script it tests, but with `.test.js` at the end. So if your script is `ue_create_customer.js`, your test will be `ue_create_customer.test.js`.

- ♦ **__mocks__/** => This is where you put fake versions of Netsuite modules. Remember from the CookBook — Nodejs does not know what `N/record` or `N/log` is. So we create fake files that pretend to be those modules.

---

### Step 3 — Initialize the project with npm

Open a terminal inside your project folder and run:

```bash
npm init -y
```

This creates a `package.json` file. It is just a file that tracks your project's settings and what packages (tools) you have installed.

---

### Step 4 — Install Jest

```bash
npm install --save-dev jest@29.7.0 jest-environment-node@29.7.0
```

> ⚠️ **Why this specific version?** For some unknown reason, tests do not run properly on the latest version (V30+). There is also a common plugin called Babel that we cannot use because of this. **So we stick with v29.7.0 and use pure Jest, nothing more, no plugins.**

---

### Step 5 — Update your package.json scripts

Open `package.json` and make sure the `"scripts"` section looks **exactly** like this:

```json
"scripts": {
    "test": "jest --coverage --verbose",
    "coverage:badge": "npx jest --coverage && npx coveralls < coverage/lcov.info"
}
```

### What does each script do ?

- ♠ **"test": "jest --coverage --verbose"** => This is the command that runs when you type `npm test`. It does **three things** at once:
  - `jest` => runs all test files it can find (files ending in `.test.js`).
  - `--coverage` => after running the tests, it shows you a **coverage report** — a table telling you which lines of your code were tested and which were not. This is extremely important because it tells you what you missed.
  - `--verbose` => prints the **full name** of every test case (pass or fail) instead of just a summary. This makes it easier to see exactly which test passed and which failed.

- ♥ **"coverage:badge"** => This is an optional command for generating a coverage badge (for GitHub README). You don't need to worry about this one for now.

---

### Step 6 — Create jest.config.js

Create a file called `jest.config.js` in the root of your project:

```js
module.exports = {
  moduleNameMapper: {
    "^N/ui/serverWidget$": "<rootDir>/__mocks__/serverWidget.js",
    "^N/(.*)$": "<rootDir>/__mocks__/$1.js",
  },
  modulePaths: [
    "<rootDir>/src",
    "<rootDir>/__mocks__",
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**'
  ],
  coverageProvider: "v8"
};
```

### What does each line do ?

- ♠ **moduleNameMapper** => This is the **magic line**. When your SuiteScript says `define(['N/record', ...])`, Jest does not know what `N/record` is. This mapping tells Jest: "Whenever you see something starting with `N/`, go look in the `__mocks__` folder and use the fake file instead." So `N/record` becomes `__mocks__/record.js`, `N/search` becomes `__mocks__/search.js`, and so on.

- ♥ **modulePaths** => Tells Jest where to look when loading files. We point it to both `src/` (your scripts) and `__mocks__/` (your fakes).

- ♦ **collectCoverageFrom** => Tells Jest which files to measure coverage for. We say "all `.js` files inside `src/`" — this way only your SuiteScript code is measured, not the test files or mocks.

- ♣ **coverageProvider: "v8"** => Uses the V8 engine's built-in coverage tool. It is the most accurate way to count which lines ran and which did not.

> **Note:** `N/ui/serverWidget` needs its own special mapping because it has a subfolder `ui/` in the path. The generic `^N/(.*)$` pattern would look for `__mocks__/ui/serverWidget.js` (which is wrong), so we add the specific rule **first** and it takes priority.

---

### Step 7 — Add your mocks and your script

Copy the mock files you need into `__mocks__/` (we cover every mock in Section 3 of this guide), copy your SuiteScript into `src/`, create your test file in `__tests__/`, and run:

```bash
npm test
```

---

### Final folder structure should look like this:

```
📁 my-netsuite-tests/
├── 📁 src/
│   └── ue_create_customer.js           ← your SuiteScript
├── 📁 __tests__/
│   └── ue_create_customer.test.js      ← your test file
├── 📁 __mocks__/
│   ├── record.js                       ← fake N/record
│   ├── search.js                       ← fake N/search
│   ├── log.js                          ← fake N/log
│   └── ... (one file per N/ module you need)
├── jest.config.js                      ← tells Jest where things are
├── package.json                        ← project settings + scripts
└── 📁 node_modules/                    ← auto-generated by npm
```

That is it. You are ready to write tests.

---

## 2. The `__mocks__` Folder — Your Fake Netsuite

The `__mocks__` folder is the **heart** of your testing setup. Every file inside it replaces a real N/ module.

When your suitescript says `define(['N/record', 'N/search'], ...)`, Jest will load your mock files instead of trying to reach the real Netsuite server.

---

### How does Jest know which mock to use ?

The `moduleNameMapper` in `jest.config.js` does the mapping:

```
Script says:      'N/record'
                    ↓
moduleNameMapper:  ^N/(.*)$  →  <rootDir>/__mocks__/$1.js
                    ↓
Jest loads:        __mocks__/record.js
```

---

### What makes a good mock ?

A good mock has **three things**:

1. ♠ **The same functions** as the real module (but fake).
2. ♥ **Sensible defaults** so your tests don't crash on the first call.
3. ♦ **Test helpers** (functions starting with `__`) to control behavior from your tests.

---

## 3. Mock Deep-Dive — Every N/ Module Explained

Here is a walkthrough of every mock we use. Each one is a real file you will put in your `__mocks__/` folder.

---

### ♠ N/log — `__mocks__/log.js`

The simplest mock. It just records calls so you can verify your script logged the right messages.

```js
module.exports = {
    debug: jest.fn(),
    audit: jest.fn(),
    error: jest.fn(),
    emergency: jest.fn(),
};
```

**In your test:**

```js
const log = require('N/log');

// After calling your script function...
expect(log.debug).toHaveBeenCalledWith("title", "message");
```

---

### ♥ N/record — `__mocks__/record.js`

This is the most used mock. It fakes record creation, loading, saving, and sublist operations.

```js
const baseRecord = () => ({
  id: '123',
  type: 'customrecord_test',
  isDynamic: true,

  getValue: jest.fn(),
  setValue: jest.fn(),
  getText: jest.fn(),
  setText: jest.fn(),

  getLineCount: jest.fn(() => 0),
  selectNewLine: jest.fn(),
  commitLine: jest.fn(),
  removeLine: jest.fn(),
  insertLine: jest.fn(),

  getSublistValue: jest.fn(),
  setSublistValue: jest.fn(),
  setCurrentSublistValue: jest.fn(),
  getSublistText: jest.fn(),

  findSublistLineWithValue: jest.fn(() => -1),

  hasSublistSubrecord: jest.fn(() => false),
  getSublistSubrecord: jest.fn(),
  getCurrentSublistSubrecord: jest.fn(() => baseRecord()),

  save: jest.fn(() => 5555),
});

module.exports = {
  Type: {
    SALES_ORDER: 'salesorder',
    PURCHASE_REQUISITION: 'purchaserequisition'
  },
  create: jest.fn(() => baseRecord()),
  load: jest.fn(() => baseRecord()),
  submitFields: jest.fn(() => 5555),
  delete: jest.fn(),
};
```

**Key idea:** `baseRecord()` is a **factory function**. Every time you call `record.create()` or `record.load()`, you get a **fresh** mock record. This prevents tests from sharing state.

**In your test:**

```js
const record = require('N/record');

// Make getValue return what you need:
const mockRec = record.load();
mockRec.getValue.mockReturnValue('John Doe');

// Now your script will see 'John Doe' when it calls getValue
```

---

### ♦ N/search — `__mocks__/search.js`

Search is the most complex mock because `N/search` has a long chain: `create → run → getRange / each`.

```js
const mockResult = (values = {}) => ({
  id: values.id || '1',
  getValue: jest.fn((f) => values[f]),
  getText: jest.fn((f) => values[`${f}_text`]),
  columns: [],
});

module.exports = {
  Type: {
    TRANSACTION: 'transaction',
    CUSTOMER: 'customer',
    VENDOR: 'vendor', // you can add more types if needed
  },

  Operator: {
    IS: 'is',
    ANYOF: 'anyof',
    NONEOF: 'noneof',
    GREATERTHAN: 'greaterthan',
    ONORAFTER: 'onorafter',
    ONORBEFORE: 'onorbefore',
    WITHIN: 'within',
  },

  Sort: { ASC: 'ASC', DESC: 'DESC' },
  Summary: { SUM: 'SUM' },

  lookupFields: jest.fn(() => ({
    country: [{ value: '1', text: 'Egypt' }],
    currency: [{ value: '2', text: 'EGP' }]
  })),

  create: jest.fn(() => ({
    filters: [],
    columns: [],
    run: jest.fn(() => ({
      getRange: jest.fn(() => []),
      each: jest.fn((cb) => {
        cb(mockResult());
        return true;
      }),
    })),
    runPaged: jest.fn(() => ({
      count: 1,
      fetch: jest.fn(() => ({
        data: [mockResult()],
      })),
    })),
  })),

  load: jest.fn(() => ({
    filters: [],
    columns: [],
    run: jest.fn(() => ({
      getRange: jest.fn(() => []),
    })),
  })),

  createFilter: jest.fn((f) => f),
  createColumn: jest.fn((c) => c),
};
```

**Key idea:** The `mockResult` factory lets you control what a search result returns. Pass in the field values you need:

```js
const search = require('N/search');

// Make search return 2 results with specific values:
const results = [
  mockResult({ id: '101', amount: '500.00' }),
  mockResult({ id: '102', amount: '300.00' }),
];

search.create.mockReturnValue({
  run: jest.fn(() => ({
    getRange: jest.fn(() => results),
  })),
});
```

---

### ♣ N/runtime — `__mocks__/runtime.js`

Tells your script who the current user is and what context it is running in.

```js
module.exports = {
    executionContext: 'USERINTERFACE',
    ContextType: {
      USER_INTERFACE: 'USERINTERFACE',
      WEBSERVICES: 'WEBSERVICES',
      SCHEDULED: 'SCHEDULED',
    },
    getCurrentScript: jest.fn(() => ({
      getParameter: jest.fn(),
    })),
    getCurrentUser: jest.fn(() => ({
      id: '1',
      role: '3',
      name: 'Test User',
    })),
};
```

**In your test:**

```js
const runtime = require('N/runtime');

// Change the user role for a specific test:
runtime.getCurrentUser.mockReturnValue({
  id: '5',
  role: '1003',
  name: 'Admin User',
});

// Change script parameters:
runtime.getCurrentScript.mockReturnValue({
  getParameter: jest.fn(({ name }) => {
    if (name === 'custscript_limit') return 100;
    return null;
  }),
});
```

---

### ♠ N/currentRecord — `__mocks__/currentRecord.js`

Used by **Client Scripts** to access the record the user is currently editing.

```js
let recordState = {};

const currentRecord = {
  get: jest.fn(() => ({
    getValue: jest.fn((fieldId) => recordState[fieldId]),
    setValue: jest.fn(({ fieldId, value }) => {
      recordState[fieldId] = value;
    }),
    getText: jest.fn((fieldId) => recordState[fieldId]),
    setText: jest.fn(({ fieldId, text }) => {
      recordState[fieldId] = text;
    }),
    getField: jest.fn((fieldId) => ({
      id: fieldId,
      isDisabled: false,
      isDisplay: true,
    })),
  })),

  __setValue: (fieldId, value) => {
    recordState[fieldId] = value;
  },
  __getState: () => ({ ...recordState }),
  __reset: () => {
    recordState = {};
    jest.clearAllMocks();
  },
};

module.exports = currentRecord;
```

**Key idea:** `recordState` is a simple object that acts like a mini database. The `__setValue` helper lets you pre-load field values before your test runs.

---

### ♥ N/ui/serverWidget — `__mocks__/serverWidget.js`

Used by **Suitelets** to create forms with fields, sublists, and buttons.

```js
module.exports = {
    FieldType: {
      TEXT: 'text', SELECT: 'select', CHECKBOX: 'checkbox',
      DATE: 'date', FLOAT: 'float', INLINEHTML: 'inlinehtml',
    },
    FieldDisplayType: {
      NORMAL: 'normal', DISABLED: 'disabled',
      HIDDEN: 'hidden', READONLY: 'readonly',
    },
    SublistType: {
      LIST: 'list',
      INLINEEDITOR: 'inlineeditor',
    },
    createForm: jest.fn(() => ({
      addField: jest.fn(() => ({
        updateDisplayType: jest.fn(),
        isMandatory: false,
        defaultValue: null,
      })),
      addSublist: jest.fn(() => ({
        addField: jest.fn(() => ({
          updateDisplayType: jest.fn(),
        })),
        addButton: jest.fn(),
        setSublistValue: jest.fn(),
      })),
      addSubmitButton: jest.fn(),
      addButton: jest.fn(),
      clientScriptModulePath: null,
    })),
};
```

---

### ♦ N/http — `__mocks__/http.js`

Used for external API calls. Has **test helpers** to control responses and simulate errors.

```js
let mockConfig = {
  response: { code: 200, body: '{}', headers: {} },
  throwError: null,
};

const httpMethod = jest.fn(() => {
  if (mockConfig.throwError) throw mockConfig.throwError;
  return {
    code: mockConfig.response.code,
    body: mockConfig.response.body,
    headers: mockConfig.response.headers,
  };
});

module.exports = {
  get: httpMethod,
  post: httpMethod,
  put: httpMethod,
  delete: httpMethod,
  request: httpMethod,

  __setMockResponse: (response) => {
    mockConfig.response = { ...mockConfig.response, ...response };
  },
  __throwError: (error) => { mockConfig.throwError = error; },
  __reset: () => {
    mockConfig = { response: { code: 200, body: '{}', headers: {} }, throwError: null };
  },
};
```

**In your test:**

```js
const http = require('N/http');

// Simulate an API returning customer data:
http.__setMockResponse({
  code: 200,
  body: JSON.stringify({ name: 'John', status: 'active' }),
});

// Simulate a timeout/error:
http.__throwError(new Error('Connection timed out'));

// Always reset after each test:
afterEach(() => { http.__reset(); });
```

---

### ♣ N/render — `__mocks__/render.js`

Used for PDF generation and template rendering.

```js
module.exports = {
    create: jest.fn(() => ({
        setTemplateById: jest.fn(),
        setTemplateByScriptId: jest.fn(),
        addRecord: jest.fn(),
        addCustomDataSource: jest.fn(),
        renderAsPdf: jest.fn(() => ({
            name: 'mock.pdf',
            fileType: 'PDF',
            getContents: jest.fn(() => 'PDF_BINARY_CONTENT')
        })),
        renderAsString: jest.fn(() => '<pdf>Mock PDF Content</pdf>')
    })),
    xmlToPdf: jest.fn(({ xmlString }) => ({
        name: 'mock.pdf',
        fileType: 'PDF',
        getContents: jest.fn(() => xmlString)
    })),
    RenderType: { PDF: 'PDF', HTML: 'HTML' },
    DataSource: { OBJECT: 'OBJECT', RECORD: 'RECORD', FILE: 'FILE' },
};
```

---

### ♠ N/ui/dialog — `__mocks__/dialogue.js`

Used by Client Scripts for alert/confirm/prompt popups. Returns **Promises** just like the real module.

```js
let dialogResponse = { confirm: true, prompt: 'ok' };

module.exports = {
  alert: jest.fn(() => Promise.resolve()),
  confirm: jest.fn(() => Promise.resolve(dialogResponse.confirm)),
  prompt: jest.fn(() => Promise.resolve({ value: dialogResponse.prompt })),

  __setConfirm: (val) => { dialogResponse.confirm = val; },
  __setPrompt: (val) => { dialogResponse.prompt = val; },
  __reset: () => {
    dialogResponse = { confirm: true, prompt: 'ok' };
    jest.clearAllMocks();
  },
};
```

---

### ♥ N/error — `__mocks__/error.js`

Creates custom SuiteScript errors.

```js
module.exports = {
    create: jest.fn(({ name, message }) => {
      const err = new Error(message);
      err.name = name;
      return err;
    }),
};
```

---

### ♦ N/config — `__mocks__/config.js`

Reads company/account configuration like subsidiary settings.

```js
let configState = {
  companyinformation: {},
  accountingpreferences: {},
};

module.exports = {
  load: jest.fn(({ type }) => ({
    type,
    getValue: jest.fn(({ fieldId }) => configState[type]?.[fieldId]),
    save: jest.fn(() => true),
  })),
  Type: {
    COMPANY_INFORMATION: 'companyinformation',
    ACCOUNTING_PREFERENCES: 'accountingpreferences',
  },
  __setValue: (type, fieldId, value) => {
    if (!configState[type]) configState[type] = {};
    configState[type][fieldId] = value;
  },
  __reset: () => {
    configState = { companyinformation: {}, accountingpreferences: {} };
    jest.clearAllMocks();
  },
};
```

---

### ♣ N/query — `__mocks__/query.js`

For SuiteQL queries.

```js
const mockQueryResult = {
    asMappedResults: jest.fn(() => []),
    iterator: jest.fn(() => ({ each: jest.fn() })),
};

module.exports = {
    runSuiteQL: jest.fn(() => mockQueryResult),
    runSuiteQLPaged: jest.fn(() => ({
      count: 0,
      iterator: jest.fn(),
    })),
    create: jest.fn(() => ({
      run: jest.fn(() => mockQueryResult),
    })),
};
```

---

### Other Mocks (Smaller Modules)

These follow the same pattern — simple `jest.fn()` wrappers:

| Module | What it mocks |
|--------|--------------|
| `N/format` | `parse()` and `format()` — just returns the value back |
| `N/file` | `create()` and `load()` — for File Cabinet operations |
| `N/url` | `resolveScript()` and `resolveRecord()` — returns fake URLs |
| `N/redirect` | `toRecord()`, `toSuitelet()`, `toTaskLink()` |
| `N/task` | `create()` with `submit()` — for triggering Map/Reduce or Scheduled scripts |
| `N/encode` | `encode()`, `decode()`, `convert()` — actually does real Base64 in the mock |
| `N/cache` | `getCache()` returning `get`, `put`, `remove` |
| `N/message` | `create()` returning an object with `show()` |
| `N/https` | Same as `N/http` but for secure calls |

---

## 4. Two Ways to Load a SuiteScript Into Jest

SuiteScripts use AMD (`define([...], function(){...})`), and Jest does not understand AMD. So we need to **trick** Jest into loading the script.

There are **two ways** to do this. We tried both. One of them we kept, the other we abandoned. We will clarify why.

---

### Strategy 1 — jest.mock + global.define

This is the approach we use for **all** of our testing. It gives us **full code coverage**, meaning Jest can tell us exactly which lines we tested and which we missed.

**How does it work?**

The idea is simple:

1. We tell Jest to mock the N/ modules using `jest.mock('N/search')` etc.
2. We create a **fake `define` function** and attach it to `global` — meaning it becomes available everywhere.
3. When Jest loads our SuiteScript using `require(...)`, the script calls `define(...)`, which hits our fake define.
4. Our fake define takes the factory function, runs it with our mocked modules, and gives us back the exported entry points.

**Here is an example — testing a Map/Reduce script:**

```js
// __tests__/mr_create_trans.test.js

// Step 1: Tell Jest to mock these N/ modules
jest.mock('N/search');
jest.mock('N/record');
jest.mock('N/format');
jest.mock('N/runtime');

// Step 2: Import the mocked modules so we can control them in tests
const search = require('N/search');
const record = require('N/record');
const format = require('N/format');
const runtime = require('N/runtime');

// Step 3: Declare variables to hold the script's entry points
let getInputData, map, reduce, summarize;

// Step 4: Create a fake log object (since log is a global in Netsuite, not an N/ module)
const logMock = {
    audit: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
};

// Step 5: Setup — runs once before ALL tests
beforeAll(() => {
    // Create our fake AMD define function
    global.define = (deps, factory) => {
        // Call the factory with our mocked modules
        const module = factory(search, record, format, runtime);
        // Store the entry points so we can call them in tests
        getInputData = module.getInputData;
        map = module.map;
        reduce = module.reduce;
        summarize = module.summarize;
    };
    // Make log available globally (just like Netsuite does)
    global.log = logMock;
    // Load the script — this triggers define(), which runs our fake
    require("../src/mr_create_trans_all_scenarios_dmo_Version2");
});

// Step 6: Clear mock history before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Step 7: Write your tests!
describe('Tests', () => {
    test('should return search object from getInputData', () => {
        const result = getInputData();
        expect(result).toBeDefined();
    });
    // ... more tests
});
```

---

### Let's break down every single line:

**`jest.mock('N/search');`** => This tells Jest: "When the script tries to load `N/search`, don't load the real one — use the fake version from our `__mocks__/search.js` file." We repeat this for every N/ module the script uses.

**`const search = require('N/search');`** => This loads the **mocked** version into our test file. Now we have a reference to it, so we can control what it returns. For example, we can say `search.create.mockReturnValue(...)` to control search results.

**`let getInputData, map, reduce, summarize;`** => These are empty variables. We will fill them with the script's functions after the script loads. We use `let` because they start as `undefined` and get assigned later inside `beforeAll`.

**`const logMock = { ... }`** => In Netsuite, `log` is a **global** — it is not an N/ module that you import. It is just available everywhere. So we create a fake log object with `jest.fn()` functions, and we will attach it to `global.log` so the script can use it.

**`beforeAll(() => { ... })`** => This block runs **once** before any test starts. Inside it:

- **`global.define = (deps, factory) => { ... }`** => We create our fake AMD `define` function and attach it to `global`. When the SuiteScript is loaded, it calls `define(['N/search', 'N/record', ...], function(search, record, ...) { ... })`. Our fake define intercepts this call, takes the factory function, and runs it with our mocked modules.

- **`const module = factory(search, record, format, runtime);`** => We call the factory function with our mocks. The factory runs the script code and returns an object with the entry points (like `{ getInputData, map, reduce, summarize }`).

- **`getInputData = module.getInputData;`** => We store each entry point in our variables so we can call them in our tests.

- **`global.log = logMock;`** => We make our fake log available globally.

- **`require("../src/my_script");`** => This loads the SuiteScript. When it loads, it calls `define(...)`, which triggers our fake define, which extracts the functions. After this line, `getInputData`, `map`, `reduce`, and `summarize` are ready to use.

**`beforeEach(() => { jest.clearAllMocks(); })`** => Before **every single test**, we wipe all mock call history clean. This is crucial — without it, mock calls from previous tests carry over and your `toHaveBeenCalledTimes(1)` will fail because the mock was also called in the previous test.

---

### Same pattern works for every script type:

For a **User Event** script:

```js
let beforeSubmit, afterSubmit;

beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(search, record, runtime);
        beforeSubmit = module.beforeSubmit;
        afterSubmit = module.afterSubmit;
    };
    global.log = logMock;
    require("../src/ue_create_customer");
});
```

For a **Client Script:**

```js
let pageInit, fieldChanged, saveRecord;

beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(currentRecord, runtime, dialog);
        pageInit = module.pageInit;
        fieldChanged = module.fieldChanged;
        saveRecord = module.saveRecord;
    };
    global.log = logMock;
    require("../src/cs_validate_fields");
});
```

For a **Suitelet:**

```js
let onRequest;

beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(serverWidget, search, record, runtime);
        onRequest = module.onRequest;
    };
    global.log = logMock;
    require("../src/sl_print_report");
});
```

**The pattern is always the same.** Only the entry point names and the mocked modules change.

---

### Why do we use this approach ?

**Because it gives us code coverage.** When you run `npm test`, Jest shows you exactly which lines were executed and which were not. This is how we know what to test next. Without coverage, you are testing blind.

---

### Strategy 2 — VM Sandbox (not preferred)

This is the approach, we use `require('vm')`. We used it initially.

**What was it?**

Instead of using `jest.mock(...)` and `require(...)`, we manually read the script file, created an isolated sandbox environment using Node's `vm` module, and executed the script inside that sandbox.

```js
// The VM Sandbox approach:
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.resolve(__dirname, '../src/ue_script.js');

beforeAll(() => {
    sandbox = {
        console,
        module: { exports: {} },
        exports: {},
        require: require,
        log: logMock,
        define: function(deps, factory) {
            const resolved = deps.map((d) => {
                switch (d) {
                    case 'N/record': return recordMock;
                    case 'N/search': return searchMock;
                    default: return {};
                }
            });
            sandbox.module.exports = factory.apply(null, resolved) || {};
        }
    };

    const code = fs.readFileSync(filePath, 'utf8');
    const context = vm.createContext(sandbox);
    const script = new vm.Script(code, { filename: filePath });
    script.runInContext(context);

    exported = sandbox.module.exports;
});
```

**Why we don't recommend it?**

Because the VM sandbox runs the script in a **completely isolated environment**. Jest's coverage tool cannot see inside that sandbox. So when you run `npm test`, the coverage report shows **0%** for the script file — even though your tests are actually testing the code.

**Without coverage, you cannot tell:**
- Which lines you tested ❌
- Which branches you missed ❌
- Which catch blocks were never triggered ❌
- How close you are to being done ❌

Coverage is **essential**. It is how we know what to test next. So we switched to Strategy 1.

---

### Comparison :

| Feature | jest.mock + global.define  | VM Sandbox  |
|---------|------------------------------|---------------|
| Code coverage works? | ✅ **YES** | ❌ No (shows 0%) |
| Shows uncovered lines? | ✅ YES | ❌ No |
| Easy to set up? | ✅ Simple | ❌ More complex |
| Full mock control? | ✅ YES | ✅ YES |
| Need `fs`, `path`, `vm`? | ❌ Not needed | ✅ Required |
| Can read the script file? | Via require() | Manually via fs |

**Bottom line:** Use `jest.mock + global.define`. It is simpler **and** gives you coverage. The VM sandbox is a good to know approach, but it is not worth the trade-off.

---

## 5. Writing Your First Test

Let's test a **User Event** script step by step using our approach (jest.mock + global.define).

Here is the script we want to test:

```js
// src/ue_create_customer.js
define(['N/record', 'N/log'], function(record, log) {
    function beforeSubmit(context) {
        try {
            var rec = context.newRecord;
            var name = rec.getValue({ fieldId: 'companyname' });

            if (!name) {
                throw new Error('Company name is required');
            }

            log.debug('beforeSubmit', 'Customer name: ' + name);

        } catch (e) {
            log.error('beforeSubmit error', e.message);
            throw e;
        }
    }

    return { beforeSubmit: beforeSubmit };
});
```

---

### Now let's write the test:

```js
// __tests__/ue_create_customer.test.js

// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/record');
jest.mock('N/log');

// ---- STEP 2: Import the mocked modules ----
const record = require('N/record');
const log = require('N/log');

// ---- STEP 3: Declare entry point variables ----
let beforeSubmit;

// ---- STEP 4: Create a fake log for the global scope ----
const logMock = {
    audit: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
};

// ---- STEP 5: Load the script ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(record, log);
        beforeSubmit = module.beforeSubmit;
    };
    global.log = logMock;
    require('../src/ue_create_customer');
});

// ---- STEP 6: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
});

// ---- STEP 7: Write the tests! ----
describe('ue_create_customer => beforeSubmit', () => {

    test('♠ should log the company name when it exists', () => {
        // Arrange: create a fake context object
        const context = {
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'companyname') return 'Acme Solutions';
                    return null;
                }),
            },
        };

        // Act: call the function
        beforeSubmit(context);

        // Assert: check what happened
        expect(log.debug).toHaveBeenCalledWith(
            'beforeSubmit',
            'Customer name: Acme Solutions'
        );
    });

    test('♥ should throw error when company name is empty', () => {
        const context = {
            newRecord: {
                getValue: jest.fn(() => ''), // empty string is falsy
            },
        };

        expect(() => beforeSubmit(context)).toThrow('Company name is required');
    });

    test('♦ should log the error when company name is missing', () => {
        const context = {
            newRecord: {
                getValue: jest.fn(() => null),
            },
        };

        try {
            beforeSubmit(context);
        } catch (e) {
            // expected to throw
        }

        expect(log.error).toHaveBeenCalledWith(
            'beforeSubmit error',
            'Company name is required'
        );
    });

});
```

Notice how we call `beforeSubmit(context)` directly — not `exported.beforeSubmit(context)`. That is because we stored it in a simple variable during the `beforeAll` setup. Much cleaner.

---

### The Pattern — Arrange, Act, Assert

Every test follows this 3-step structure:

1. ♠ **Arrange** => set up your data and mocks (create the fake context, set return values).
2. ♥ **Act** => call the function you are testing.
3. ♦ **Assert** => check what happened (did it log? did it throw? did it create a record?).

---

## 6. Testing Every Script Type

Each SuiteScript type has its own entry points and context objects. Here is how to test each one.

---

### ♠ User Event (UE) Scripts

Entry points: `beforeLoad`, `beforeSubmit`, `afterSubmit`

```js
// The context object for User Event scripts:
const context = {
    newRecord: mockRecord,    // The record being saved
    oldRecord: mockOldRecord, // The record before changes (for edit)
    type: 'create',           // 'create', 'edit', 'delete', 'copy'
};

exported.beforeSubmit(context);
exported.afterSubmit(context);
```

**Testing beforeLoad (adds fields to the form):**

```js
const serverWidget = require('N/ui/serverWidget');

const context = {
    newRecord: mockRecord,
    type: 'view',
    form: serverWidget.createForm({ title: 'Test' }),
};

exported.beforeLoad(context);

expect(context.form.addField).toHaveBeenCalled();
```

---

### ♥ Client Scripts (CS)

Entry points: `pageInit`, `fieldChanged`, `saveRecord`, `validateLine`, `postSourcing`, `lineInit`, `sublistChanged`

```js
// pageInit context:
const context = {
    currentRecord: {
        getValue: jest.fn(),
        setValue: jest.fn(),
        getLineCount: jest.fn(() => 3),
    },
    mode: 'create', // or 'edit', 'copy'
};

exported.pageInit(context);
```

```js
// fieldChanged context:
const context = {
    currentRecord: mockRecord,
    fieldId: 'custbody_status',
    sublistId: null,
    line: null,
};

exported.fieldChanged(context);

// Check if the script set another field when status changed:
expect(mockRecord.setValue).toHaveBeenCalledWith({
    fieldId: 'custbody_date',
    value: expect.anything(),
});
```

```js
// saveRecord must return true or false:
const context = {
    currentRecord: {
        getValue: jest.fn(() => 'valid value'),
    },
};

const result = exported.saveRecord(context);

expect(result).toBe(true); // Script allows save
```

---

### ♦ Suitelet (SL) Scripts

Entry point: `onRequest`

```js
// GET request:
const context = {
    request: {
        method: 'GET',
        parameters: { custparam_id: '123' },
    },
    response: {
        write: jest.fn(),
        writePage: jest.fn(),
        writeFile: jest.fn(),
        setHeader: jest.fn(),
    },
};

exported.onRequest(context);

// Check that the Suitelet wrote something to the page:
expect(context.response.writePage).toHaveBeenCalled();
```

```js
// POST request:
const context = {
    request: {
        method: 'POST',
        parameters: { custparam_action: 'submit' },
        getLineCount: jest.fn(() => 2),
        getSublistValue: jest.fn(),
    },
    response: {
        write: jest.fn(),
        sendRedirect: jest.fn(),
    },
};

exported.onRequest(context);
```

---

### ♣ Map/Reduce (MR) Scripts

Entry points: `getInputData`, `map`, `reduce`, `summarize`

```js
// getInputData — returns a search or an array:
const inputData = exported.getInputData();
expect(inputData).toBeDefined();
```

```js
// map — receives a context with key, value, and write function:
const context = {
    key: '101',
    value: JSON.stringify({
        id: '101',
        values: { amount: '500.00', entity: 'Customer A' }
    }),
    write: jest.fn(),
};

exported.map(context);

expect(context.write).toHaveBeenCalledWith({
    key: expect.any(String),
    value: expect.any(String),
});
```

```js
// reduce — receives grouped values:
const context = {
    key: 'GROUP_A',
    values: [
        JSON.stringify({ amount: 500 }),
        JSON.stringify({ amount: 300 }),
    ],
    write: jest.fn(),
};

exported.reduce(context);
```

```js
// summarize — checks for errors:
const context = {
    inputSummary: { error: null },
    mapSummary: {
        errors: {
            iterator: jest.fn(() => ({ each: jest.fn() })),
        },
    },
    reduceSummary: {
        errors: {
            iterator: jest.fn(() => ({ each: jest.fn() })),
        },
    },
    output: {
        iterator: jest.fn(() => ({ each: jest.fn() })),
    },
};

exported.summarize(context);
```

---

### ♠ Scheduled Script (SS)

Entry point: `execute`

```js
const context = {
    type: 'SCHEDULED', // or 'ON_DEMAND'
};

exported.execute(context);

// Verify the script did its work:
expect(recordMock.submitFields).toHaveBeenCalled();
```

---

### ♥ Restlet (RL)

Entry points: `get`, `post`, `put`, `delete` (matching HTTP methods)

```js
// GET request:
const requestParams = { id: '123' };
const result = exported.get(requestParams);

expect(result).toEqual({ status: 'success', data: expect.anything() });
```

```js
// POST request with body:
const requestBody = { name: 'New Customer', email: 'test@test.com' };
const result = exported.post(requestBody);

expect(recordMock.create).toHaveBeenCalled();
```

---

## 7. Advanced Patterns

These are the real-world challenges you will face when testing complex scripts.

---

### ♠ Testing N/search Chains

Most scripts create a search, run it, and loop through results. Here is how to mock the whole chain:

```js
const search = require('N/search');

// Create mock results:
const mockResults = [
    { id: '1', getValue: jest.fn((f) => f === 'amount' ? '100' : null) },
    { id: '2', getValue: jest.fn((f) => f === 'amount' ? '200' : null) },
];

// Mock the full chain: create → run → getRange
search.create.mockReturnValue({
    filters: [],
    columns: [],
    run: jest.fn(() => ({
        getRange: jest.fn(() => mockResults),
    })),
});

// Now call your script — it will get these results
exported.afterSubmit(context);

// Verify the search was created with correct parameters:
expect(search.create).toHaveBeenCalledWith({
    type: 'transaction',
    filters: expect.any(Array),
    columns: expect.any(Array),
});
```

---

### ♥ Testing search.create → run → each (Iterator Pattern)

Some scripts use `.each()` instead of `.getRange()`:

```js
// .each() calls a callback for each result, returning true to continue
search.create.mockReturnValue({
    run: jest.fn(() => ({
        each: jest.fn((callback) => {
            // Simulate iterating through 3 results:
            callback({ id: '1', getValue: jest.fn(() => 'A') });
            callback({ id: '2', getValue: jest.fn(() => 'B') });
            callback({ id: '3', getValue: jest.fn(() => 'C') });
            return true;
        }),
    })),
});
```

---

### ♦ Testing N/record Sublist Loops

Many scripts loop through sublist lines. Here is how to mock them:

```js
const mockRec = {
    getLineCount: jest.fn(() => 3), // 3 lines in the sublist

    getSublistValue: jest.fn(({ sublistId, fieldId, line }) => {
        const data = [
            { item: 'Widget A', quantity: '5', rate: '10.00' },
            { item: 'Widget B', quantity: '3', rate: '20.00' },
            { item: 'Widget C', quantity: '1', rate: '50.00' },
        ];
        return data[line]?.[fieldId] || '';
    }),

    getValue: jest.fn(),
    setValue: jest.fn(),
    save: jest.fn(() => 999),
};

const context = { newRecord: mockRec };

exported.beforeSubmit(context);
```

---

### ♣ Testing Error / Catch Blocks

To test that your script handles errors properly, make a mock **throw**:

```js
test('should handle record.load failure', () => {
    // Make record.load throw an error:
    recordMock.load.mockImplementation(() => {
        throw new Error('Record not found');
    });

    // Call the function — it should catch the error, not crash:
    exported.afterSubmit(context);

    // Verify the error was logged:
    expect(logMock.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Record not found')
    );
});
```

---

### ♠ Testing Async Dialogs (Client Scripts)

Dialog calls return Promises, so use `async/await`:

```js
const dialog = require('N/ui/dialog');

test('should show confirm dialog and proceed when user clicks OK', async () => {
    dialog.__setConfirm(true); // User clicks "OK"

    await exported.saveRecord(context);

    expect(dialog.confirm).toHaveBeenCalled();
});

test('should cancel when user clicks No', async () => {
    dialog.__setConfirm(false); // User clicks "Cancel"

    const result = await exported.saveRecord(context);

    expect(result).toBe(false); // Script prevents save
});
```

---

### ♥ Testing HTTP Calls

```js
const http = require('N/http');

test('should handle successful API response', () => {
    http.__setMockResponse({
        code: 200,
        body: JSON.stringify({ status: 'ok', customerId: '555' }),
    });

    exported.afterSubmit(context);

    expect(http.post).toHaveBeenCalled();
});

test('should handle API failure', () => {
    http.__throwError(new Error('Timeout'));

    exported.afterSubmit(context);

    expect(logMock.error).toHaveBeenCalled();
});

afterEach(() => { http.__reset(); });
```

---

## 8. Code Coverage

Code coverage tells you **what percentage of your code is actually executed during tests**. It is the whole point of unit testing.

---

### How to run coverage:

```bash
npx jest --coverage
```

Or using the npm script we defined:

```bash
npm run test:coverage
```

---

### Reading the report:

Jest prints a table like this:

```
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-------------------
ue_script.js  |   85.71 |    66.67 |     100 |   85.71 | 31-32,45
--------------|---------|----------|---------|---------|-------------------
```

- ♠ **% Stmts** => what percentage of statements were executed.
- ♥ **% Branch** => what percentage of if/else branches were taken.
- ♦ **% Funcs** => what percentage of functions were called.
- ♣ **% Lines** => what percentage of lines were executed.
- **Uncovered Lines** => these are the lines you still need to test.

---

### What do the percentages mean ?

| Coverage | Status |
|----------|--------|
| 90-100%  | ✅ Excellent — you tested almost everything |
| 70-89%   | ⚠️ Good — but missing some branches or error paths |
| 50-69%   | ❌ Needs work — important logic might be untested |
| Below 50%| 🚨 Danger — most of your code is untested |

---

### How to target uncovered lines ?

1. Look at the **Uncovered Line #s** column.
2. Open your source file and find those lines.
3. They are usually inside an `if` branch, a `catch` block, or a default case.
4. Write a test that forces the code to take that path.

**Example:** If line 31 is `} catch (e) { log.error('oops', e); }`, you need a test that makes something **throw** so the catch block runs.

---

## 9. Tips, Gotchas & Best Practices

---

### ♠ Always use `jest.clearAllMocks()` in `beforeEach`

```js
beforeEach(() => {
    jest.clearAllMocks();
});
```

**Why?** Without this, mock call counts from the previous test carry over. Your `toHaveBeenCalledTimes(1)` will fail because the mock was also called in a previous test.

---

### ♥ Never modify the source SuiteScript

The whole point of testing is to verify the code **as it is**. If you change the script to make it testable, you are not testing the real code anymore. Instead, write smarter mocks.

---

### ♦ Use `__reset()` helpers for stateful mocks

Mocks like `N/http`, `N/ui/dialog`, `N/currentRecord`, and `N/config` have internal state. Always reset them:

```js
afterEach(() => {
    http.__reset();
    dialog.__reset();
    currentRecord.__reset();
    config.__reset();
});
```

---

### ♣ Use `mockReturnValue` vs `mockImplementation`

```js
// mockReturnValue — simple, returns the same thing every time:
mockFn.mockReturnValue('hello');

// mockImplementation — complex, runs logic:
mockFn.mockImplementation((arg) => {
    if (arg === 'name') return 'John';
    if (arg === 'age') return 30;
    return null;
});
```

---

### ♠ Use `mockReturnValueOnce` for sequential calls

```js
// First call returns 'A', second returns 'B':
mockFn.mockReturnValueOnce('A').mockReturnValueOnce('B');
```

This is useful when your script calls the same function multiple times with different expected results.

---

### ♥ Testing functions that are NOT exported

Some scripts have helper functions inside the `define` block that are not returned. You **cannot call them directly**, but you can test them **indirectly** by calling the exported function that uses them.

```js
// If your script has:
define(['N/record'], function(record) {
    function helperFn(data) { /* internal logic */ }  // NOT exported

    function afterSubmit(ctx) {
        var result = helperFn(ctx.newRecord);  // uses the helper
        // ...
    }

    return { afterSubmit: afterSubmit };
});

// You test helperFn by testing afterSubmit with different inputs
// that exercise different paths inside helperFn.
```

---

### ♦ Use `expect.objectContaining` for partial matches

```js
// You don't need to match EVERY property, just the important ones:
expect(record.create).toHaveBeenCalledWith(
    expect.objectContaining({
        type: 'salesorder',
    })
);
```

---

### ♣ Use `expect.any(Type)` for dynamic values

```js
// When the value changes every time (like a date or ID):
expect(logMock.debug).toHaveBeenCalledWith(
    'Created record',
    expect.any(Number)
);
```

---

## 10. Automated Testing with GitHub Actions (CI/CD)

Once your tests are passing locally, the next logical step is to make sure they run **automatically** whenever you or a teammate pushes code. This ensures broken code never makes it to production.

This concept is called **Continuous Integration (CI)**, and in GitHub, it is handled by **GitHub Actions**.

---

### What is `.github/workflows/test.yml`?

In GitHub, a workflow is a set of automated instructions. You create a YAML file inside `.github/workflows/` at the very root of your repository, and GitHub will read it and execute the commands.

Here is the exact file we use to automate our SuiteScript tests:

```yaml
name: Run SuiteScript Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install
        working-directory: "./Unit Testing"

      - name: Run tests with coverage
        run: npm test
        working-directory: "./Unit Testing"

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: "Unit Testing/coverage/"
```

---

### How does this file work step-by-step?

1. ♠ **`on: push` & `pull_request`**
   This is the "trigger". It tells GitHub: *Whenever someone pushes code directly to the `main` branch, or opens a Pull Request proposing to merge into `main`, run this workflow immediately.*

2. ♥ **`runs-on: ubuntu-latest`**
   GitHub spins up a brand new, empty, virtual Linux server (an Ubuntu machine) in the cloud specifically for your test run. 

3. ♦ **`actions/checkout@v4`**
   The virtual machine is empty, so this step clones your NetSuite repository onto the machine so the tests have the code to run against.

4. ♣ **`actions/setup-node@v4`**
   This installs Node.js (Version 18) on the virtual machine, which is required to run Jest and our mocks.

5. ♠ **`npm install`**
   This command looks into your directory, reads `package.json`, and installs Jest and its dependencies. (Note: `working-directory` is used because our tests are inside a 'Unit Testing' subdirectory, not the very root of the repo).

6. ♥ **`npm test`**
   This runs the exact same test script you run locally. If your tests pass, it prints the coverage table. **If any test fails, the command exits with an error (Exit code 1).**

7. ♦ **`actions/upload-artifact@v4`**
   Finally, it takes the coverage report generated by Jest and uploads it to GitHub so you can download it and view it later as an artifact.

---

### What happens when a test fails?

If a unit test fails (for example, if you introduce a bug that breaks a previously working customer validation script), the `npm test` step crashes. 

When this happens on GitHub Actions:
- The whole workflow stops immediately.
- A **Red X** ❌ appears next to your commit in GitHub.
- If this was a Pull Request, GitHub can be configured to **block the merge button**, forcing you to fix the code before merging it into `main`.

This is the ultimate safety net!

---

## 11. Cheat Sheet ♠ ♥ ♦ ♣

### Jest Core

| Command | What it does |
|---------|-------------|
| `npx jest` | Run all tests |
| `npx jest --coverage` | Run tests + coverage report |
| `npx jest myfile.test.js` | Run one specific test file |
| `npx jest --watch` | Re-run tests on file changes |

---

### Test Structure

| Function | Purpose |
|----------|---------|
| `describe("name", fn)` | Group related tests |
| `test("name", fn)` | One test case |
| `it("name", fn)` | Alias for `test` |
| `beforeAll(fn)` | Run once before ALL tests |
| `beforeEach(fn)` | Run before EACH test |
| `afterEach(fn)` | Run after EACH test |
| `afterAll(fn)` | Run once after ALL tests |

---

### Matchers

| Matcher | Use for |
|---------|---------|
| `.toBe(value)` | Primitive comparison (numbers, strings, booleans) |
| `.toEqual(value)` | Object / array deep comparison |
| `.toBeTruthy()` | Checks if value is truthy |
| `.toBeFalsy()` | Checks if value is falsy |
| `.toBeDefined()` | Checks if not `undefined` |
| `.toBeNull()` | Checks if `null` |
| `.toContain(item)` | Array contains item |
| `.toThrow()` | Function throws an error |
| `.toThrow('msg')` | Function throws error with specific message |
| `.toHaveLength(n)` | Array or string length |
| `.toBeGreaterThan(n)` | Number comparison |
| `.toMatch(/regex/)` | String matches regex |

---

### Mock Functions

| Method | Purpose |
|--------|---------|
| `jest.fn()` | Create a mock function |
| `jest.fn(() => value)` | Create a mock that returns a value |
| `.mockReturnValue(val)` | Always return this value |
| `.mockReturnValueOnce(val)` | Return this value once, then default |
| `.mockImplementation(fn)` | Replace with custom logic |
| `.mockImplementationOnce(fn)` | Custom logic for next call only |
| `.mockResolvedValue(val)` | Return `Promise.resolve(val)` |
| `.mockRejectedValue(val)` | Return `Promise.reject(val)` |

---

### Mock Assertions

| Assertion | Checks that... |
|-----------|----------------|
| `.toHaveBeenCalled()` | Function was called at least once |
| `.toHaveBeenCalledTimes(n)` | Function was called exactly n times |
| `.toHaveBeenCalledWith(args)` | Function was called with specific args |
| `.toHaveBeenLastCalledWith(args)` | Last call had these args |
| `.toHaveBeenNthCalledWith(n, args)` | Nth call had these args |

---

### Partial Matchers

| Matcher | Use for |
|---------|---------|
| `expect.any(String)` | Any string value |
| `expect.any(Number)` | Any number value |
| `expect.any(Object)` | Any object |
| `expect.anything()` | Any value except null/undefined |
| `expect.objectContaining({})` | Object has at least these properties |
| `expect.arrayContaining([])` | Array has at least these items |
| `expect.stringContaining('x')` | String includes this substring |

---

### Test Helpers

| Method | Purpose |
|--------|---------|
| `jest.clearAllMocks()` | Reset all mock call history |
| `jest.resetAllMocks()` | Reset call history + remove implementations |
| `jest.restoreAllMocks()` | Reset + restore originals (for spies) |

---

### Project Files Quick Reference

| File | Location | Purpose |
|------|----------|---------|
| `jest.config.js` | Root | Maps `N/` imports to mocks |
| `package.json` | Root | Dependencies + test scripts |
| `__mocks__/*.js` | Root | One mock per N/ module |
| `src/*.js` | Root | SuiteScript source files |
| `__tests__/*.test.js` | Root | Test files |

---

## That's Everything ♠ ♥ ♦ ♣

You now know:

1. ♠ How to set up a project from scratch
2. ♥ How every mock works and why it exists
3. ♦ How to test every SuiteScript type (UE, CS, SL, MR, SS, RL)
4. ♣ How to handle advanced scenarios (search chains, sublists, errors, async dialogs, HTTP)
5. ♠ How to read and improve code coverage
6. ♥ Tips and tricks to avoid common pitfalls

## Authors

[Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) – NetSuite Developer

Feel free to connect or contribute!

Let me know if you have special focus and I’ll tailor it even more!