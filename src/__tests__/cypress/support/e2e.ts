/**
 * E2Eサポートファイル
 *
 * このファイルはE2Eテストファイルの前に自動的にロードされます。
 * グローバル設定やカスタムコマンドの設定に使用します。
 */

// ***********************************************************
// このファイルは、テストファイルの前に自動的に処理およびロードされます。
// このファイルの場所を変更したり、'supportFile'設定オプションを使用して
// 処理をオフにしたりできます。
// ***********************************************************

// コマンドをインポート（コンポーネントテストと共有）
import "./commands";

// Testing Library Cypressコマンドをインポート
import "@testing-library/cypress/add-commands";

// E2E固有の設定
Cypress.on("uncaught:exception", (err, runnable) => {
  // キャッチされなかった例外でCypressがテストを失敗させないようにする
  // これは、サードパーティのスクリプトがエラーをスローする可能性があるE2Eテストで役立ちます
  console.error("Uncaught exception:", err);
  return false;
});

// カスタムE2Eコマンド
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * アプリケーションにログイン
       * @param username - ログインに使用するユーザー名
       * @param password - ログインに使用するパスワード
       */
      login(username?: string, password?: string): Chainable<void>;

      /**
       * アプリケーションの準備が完了するまで待機
       */
      waitForApp(): Chainable<void>;

      /**
       * 特定のエージェントチャットに移動
       * @param agentId - チャットするエージェントのID
       */
      navigateToAgent(agentId?: string): Chainable<void>;

      /**
       * チャットメッセージを送信し、応答を待機
       * @param message - 送信するメッセージ
       */
      sendChatMessage(message: string): Chainable<void>;

      /**
       * すべてのアプリケーションデータをクリア
       */
      clearAppData(): Chainable<void>;
    }
  }
}

// ログインコマンド
Cypress.Commands.add(
  "login",
  (username = "testuser", password = "testpass") => {
    // ログインが必要か確認
    cy.get("body").then(($body) => {
      if (
        $body.find(
          '[data-testid="login"], form[name="login"], input[name="username"]',
        ).length
      ) {
        cy.get('input[name="username"], input[type="email"]')
          .first()
          .type(username);
        cy.get('input[name="password"], input[type="password"]')
          .first()
          .type(password);
        cy.get('button[type="submit"], button:contains("Login")')
          .first()
          .click();
        cy.wait(1000);
      }
    });
  },
);

// アプリの準備完了を待つコマンド
Cypress.Commands.add("waitForApp", () => {
  // ローディングインジケータが消えるまで待機
  cy.get('[data-testid="loading"], .loading, .spinner', {
    timeout: 10000,
  }).should("not.exist");

  // アプリコンテナが表示されていることを確認
  cy.get('#root, #app, [data-testid="app"]').should("be.visible");

  // アニメーションのために少し待機
  cy.wait(500);
});

// エージェントへのナビゲーションコマンド
Cypress.Commands.add("navigateToAgent", (agentId?: string) => {
  if (agentId) {
    cy.visit(`/agent/${agentId}`);
  } else {
    cy.get('a[href*="agent"], button:contains("agent")')
      .first()
      .click({ force: true });
  }
  cy.waitForApp();
});

// チャットメッセージ送信コマンド
Cypress.Commands.add("sendChatMessage", (message: string) => {
  // 入力を見つけて入力
  cy.get('input[type="text"], textarea, [contenteditable="true"]')
    .filter(":visible")
    .first()
    .clear()
    .type(message);

  // メッセージを送信
  cy.get("button")
    .filter(':contains("Send"), [aria-label*="send"]')
    .first()
    .click();

  // メッセージが表示されるのを待機
  cy.contains(message, { timeout: 5000 }).should("be.visible");

  // エージェントの応答を待機
  cy.get('[data-testid*="agent"], [class*="agent"], [data-sender="agent"]', {
    timeout: 15000,
  }).should("exist");
});

// アプリデータクリアコマンド
Cypress.Commands.add("clearAppData", () => {
  cy.window().then((win) => {
    // ローカルストレージをクリア
    (win as any).localStorage.clear();

    // セッションストレージをクリア
    (win as any).sessionStorage.clear();

    // クッキーをクリア
    cy.clearCookies();

    // 注：IndexedDBのクリアはTypeScriptの互換性の問題でコメントアウトされています
    // アプリがIndexedDBを使用している場合は、ここにカスタムクリアロジックを追加する必要があるかもしれません
    // 例：
    // cy.window().its('indexedDB').invoke('deleteDatabase', 'your-db-name');
  });
});

// E2E固有のビューポート設定
beforeEach(() => {
  // E2Eテスト用に一貫したビューポートを設定
  cy.viewport(1280, 720);
});

// 失敗時のスクリーンショット
Cypress.on("fail", (error, runnable) => {
  // テストが失敗したときにスクリーンショットを撮る
  cy.screenshot(`failed-${runnable.parent?.title}-${runnable.title}`, {
    capture: "runner",
  });
  throw error;
});

/**
 * E2Eテストユーティリティ
 *
 * これらのコマンドは、一般的なE2Eテストシナリオに役立ちます：
 *
 * 1. ログインフロー
 *    - cy.login() - 認証を処理
 *    - さまざまな認証方法をサポート
 *
 * 2. ナビゲーション
 *    - cy.navigateToAgent() - エージェントチャットに移動
 *    - cy.waitForApp() - アプリの準備完了を待つ
 *
 * 3. インタラクション
 *    - cy.sendChatMessage() - メッセージを送信して検証
 *    - 非同期応答を処理
 *
 * 4. 状態管理
 *    - cy.clearAppData() - アプリケーションの状態をリセット
 *    - すべてのストレージタイプをクリア
 *
 * ベストプラクティス：
 * - 一貫性のためにこれらのコマンドを使用
 * - パターンが出現したら新しいコマンドを追加
 * - コマンドを焦点を絞り、再利用可能に保つ
 */

