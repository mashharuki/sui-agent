import React from "react";
import "../../../frontend/index.css";

/**
 * Reactのstateを使用してAPIからデータをフェッチするコンポーネントの例
 */
const DataFetchingComponent: React.FC<{ agentId: string }> = ({ agentId }) => {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/agent/${agentId}/data`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agentId]);

  if (isLoading) return <div data-testid="loading">Loading agent data...</div>;
  if (error)
    return (
      <div data-testid="error" className="text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div data-testid="data-display">
      <h2>Agent: {agentId}</h2>
      <ul>
        {data?.items?.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

describe("API Integration Tests", () => {
  describe("Data Fetching", () => {
    it("should display loading state initially", () => {
      cy.intercept("GET", "/api/agent/*/data", {
        delay: 1000,
        body: { items: [] },
      });

      cy.mount(<DataFetchingComponent agentId="test-123" />);
      cy.get('[data-testid="loading"]').should("be.visible");
      cy.get('[data-testid="loading"]').should(
        "contain",
        "Loading agent data...",
      );
    });

    it("should fetch and display data successfully", () => {
      const mockData = {
        items: ["Action 1", "Action 2", "Action 3"],
      };

      cy.intercept("GET", "/api/agent/test-123/data", {
        statusCode: 200,
        body: mockData,
      }).as("getAgentData");

      cy.mount(<DataFetchingComponent agentId="test-123" />);

      // API呼び出しを待機
      cy.wait("@getAgentData");

      // データが表示されることを確認
      cy.get('[data-testid="data-display"]').should("be.visible");
      cy.contains("Agent: test-123").should("be.visible");
      cy.contains("Action 1").should("be.visible");
      cy.contains("Action 2").should("be.visible");
      cy.contains("Action 3").should("be.visible");
    });

    it("should handle API errors gracefully", () => {
      cy.intercept("GET", "/api/agent/test-123/data", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("getAgentDataError");

      cy.mount(<DataFetchingComponent agentId="test-123" />);

      // 失敗したAPI呼び出しを待機
      cy.wait("@getAgentDataError");

      // エラーが表示されることを確認
      cy.get('[data-testid="error"]').should("be.visible");
      cy.get('[data-testid="error"]').should("contain", "Failed to fetch data");
      cy.get('[data-testid="error"]').should("have.class", "text-red-500");
    });

    it("should handle network errors", () => {
      cy.intercept("GET", "/api/agent/test-123/data", {
        forceNetworkError: true,
      }).as("networkError");

      cy.mount(<DataFetchingComponent agentId="test-123" />);

      // ネットワークエラーはwaitをトリガーしない場合があるため、直接エラーを確認
      cy.get('[data-testid="error"]', { timeout: 10000 }).should("be.visible");
    });

    it("should refetch data when agent ID changes", () => {
      const firstMockData = { items: ["First Agent Action"] };
      const secondMockData = { items: ["Second Agent Action"] };

      cy.intercept("GET", "/api/agent/agent-1/data", {
        body: firstMockData,
      }).as("getFirstAgent");

      cy.intercept("GET", "/api/agent/agent-2/data", {
        body: secondMockData,
      }).as("getSecondAgent");

      // エージェントIDを変更できるコンポーネントを作成
      const TestWrapper = () => {
        const [agentId, setAgentId] = React.useState("agent-1");

        return (
          <>
            <button
              onClick={() => setAgentId("agent-2")}
              data-testid="change-agent"
            >
              Change Agent
            </button>
            <DataFetchingComponent agentId={agentId} />
          </>
        );
      };

      cy.mount(<TestWrapper />);
      cy.wait("@getFirstAgent");
      cy.contains("First Agent Action").should("be.visible");

      // クリックしてエージェントを変更
      cy.get('[data-testid="change-agent"]').click();
      cy.wait("@getSecondAgent");
      cy.contains("Second Agent Action").should("be.visible");
      cy.contains("First Agent Action").should("not.exist");
    });
  });

  describe("Request Validation", () => {
    it("should send correct headers", () => {
      cy.intercept("GET", "/api/agent/*/data", (req) => {
        expect(req.headers).to.have.property("accept");
        req.reply({ items: [] });
      }).as("checkHeaders");

      cy.mount(<DataFetchingComponent agentId="test-123" />);
      cy.wait("@checkHeaders");
    });

    it("should handle different response formats", () => {
      // 空のレスポンスをテスト
      cy.intercept("GET", "/api/agent/empty/data", {
        body: {},
      }).as("emptyResponse");
      cy.mount(<DataFetchingComponent agentId="empty" />);
      cy.wait("@emptyResponse");
      cy.get('[data-testid="data-display"]').should("be.visible");

      // nullアイテムをテスト
      cy.intercept("GET", "/api/agent/null/data", {
        body: { items: null },
      }).as("nullResponse");
      // 2番目のテスト用に新しいマウントポイントを作成
      cy.then(() => {
        cy.mount(<DataFetchingComponent agentId="null" />);
        cy.wait("@nullResponse");
        cy.get('[data-testid="data-display"]').should("be.visible");
      });
    });
  });
});

/**
 * CYPRESSでのAPIテストパターン
 *
 * 1. リクエストのインターセプト
 *    cy.intercept() を使用すると、以下が可能になります：
 *    - レスポンスのモック
 *    - レスポンスの遅延
 *    - エラーの強制
 *    - リクエストデータの検証
 *
 * 2. リクエストの待機
 *    .as() と cy.wait() を使用して、アサーションを行う前に
 *    リクエストが完了することを確認します
 *
 * 3. エラーシナリオ
 *    すべてのエラーケースをテストします：
 *    - サーバーエラー (4xx, 5xx)
 *    - ネットワーク障害
 *    - タイムアウトシナリオ
 *    - 無効なレスポンス
 *
 * 4. ローディング状態
 *    常にローディングインジケータをテストします
 *    遅延を使用して、それらが表示されることを確認します
 *
 * 5. データ更新
 *    コンポーネントが以下をどのように処理するかをテストします：
 *    - プロパティの変更
 *    - 再フェッチ
 *    - キャッシュの無効化
 *
 * 注：この例では、テスト環境での依存関係の最適化問題を回避するために、
 * React Queryの代わりにプレーンなReact stateを使用しています。
 * 本番環境では、通常、より良いキャッシングとリクエスト管理のために
 * React Queryや同様のライブラリを使用します。
 */

