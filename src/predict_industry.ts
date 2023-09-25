import dotenv from "dotenv";
dotenv.config();

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { GoogleCustomSearch } from "langchain/tools";

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  name: "Company name",
  category: "Category of business",
});

const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
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

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: false,
  });

  let input = `What is the category of business of this company? If a website link is provided, use the link to make prediction, for example, search with "What does https://google.com do?".\n Company name: ${companyName}`;
  if (website) {
    input += `\n Website: ${website}`;
  }
  const result = await executor.call({ input });

  // Format answer
  const format = await prompt.format({
    input: result.output,
  });
  const response = await model.call(format);

  console.log(await parser.parse(response));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
