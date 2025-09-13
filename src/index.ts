import {
  logger,
  type IAgentRuntime,
  type Project,
  type ProjectAgent,
} from "@elizaos/core";
import starterPlugin from "./plugins/plugin.ts";
import { character } from "./characters/sample.ts";

/**
 * デフォルトのキャラクター
 */
const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info("Initializing character");
  logger.info({ name: character.name }, "Name:");
};

/**
 * Project Agent インスタンスを初期化
 */
export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  // plugins: [starterPlugin], <-- Import custom plugins here
};

const project: Project = {
  agents: [projectAgent],
};

export default project;
