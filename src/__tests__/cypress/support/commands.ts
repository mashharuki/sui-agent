// ***********************************************
// このファイルでは、カスタムのCypressコマンドを作成したり、
// 既存のコマンドを上書きしたりできます。
//
// 包括的な例については、以下をご覧ください：
// https://on.cypress.io/custom-commands
// ***********************************************

// カスタムコマンドの例
// Cypress.Commands.add('login', (email, password) => { ... })

// Windowインターフェースを拡張
declare global {
  interface Window {
    ELIZA_CONFIG?: {
      agentId: string;
      apiBase: string;
    };
  }
}

// 要素がダークモードであるかを確認するカスタムコマンド
Cypress.Commands.add("shouldBeDarkMode", () => {
  cy.get("html").should("have.class", "dark");
});

// ELIZA_CONFIGを設定するカスタムコマンド
Cypress.Commands.add("setElizaConfig", (config) => {
  cy.window().then((win) => {
    win.ELIZA_CONFIG = config;
  });
});

// TypeScriptの定義
declare global {
  namespace Cypress {
    interface Chainable {
      shouldBeDarkMode(): Chainable<JQuery<HTMLElement>>;
      setElizaConfig(config: {
        agentId: string;
        apiBase: string;
      }): Chainable<Window>;
    }
  }
}

export {};

