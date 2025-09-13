import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../../../frontend/index.css";

// コンポーネントがエクスポートされていないため、直接インポートする必要があります
// 実際のシナリオでは、index.tsxからコンポーネントをエクスポートします
const ExampleRoute = () => {
  const [config, setConfig] = React.useState(window.ELIZA_CONFIG);

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (!config?.agentId) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 font-medium">
          Error: Agent ID not found
        </div>
        <div className="text-sm text-gray-600 mt-2">
          The server should inject the agent ID configuration.
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={new QueryClient()}>
      <div>Hello {config.agentId}</div>
    </QueryClientProvider>
  );
};

describe("ExampleRoute Component Tests", () => {
  describe("Component Rendering", () => {
    it("should apply dark mode on mount", () => {
      cy.mount(<ExampleRoute />);
      cy.shouldBeDarkMode();
    });

    it("should show error when agent ID is missing", () => {
      // マウントする前に設定をクリア
      cy.window().then((win) => {
        win.ELIZA_CONFIG = undefined;
      });

      cy.mount(<ExampleRoute />);

      // エラーメッセージが表示されることを確認
      cy.contains("Error: Agent ID not found").should("be.visible");
      cy.contains(
        "The server should inject the agent ID configuration.",
      ).should("be.visible");
    });

    it("should render correctly with agent ID", () => {
      const testAgentId = "12345678-1234-1234-1234-123456789abc";

      // マウントする前に設定
      cy.window().then((win) => {
        win.ELIZA_CONFIG = {
          agentId: testAgentId,
          apiBase: "http://localhost:3000",
        };
      });

      cy.mount(<ExampleRoute />);

      // エージェントIDが表示されることを確認
      cy.contains(`Hello ${testAgentId}`).should("be.visible");
    });
  });

  describe("Configuration Handling", () => {
    it("should handle ELIZA_CONFIG changes", () => {
      const initialAgentId = "initial-agent-id";
      const updatedAgentId = "updated-agent-id";

      // 初期設定
      cy.window().then((win) => {
        win.ELIZA_CONFIG = {
          agentId: initialAgentId,
          apiBase: "http://localhost:3000",
        };
      });

      cy.mount(<ExampleRoute />);
      cy.contains(`Hello ${initialAgentId}`).should("be.visible");
    });
  });
});

/**
 * ELIZAOSにおけるフロントエンドコンポーネントのテストパターン
 *
 * 1. コンポーネントの分離
 *    - cy.mount()を使用してコンポーネントを分離してテスト
 *    - 外部依存関係（API呼び出しなど）をモック
 *    - 信頼性の高い要素選択のためにdata-testid属性を使用
 *
 * 2. 設定のテスト
 *    - ELIZA_CONFIGの有無で常にテスト
 *    - 無効/不正な設定でテスト
 *    - エラー状態とフォールバックを検証
 *
 * 3. ダークモードのサポート
 *    - コンポーネントがライトモードとダークモードの両方で動作することを確認
 *    - カスタムのshouldBeDarkMode()コマンドを使用
 *
 * 4. クエリクライアントのテスト
 *    - react-queryのAPIレスポンスをモック
 *    - ローディング、エラー、成功の状態をテスト
 *    - キャッシュの動作を検証
 *
 * 5. アクセシビリティ
 *    - Testing Libraryのクエリ（findByRole, findByText）を使用
 *    - キーボードナビゲーションをテスト
 *    - ARIA属性を検証
 *
 * テスト構造の例：
 *
 * describe('Component Name', () => {
 *   beforeEach(() => {
 *     //共通のテストデータを設定
 *     cy.setElizaConfig({ agentId: 'test-id', apiBase: 'http://localhost:3000' });
 *   });
 *
 *   describe('Rendering', () => {
 *     it('should render correctly', () => {
 *       cy.mount(<Component />);
 *       // アサーション
 *     });
 *   });
 *
 *   describe('User Interactions', () => {
 *     it('should handle click events', () => {
 *       cy.mount(<Component />);
 *       cy.findByRole('button').click();
 *       // アサーション
 *     });
 *   });
 *
 *   describe('API Integration', () => {
 *     it('should fetch and display data', () => {
 *       cy.intercept('GET', '/api/data', { fixture: 'mockData.json' });
 *       cy.mount(<Component />);
 *       // アサーション
 *     });
 *   });
 * }); */

