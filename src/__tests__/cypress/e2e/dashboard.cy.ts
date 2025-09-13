/**
 * ElizaOSダッシュボードのE2Eテスト
 *
 * これらのテストは、ユーザーの視点からアプリケーション全体のフローを検証し、
 * 実行中のアプリケーションとの実際のインタラクションをテストします。
 */

describe("Dashboard E2E Tests", () => {
  beforeEach(() => {
    // 各テストの前にダッシュボードにアクセス
    cy.visit("/");
  });

  describe("Dashboard Loading", () => {
    it("should load the dashboard successfully", () => {
      // ページが正常に読み込まれることを確認
      cy.url().should("include", "localhost:3000");

      // 一般的なダッシュボード要素を探す
      cy.get("body").should("be.visible");

      // ローディングインジケータがないことを確認
      cy.get('[data-testid="loading"]', { timeout: 5000 }).should("not.exist");
    });

    it("should display the application title or logo", () => {
      // アプリケーションのブランディングを探す
      cy.contains(/eliza|agent/i).should("be.visible");
    });

    it("should have proper meta tags", () => {
      // viewportメタタグを確認
      cy.get('meta[name="viewport"]')
        .should("exist")
        .should("have.attr", "content")
        .and("include", "width=device-width");
    });
  });

  describe("Navigation", () => {
    it("should navigate to different sections", () => {
      // ナビゲーション要素を探す
      cy.get('nav, [role="navigation"], .navigation').should("exist");

      // 一般的なナビゲーション項目を確認
      const navItems = ["agents", "chat", "settings", "docs"];
      navItems.forEach((item) => {
        cy.get(`a[href*="${item}"], button:contains("${item}")`, {
          timeout: 2000,
        }).should("exist");
      });
    });

    it("should handle navigation clicks", () => {
      // ナビゲーション項目をクリック（存在する場合）
      cy.get('a[href*="agents"], button:contains("agents")', { timeout: 2000 })
        .first()
        .click({ force: true });

      // URLが変更されたか、コンテンツが更新されたことを確認
      cy.url().should("match", /agents|agent/i);
    });
  });

  describe("Responsive Design", () => {
    it("should be responsive on mobile", () => {
      // モバイルビューポートでテスト
      cy.viewport(375, 667);
      cy.wait(500);

      // コンテンツがまだ表示されていることを確認
      cy.get("body").should("be.visible");

      // モバイルメニューは非表示の場合がある
      cy.get('nav, [role="navigation"]').then(($nav) => {
        if ($nav.is(":visible")) {
          expect($nav).to.be.visible;
        } else {
          // モバイルメニューボタンを探す
          cy.get('[aria-label*="menu"], button[class*="menu"]').should(
            "be.visible",
          );
        }
      });
    });

    it("should be responsive on tablet", () => {
      // タブレットビューポートでテスト
      cy.viewport(768, 1024);
      cy.wait(500);

      cy.get("body").should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 pages gracefully", () => {
      cy.visit("/non-existent-page", { failOnStatusCode: false });

      // 何らかのエラーメッセージが表示されるか、リダイレクトされるべき
      cy.contains(/404|not found|error/i, { timeout: 5000 }).should(
        "be.visible",
      );
    });

    it("should handle network errors", () => {
      // ネットワークエラーをインターセプトして強制
      cy.intercept("GET", "/api/**", { forceNetworkError: true }).as(
        "networkError",
      );

      cy.visit("/");

      // エラーを適切に処理するべき
      cy.get("body").should("be.visible");
    });
  });
});

/**
 * ELIZAOSのE2Eテストパターン
 *
 * 1. 実際のアプリケーションテスト
 *    - 実行中のアプリケーションに対してテスト
 *    - エラーシナリオをテストする場合を除き、モックは使用しない
 *    - 実際のユーザーワークフローを検証
 *
 * 2. ページナビゲーション
 *    - すべてのナビゲーションパスをテスト
 *    - URLの変更を検証
 *    - 適切なリダイレクトを確認
 *
 * 3. レスポンシブテスト
 *    - 複数のビューポートサイズをテスト
 *    - モバイルメニューの動作を検証
 *    - タッチインタラクションをチェック
 *
 * 4. パフォーマンス
 *    - 合理的なタイムアウトを設定
 *    - ローディングインジケータを確認
 *    - 非同期操作が完了することを検証
 *
 * 5. エラーシナリオ
 *    - 404ページをテスト
 *    - ネットワーク障害
 *    - APIエラー
 *    - フォームバリデーション
 *
 * ベストプラクティス：
 * - 信頼性の高い選択のためにdata-testid属性を使用
 * - クラスに基づく脆弱なセレクタを避ける
 * - 実装ではなく、ユーザーに見える動作をテスト
 * - テストを独立させ、冪等に保つ
 */

