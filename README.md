# sui-agent

## 概要

このリポジトリは、[ElizaOS](https://docs.elizaos.ai/) と Sui Plugin の動作を検証するためのプロジェクトです。ElizaOS フレームワークを使用してエージェントを構築するためのスタータープロジェクト、またはテンプレートとして機能します。

## 技術スタック

- **ランタイム/パッケージ管理:** Bun
- **言語:** TypeScript
- **フロントエンド:** React, Vite
- **スタイリング:** Tailwind CSS
- **フレームワーク:** ElizaOS
- **テスト:** Cypress
- **リンティング/フォーマット:** Prettier, Biome
- **スキーマ検証:** Zod

## セットアップと実行

### 前提条件

- [Bun](https://bun.sh/) のインストール
- [ElizaOS CLI](https://docs.elizaos.ai/installation) のグローバルインストール
  ```bash
  bun i -g @elizaos/cli
  ```
  インストール後、バージョンが表示されることを確認してください。
  ```bash
  elizaos --version
  ```

### 手順

1.  **依存関係のインストール:**
    ```bash
    bun install
    ```

2.  **開発サーバーの起動:**
    ```bash
    bun run dev
    ```

## 主要コマンド

| コマンド | 説明 |
| :--- | :--- |
| `bun install` | 依存関係をインストールします。 |
| `bun run dev` | 開発サーバーを起動します (`elizaos dev`)。 |
| `bun run start` | 本番用サーバーを起動します (`elizaos start`)。 |
| `bun run build` | プロジェクトをビルドします。 |
| `bun run test` | すべてのテスト（コンポーネントおよびE2E）を実行します。 |
| `bun run lint` | Prettier を使用して `./src` 内のファイルをリント・フォーマットします。 |
| `bun run format` | Biome を使用してプロジェクト全体をフォーマットします。 |
| `bun run type-check` | TypeScript の型チェックを実行します。 |
| `bun run check-all` | 型チェック、フォーマット、およびすべてのテストを実行します。 |

## コードベース構造

- **`/` (ルート):** `package.json`, `tsconfig.json`, `vite.config.ts` などの設定ファイルが含まれます。
- **`src/`:** メインのソースコードディレクトリです。
  - **`src/index.ts`:** バックエンドまたはエージェントロジックのメインエントリーポイントです。
  - **`src/character.ts`:** エージェントの個性や初期指示を定義している可能性があります。
  - **`src/plugin.ts`:** ElizaOS と Sui Plugin の統合に関連する処理が含まれている可能性があります。
  - **`src/frontend/`:** React ベースのフロントエンドアプリケーション (`index.tsx`, `index.html`) が含まれます。
- **`src/__tests__/`:** すべてのテストが含まれます。
  - **`src/__tests__/cypress/`:** Cypress で書かれたE2Eテストとコンポーネントテストが含まれます。
  - その他のファイルは、バックエンドロジックの単体テストまたは統合テストです。
- **`scripts/`:** テスト依存関係のインストールなど、ヘルパースクリプトが含まれます。

## 参考文献

- [ElizaOS CLI install](https://docs.elizaos.ai/installation)
- [ZlizaOS Quickstart](https://docs.elizaos.ai/quickstart)
- [Youtube - tutorial](https://www.youtube.com/watch?v=MP4ldEqmTiE&list=PLrjBjP4nU8ehOgKAa0-XddHzE0KK0nNvS&index=3)
- [customize-an-agent](https://docs.elizaos.ai/guides/customize-an-agent)
