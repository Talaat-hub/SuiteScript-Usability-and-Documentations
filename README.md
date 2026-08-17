# SuiteScript Usability and Documentations

An extensive collection of utilities, documentation, and testing frameworks designed to enhance the NetSuite SuiteScript development experience.

---

## About

This repository documents and demonstrates three areas of SuiteScript 2.1 development that are often under-covered elsewhere: reusable utility functions for everyday scripting tasks, practical guides covering the native `N/llm` module, SuiteCloud Development Framework (SDF), and VS Code snippet setup, and a complete local unit-testing environment built on Jest with hand-written mocks for NetSuite's `N/*` modules. Each piece is meant to be usable on its own — copy a utility function into a script, follow the SDF cookbook to deploy a project, or clone the testing setup as a starting point for a new script's test suite.

---

## What This Repository Offers

Whether the goal is a simple automation or a larger integration project, this repository provides:

1. **Utility Functions** — reusable, reliable helper functions that reduce code redundancy and speed up development across SuiteScript 2.0 and 2.1.
2. **Documentation** — conceptual and practical guides covering Large Language Model (LLM) integration, SuiteCloud Development Framework (SDF) management, and VS Code snippet configuration.
3. **Unit Testing Environment** — a complete beginner-to-advanced guide to testing in NetSuite, along with a pre-configured Jest environment and mock templates aimed at high test coverage.

---

## Folder Structure

The repository is organized into distinct areas mapping to different stages and tools of SuiteScript development.

```text
/SuiteScript-Usability-and-Documentations/
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
│   │   └── Old Documentation/      # Historical docs and practical HTTPS-based Suitelets for external AI providers
│   │
│   ├── SDF/                        # SuiteCloud Development Framework guides
│   │   └── SDF CookBook.md         # A VS Code cookbook for SDF deployments and project management
│   │
│   └── SuiteScript quick start/    # Snippet management
│       └── suitescript quick start.md # Guide to setting up custom SuiteScript snippets in VS Code, covering all major script types
│
├── Unit Testing/                   # Complete environment and methodology for testing NetSuite scripts locally
│   ├── Documentation/
│   │   └── Unit Testing Full Guide.md # A comprehensive guide to testing NetSuite scripts with Jest
│   ├── src/                        # Source scripts being tested
│   ├── __tests__/                  # Active test scripts
│   ├── __mocks__/                  # Pre-configured NetSuite module mocks (N/record, N/search, N/log, etc.)
│   └── jest.config.js              # Environment configuration for the Jest test runner
│
└── .github/                        # GitHub Actions configuration
    └── workflows/                  # CI/CD workflows that run the Jest suite automatically (must sit at the repository root)
```

### Note on the `.github` Folder

The `.github` folder must sit at the root of the repository to be recognized by GitHub Actions. It contains workflows (such as `test.yml`) that automatically run the Jest suite in the `Unit Testing` folder on every push.

---

## Example Usage

Implementation examples and context for each utility are documented directly inside the script files themselves, and in more detail inside the Markdown guides in the `Documentations` folder.

---

## Authors

- [Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) — NetSuite Developer
- [Kirollos Ayman](https://www.linkedin.com/in/keroloseid/) — NetSuite Developer

Feel free to connect or reach out with questions about anything in this repository.
