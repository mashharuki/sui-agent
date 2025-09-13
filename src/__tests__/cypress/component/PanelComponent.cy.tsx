import React from "react";
import { panels } from "../../../frontend/index";

describe("PanelComponent Tests", () => {
  // エクスポートされたパネルからPanelコンポーネントを取得
  const PanelComponent = panels[0]?.component;

  describe("Panel Registration", () => {
    it("should export panels array with correct structure", () => {
      // 正しい構造でパネル配列をエクスポートすることを確認
      expect(panels).to.be.an("array");
      expect(panels).to.have.length.greaterThan(0);

      const panel = panels[0];
      expect(panel).to.have.property("name", "Example");
      expect(panel).to.have.property("path", "example");
      expect(panel).to.have.property("component");
      expect(panel).to.have.property("icon", "Book");
      expect(panel).to.have.property("public", false);
      expect(panel).to.have.property("shortLabel", "Example");
    });
  });

  describe("Component Rendering", () => {
    it("should render with agent ID", () => {
      // エージェントIDでレンダリングされることを確認
      const testAgentId = "test-agent-12345";

      if (!PanelComponent) {
        throw new Error("PanelComponent not found in panels export");
      }

      cy.mount(<PanelComponent agentId={testAgentId} />);

      // 注：コンポーネントには「Hello」の代わりに「Helllo」というタイポがあります
      cy.contains(`Helllo ${testAgentId}!`).should("be.visible");
    });

    it("should handle different agent IDs", () => {
      // 異なるエージェントIDを処理できることを確認
      const agentIds = [
        "agent-1",
        "agent-2",
        "12345678-1234-1234-1234-123456789abc",
        "test-agent",
      ];

      agentIds.forEach((agentId) => {
        cy.mount(<PanelComponent agentId={agentId} />);
        cy.contains(`Helllo ${agentId}!`).should("be.visible");
      });
    });

    it("should render without crashing with empty agent ID", () => {
      // 空のエージェントIDでクラッシュせずにレンダリングされることを確認
      cy.mount(<PanelComponent agentId="" />);
      cy.contains("Helllo !").should("be.visible");
    });
  });
});

