import dotenv from "dotenv";
dotenv.config();

import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  name: "Company name",
  category: "Category of business",
});

const formatInstructions = parser.getFormatInstructions();
const formatPrompt = new PromptTemplate({
  template: "Format input.\n{format_instructions}\n{input}",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions },
});

const model = new OpenAI({ temperature: 0 });
const tools = [
  new GoogleCustomSearch({
    googleCSEId: process.env.GOOGLE_CSE_ID,
    apiKey: process.env.GOOGLE_API_KEY,
  }),
];

const main = async () => {
  const companyName = process.argv[2];
  const website = process.argv[3];
  const prompt = await pull<PromptTemplate>("hwchase17/react");
  const agent = await createReactAgent({ llm: model, tools, prompt });
  const executor = new AgentExecutor({ agent, tools });

  let input = `What is the category of business of this company? If a website link is provided, use the link to make prediction, for example, search with "What does https://google.com do?".\n Company name: ${companyName}`;
  if (website) {
    input += `\n Website: ${website}`;
  }
  const result = await executor.invoke({ input });
  result;
  // Format answer
  const format = await formatPrompt.format({
    input: result.output,
  });
  const response = await model.invoke(format);

  console.log(await parser.parse(response));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
