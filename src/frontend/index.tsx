// React Queryのクライアントとプロバイダーをインポート
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// React DOMのクライアント側エントリーポイントをインポート
import { createRoot } from "react-dom/client";
// スタイルシートをインポート
import "./index.css";
// Reactライブラリをインポート
import React from "react";
// ElizaOSコアからUUID型をインポート
import type { UUID } from "@elizaos/core";

// React Queryの新しいクライアントインスタンスを作成
const queryClient = new QueryClient();

// ELIZA_CONFIGのインターフェースを定義
interface ElizaConfig {
  agentId: string; // エージェントID
  apiBase: string; // APIのベースURL
}

// TypeScriptのためにグローバルなwindowオブジェクトを拡張
declare global {
  interface Window {
    ELIZA_CONFIG?: ElizaConfig;
  }
}

/**
 * メインのサンプルルートコンポーネント
 */
function ExampleRoute() {
  // windowオブジェクトから設定を取得
  const config = window.ELIZA_CONFIG;
  const agentId = config?.agentId;

  // ダークモードをルート要素に適用
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // agentIdが存在しない場合、エラーメッセージを表示
  if (!agentId) {
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

  // agentIdがある場合、ExampleProviderコンポーネントを描画
  return <ExampleProvider agentId={agentId as UUID} />;
}

/**
 * サンプルのプロバイダーコンポーネント
 */
function ExampleProvider({ agentId }: { agentId: UUID }) {
  return (
    // React Queryプロバイダーでラップ
    <QueryClientProvider client={queryClient}>
      <div>Hello {agentId}</div>
    </QueryClientProvider>
  );
}

// アプリケーションを初期化 - iframeのためルーターは不要
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<ExampleRoute />);
}

// エージェントUIシステムとの統合のための型を定義
export interface AgentPanel {
  name: string; // パネル名
  path: string; // パス
  component: React.ComponentType<any>; // Reactコンポーネント
  icon?: string; // アイコン
  public?: boolean; // 公開パネルかどうか
  shortLabel?: string; // モバイル用の短いラベル（オプション）
}

// パネルコンポーネントのプロパティの型定義
interface PanelProps {
  agentId: string;
}

/**
 * プラグインシステム用のサンプルパネルコンポーネント
 */
const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  return <div>Helllo {agentId}!</div>;
};

// エージェントUIとの統合のためにパネル設定をエクスポート
export const panels: AgentPanel[] = [
  {
    name: "Example",
    path: "example",
    component: PanelComponent,
    icon: "Book",
    public: false,
    shortLabel: "Example",
  },
];

// utilsファイルから全てをエクスポート
export * from "./utils";

