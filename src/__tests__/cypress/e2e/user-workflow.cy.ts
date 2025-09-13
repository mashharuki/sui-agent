/**
 * 完全なユーザーワークフローのE2Eテスト
 *
 * これらのテストは、アプリケーションを通じた実際のユーザージャーニーをシミュレートし、
 * ユーザーが体験するであろう複数の機能を連続してテストします。
 */

describe("Complete User Workflow E2E Tests", () => {
  describe("New User Onboarding", () => {
    it("should complete the full onboarding flow", () => {
      // ホームページから開始
      cy.visit("/");

      // ウェルカムメッセージまたはオンボーディングプロンプトを確認
      cy.get("body").then(($body) => {
        if (
          $body.text().includes("Welcome") ||
          $body.text().includes("Get Started")
        ) {
          // 「Get Started」があればクリック
          cy.contains(/get started|start|begin/i)
            .first()
            .click();
        }
      });

      // エージェント/チャットに移動
      cy.get(
        'a[href*="agent"], button:contains("agent"), a[href*="chat"], button:contains("chat")'
      )
        .first()
        .click({ force: true });

      // ページの読み込みを待つ
      cy.wait(1000);

      // 最初のメッセージを送信
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("Hello, I am a new user{enter}");

      // 応答を待つ
      cy.get('[data-testid*="message"], [class*="message"], [role="article"]', {
        timeout: 15000,
      }).should("have.length.greaterThan", 0);

      // 会話を続ける
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("What can you help me with?{enter}");

      // 別の応答を受け取ったことを確認
      cy.get('[data-testid*="message"], [class*="message"], [role="article"]', {
        timeout: 15000,
      }).should("have.length.greaterThan", 1);
    });
  });

  describe("Agent Configuration Workflow", () => {
    it("should configure and interact with an agent", () => {
      cy.visit("/");

      // 設定または構成を探す
      cy.get(
        'a[href*="settings"], button:contains("settings"), a[href*="config"], button:contains("config")'
      )
        .first()
        .then(($elem) => {
          if ($elem.length) {
            cy.wrap($elem).click({ force: true });

            // エージェント設定オプションを探す
            cy.contains(/agent|model|personality/i).should("be.visible");

            // チャットに戻る
            cy.get('a[href*="chat"], button:contains("chat")')
              .first()
              .click({ force: true });
          }
        });

      // 特定のクエリでエージェントをテスト
      const queries = [
        "What is your name?",
        "Tell me a joke",
        "What is 2 + 2?",
      ];

      queries.forEach((query, index) => {
        cy.get('input[type="text"], textarea, [contenteditable="true"]')
          .filter(":visible")
          .first()
          .type(`${query}{enter}`);

        // 次のクエリの前に応答を待つ
        cy.wait(2000);

        // 応答が受信されたことを確認
        cy.get(
          '[data-testid*="message"], [class*="message"], [role="article"]',
        ).should("have.length.greaterThan", index * 2);
      });
    });
  });

  describe("Multi-Session Workflow", () => {
    it("should maintain state across page refreshes", () => {
      cy.visit("/");

      // チャットに移動
      cy.get(
        'a[href*="chat"], a[href*="agent"], button:contains("chat"), button:contains("agent")'
      )
        .first()
        .click({ force: true });

      // メッセージを送信
      const testMessage = "Remember this message for testing";
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type(`${testMessage}{enter}`);

      // 応答を待つ
      cy.wait(3000);

      // ページをリフレッシュ
      cy.reload();

      // 会話履歴が維持されていることを確認
      cy.contains(testMessage, { timeout: 10000 }).should("be.visible");
    });

    it("should handle multiple chat sessions", () => {
      cy.visit("/");

      // 最初のチャットセッションを作成
      cy.get('a[href*="chat"], button:contains("chat")')
        .first()
        .click({ force: true });

      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("First session message{enter}");

      cy.wait(2000);

      // 新しいチャット/セッションボタンを探す
      cy.get("button")
        .filter(':contains("New"), :contains("new"), [aria-label*="new"]')
        .first()
        .then(($btn) => {
          if ($btn.length) {
            cy.wrap($btn).click();

            // 新しいセッションでメッセージを送信
            cy.get('input[type="text"], textarea, [contenteditable="true"]')
              .filter(":visible")
              .first()
              .type("Second session message{enter}");

            // メッセージが別々であることを確認
            cy.contains("Second session message").should("be.visible");
            cy.contains("First session message").should("not.be.visible");
          }
        });
    });
  });

  describe("Error Recovery Workflow", () => {
    it("should recover from errors and continue working", () => {
      cy.visit("/");

      // オフラインをシミュレートするためにネットワークリクエストをインターセプト
      cy.intercept("*", { forceNetworkError: true }).as("offlineMode");

      // メッセージを送信しようとする
      cy.get('a[href*="chat"], button:contains("chat")')
        .first()
        .click({ force: true });

      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("Offline message{enter}");

      // エラーが表示されるべき
      cy.contains(/offline|error|connection|failed/i, { timeout: 5000 }).should(
        "be.visible",
      );

      // オンラインに戻るためにオフラインインターセプトを削除
      cy.intercept("*", (req) => {
        req.continue();
      }).as("onlineMode");

      // 送信を再試行
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .type("Online message{enter}");

      // 今度は動作するはず
      cy.contains("Online message", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Performance Workflow", () => {
    it("should handle rapid message sending", () => {
      cy.visit("/");

      cy.get('a[href*="chat"], button:contains("chat")')
        .first()
        .click({ force: true });

      // 複数のメッセージを素早く送信
      for (let i = 0; i < 5; i++) {
        cy.get('input[type="text"], textarea, [contenteditable="true"]')
          .filter(":visible")
          .first()
          .type(`Rapid message ${i}{enter}`);

        // 非常に短い遅延
        cy.wait(100);
      }

      // すべてのメッセージが表示されるべき
      for (let i = 0; i < 5; i++) {
        cy.contains(`Rapid message ${i}`).should("be.visible");
      }

      // まだ応答可能であるべき
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(":visible")
        .first()
        .should("not.be.disabled");
    });
  });
});

/**
 * ワークフローテストのベストプラクティス
 *
 * 1. 完全なジャーニー
 *    - 最初から最後までテスト
 *    - 機能間のナビゲーションを含む
 *    - 状態の永続性を検証
 *    - エラー回復をテスト
 *
 * 2. 現実的なシナリオ
 *    - 新規ユーザーエクスペリエンス
 *    - パワーユーザーのワークフロー
 *    - エッジケースとエラー
 *    - 負荷時のパフォーマンス
 *
 * 3. 状態管理
 *    - リフレッシュをまたいでテスト
 *    - 複数のセッション
 *    - ブラウザの戻る/進む
 *    - ローカルストレージ
 *
 * 4. 統合ポイント
 *    - APIインタラクション
 *    - リアルタイム更新
 *    - 認証フロー
 *    - データ永続性
 *
 * ワークフローのパターン：
 * - 常にクリーンな状態から開始
 * - アクション間に現実的なタイミングを使用
 * - 中間状態を検証
 * - ハッピーパスとエラーパスの両方をテスト
 * - モバイルワークフローを考慮
 */

