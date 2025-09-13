// ElizaOSコアから必要なモジュールをインポートします。
import {
  logger, // ロギング用のモジュール
  type IAgentRuntime, // エージェントのランタイム環境の型定義
  type Project, // プロジェクト全体の型定義
  type ProjectAgent, // プロジェクトエージェントの型定義
} from "@elizaos/core";
// スタータープラグインをインポートします。
import starterPlugin from "./plugins/plugin.ts";
// サンプルのキャラクター設定をインポートします。
import { character } from "./characters/sample.ts";

/**
 * デフォルトのキャラクターを初期化する関数です。
 * @param {object} param - ランタイム情報を含むオブジェクト
 * @param {IAgentRuntime} param.runtime - エージェントのランタイム環境
 */
const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info("Initializing character"); // キャラクターの初期化開始をログに出力
  logger.info({ name: character.name }, "Name:"); // キャラクター名をログに出力
};

/**
 * Project Agent インスタンスを初期化します。
 * これがエージェントの本体設定です。
 */
export const projectAgent: ProjectAgent = {
  character, // 使用するキャラクター設定
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }), // 初期化関数
  // plugins: [starterPlugin], <-- ここでカスタムプラグインをインポートします
};

/**
 * プロジェクト全体の設定です。
 * 複数のエージェントを定義できます。
 */
const project: Project = {
  agents: [projectAgent], // このプロジェクトで利用するエージェントのリスト
};

// プロジェクト設定をデフォルトエクスポートします。
export default project;
