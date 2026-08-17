# SuiteScript Usability and Documentations

Welcome to the **SuiteScript Usability and Documentations** repository! This repository provides an extensive collection of utilities, documentation, and testing frameworks designed to enhance your NetSuite SuiteScript development experience.

---

## 🌟 What This Repository Offers

Whether you are building simple automations or complex enterprise integrations, this repository provides:

1. **Utility Functions**: Reusable, reliable helper functions that reduce code redundancy and speed up development across SuiteScripts (2.0 and 2.1).
2. **Comprehensive Documentations**: Conceptual and practical guides to integrating Large Language Models (LLMs), managing SuiteCloud Development Framework (SDF), and configuring VS Code with modern snippets.
3. **Robust Unit Testing Environment**: Everything you need to get started with testing in NetSuite, including a complete beginner-to-advanced guide, pre-configured Jest environments, and mock templates to achieve your 100% coverage goals.

---

## 📂 Folder Structure

The repository is organized into distinct areas mapping to different stages and tools of SuiteScript development.

```text
/Netsuite-Utility-Functions-and-Documentations/
│
├── Utility Functions/              # Reusable helper scripts for day-to-day SuiteScript development
│   ├── get_all_data.js             # Safely retrieves >1000 records from search.create() objects
│   ├── show_top_error.js           # Utilities to present native NetSuite red error banners at the top of the UI
│   └── amount_to_words.js          # Converts numerical amounts and their sub-units to written words with currency
│
├── Documentations/                 # In-depth guides and practical implementation examples
│   ├── LLM/                        # Integrations with Large Language Models
│   │   ├── LLM in Netsuite.md      # Primary documentation for the native N/llm module in SuiteScript 2.1
│   │   ├── ue_mt_llm_model.js      # Practical User Event script utilizing native N/llm
│   │   └── Old Documentation/      # Hypothetical docs & practical HTTPS-based Suitelets for external AIs (like Google Gemini)
│   │
│   ├── SDF/                        # SuiteCloud Development Framework guides
│   │   └── SDF CookBook.md         # A crucial VS Code cookbook for mastering SDF deployments and management
│   │
│   └── SuiteScript quick start/    # Snippet management
│       └── suitescript quick start.md # Guide to setting up custom SuiteScript Snippets in VS Code for rapid development
│
├── Unit Testing/                   # Complete environment and methodology for testing NetSuite scripts locally
│   ├── Documentation/              
│   │   └── Unit Testing Full Guide.md # The absolutely essential, comprehensive guide to testing with Jest
│   ├── src/                        # Source scripts being tested
│   ├── __tests__/                  # Active test scripts
│   ├── __mocks__/                  # Pre-configured NetSuite module mocks (N/record, N/search, N/log, etc.)
│   └── jest.config.js              # Environment configuration for the Jest test runner
│
└── .github/                        # GitHub Actions configuration
    └── workflows/                  # CI/CD Workflows to automate unit testing runs (Required to be located at the repository root by GitHub)
```

### 💡 Note on the `.github` Folder

The `.github` folder must sit at the root of the repository to be recognized by GitHub Actions. It contains workflows (like `test.yml`) that automatically run the Jest scripts located in the `Unit Testing` folder every time code is pushed.

---

## 🚀 Example Usage

Specific implementation examples and context-based usages can be found directly inside each utility script file and inside the detailed Markdown guides in the `Documentations` folder.

---

## 👥 Authors

- [Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) – NetSuite Developer
- [Kirollos Ayman](https://www.linkedin.com/in/keroloseid/) – NetSuite Developer

Feel free to connect or contribute!

Let me know if you have a special focus, and I’ll tailor it even more!