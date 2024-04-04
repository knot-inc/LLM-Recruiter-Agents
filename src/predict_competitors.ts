import dotenv from "dotenv";
dotenv.config();

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { z } from "zod";
import { OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

const zodSchema = z.object({
  industry: z.string().describe("industry of the company"),
  companies: z
    .array(
      z.object({
        name: z.string().describe("Company name"),
        reason: z.string().describe("Reason why it's related"),
      }),
    )
    .describe("companies that are relavant to the business"),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
  template: "Format input.\n{format_instructions}\n{input}",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions },
});

const model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
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
    agentType: "chat-zero-shot-react-description", // Allowing to use tools properly https://github.com/langchain-ai/langchain/issues/1559
    verbose: false,
  });

  let input = `What is this company's business and what are the competitors or relavant companies? Provide the name and the reasoning why it's related. If a website link is provided, use the link to make prediction, for example, search with "What does https://google.com do?".\n Company name: ${companyName}`;
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
