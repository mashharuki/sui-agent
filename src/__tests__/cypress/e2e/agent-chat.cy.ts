/**
 * エージェントチャット機能のE2Eテスト
 *
 * これらのテストは、実行中のアプリケーションでのチャットインターフェースとエージェントの相互作用を検証します。
 */

describe("Agent Chat E2E Tests", () => {
  beforeEach(() => {
    // ダッシュボードにアクセス
    cy.visit("/");

    // チャットまたはエージェントセクションに移動
    cy.get(
      'a[href*="chat"], a[href*="agent"], button:contains("chat"), button:contains("agent")',
      {
        timeout: 5000,
      },
    )
      .first()
      .click({ force: true });
  });

  describe("Chat Interface", () => {
    it("should display the chat interface", () => {
      // チャット関連の要素を探す
      cy.get(
        '[data-testid="chat-container"], .chat-container, #chat, [role="main"]',
      ).should("be.visible");
    });

    it("should have a message input field", () => {
      // 入力フィールドを探す
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .should("be.visible")
        .should("not.be.disabled");
    });

    it("should have a send button", () => {
      // 送信ボタンを探す
      cy.get("button")
        .filter(':contains("Send"), :contains("send"), [aria-label*="send"]')
        .should("be.visible")
        .should("not.be.disabled");
    });
  });

  describe("Sending Messages", () => {
    it("should send a message when typing and clicking send", () => {
      const testMessage = "Hello, this is a test message";

      // メッセージを入力
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type(testMessage);

      // 送信をクリック
      cy.get("button")
        .filter(':contains("Send"), :contains("send"), [aria-label*="send"]')
        .first()
        .click();

      // メッセージがチャットに表示されることを確認
      cy.contains(testMessage, { timeout: 10000 }).should("be.visible");
    });

    it("should send a message when pressing Enter", () => {
      const testMessage = "Test message with Enter key";

      // メッセージを入力してEnterキーを押す
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type(`${testMessage}{enter}`);

      // メッセージが表示されることを確認
      cy.contains(testMessage, { timeout: 10000 }).should("be.visible");
    });

    it("should clear input after sending", () => {
      const testMessage = "Message to clear";

      // 入力要素を取得
      const input = cy
        .get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first();

      // 入力して送信
      input.type(testMessage);

      cy.get("button")
        .filter(':contains("Send"), :contains("send"), [aria-label*="send"]')
        .first()
        .click();

      // 入力がクリアされることを確認
      input.should("have.value", "");
    });
  });

  describe("Agent Responses", () => {
    it("should receive a response from the agent", () => {
      // 簡単なメッセージを送信
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("Hello agent{enter}");

      // エージェントの応答を待つ
      // 一般的なエージェント応答インジケータを探す
      cy.get('[data-testid*="agent"], [class*="agent"], [role="article"]', {
        timeout: 15000,
      }).should("have.length.greaterThan", 0);
    });

    it("should show typing indicator while agent is responding", () => {
      // メッセージを送信
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("Tell me about yourself{enter}");

      // タイピングインジケータを探す
      cy.get(
        '[data-testid="typing"], [class*="typing"], [aria-label*="typing"]',
        {
          timeout: 5000,
        },
      ).should("be.visible");

      // 応答後にタイピングインジケータが消えるべき
      cy.get(
        '[data-testid="typing"], [class*="typing"], [aria-label*="typing"]',
        {
          timeout: 15000,
        },
      ).should("not.exist");
    });
  });

  describe("Chat History", () => {
    it("should maintain chat history", () => {
      const messages = ["First message", "Second message", "Third message"];

      // 複数のメッセージを送信
      messages.forEach((msg, index) => {
        cy.get('input[type="text"], textarea, [contenteditable="true"]')
          .filter(":visible")
          .first()
          .type(`${msg}{enter}`);

        // メッセージ間に少し待機
        cy.wait(1000);
      });

      // すべてのメッセージが表示されていることを確認
      messages.forEach((msg) => {
        cy.contains(msg).should("be.visible");
      });
    });

    it("should scroll to latest message", () => {
      // スクロールを作成するために複数のメッセージを送信
      for (let i = 0; i < 10; i++) {
        cy.get('input[type="text"], textarea, [contenteditable="true"]')
          .filter(":visible")
          .first()
          .type(`Message number ${i}{enter}`);
        cy.wait(500);
      }

      // 最新のメッセージが表示されていることを確認
      cy.contains("Message number 9").should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", () => {
      // API呼び出しをインターセプトしてエラーを強制
      cy.intercept("POST", "**/api/chat/**", {
        statusCode: 500,
        body: { error: "Server error" },
      }).as("chatError");

      // メッセージを送信
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("This will fail{enter}");

      // エラーメッセージが表示されるべき
      cy.contains(/error|failed|try again/i, { timeout: 10000 }).should(
        "be.visible",
      );
    });

    it("should prevent sending empty messages", () => {
      // 空のメッセージを送信しようとする
      cy.get("button")
        .filter(':contains("Send"), :contains("send"), [aria-label*="send"]')
        .first()
        .click();

      // 新しいメッセージ要素が作成されないべき
      cy.get('[data-testid*="message"], [class*="message"]').should(
        "have.length",
        0,
      );
    });
  });
});

/**
 * チャットテストのパターン
 *
 * 1. メッセージフロー
 *    - メッセージの送信をテスト
 *    - メッセージ表示を検証
 *    - 入力クリアをチェック
 *    - キーボードショートカットをテスト
 *
 * 2. エージェントとの対話
 *    - 応答を待つ
 *    - タイピングインジケータをチェック
 *    - 応答形式を検証
 *    - 会話コンテキストをテスト
 *
 * 3. UIの動作
 *    - 最新への自動スクロール
 *    - 履歴の維持
 *    - 長いメッセージの処理
 *    - レスポンシブレイアウト
 *
 * 4. エラーケース
 *    - ネットワーク障害
 *    - 空のメッセージ
 *    - レート制限
 *    - セッションタイムアウト
 *
 * ヒント：
 * - エージェントの応答には寛大なタイムアウトを使用する
 * - 現実世界のシナリオをテストする
 * - アクセシビリティ機能を検証する
 * - モバイルでのインタラクションをチェックする
 */

