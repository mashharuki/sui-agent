# Codebase Overview

The project is structured as follows:

- **`/` (root):** Contains configuration files like `package.json`, `tsconfig.json`, `vite.config.ts`, etc.
- **`src/`:** The main source code directory.
  - **`src/index.ts`:** Likely the main entry point for the backend or agent logic.
  - **`src/character.ts`:** Potentially defines the agent's personality or initial instructions.
  - **`src/plugin.ts`:** Likely related to the Sui Plugin integration with ElizaOS.
  - **`src/frontend/`:** Contains the React-based frontend application (`index.tsx`, `index.html`).
- **`src/__tests__/`:** Contains all tests.
  - **`src/__tests__/cypress/`:** End-to-end and component tests written with Cypress.
  - Other files in this directory are likely unit or integration tests for the backend logic.
- **`scripts/`:** Contains helper scripts, for example, for installing test dependencies.
