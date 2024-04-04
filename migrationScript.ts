import { updateEntrypointsFrom0_0_xTo0_1_x } from "@langchain/scripts/migrations";

await updateEntrypointsFrom0_0_xTo0_1_x({
  // Path to the local langchainjs repository
  localLangChainPath: "/Users/tomoima525/workspace/typescript/langchainjs",
  // Path to the repository where the migration should be applied
  codePath: "/Users/tomoima525/workspace/typescript/llm-experiments/src",
});
