import dotenv from "dotenv";
dotenv.config();

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";

const model = new OpenAI({ temperature: 0 });
const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    hl: "en",
    gl: "us",
  }),
];

const main = async () => {
  const companyName = process.argv[2];
  const website = process.argv[3];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: false,
  });

  let input = `What is the category of business of this company? Answer only the category. If a website link is provided, use the link to make prediction, for example, search with "What does https://google.com do?".\n Company name: ${companyName}`;
  if (website) {
    input += `\n Website: ${website}`;
  }
  const result = await executor.call({ input });
  console.log(result);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
