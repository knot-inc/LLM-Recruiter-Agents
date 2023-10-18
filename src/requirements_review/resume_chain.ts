import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "langchain/chat_models/openai";
import { ParsedResume } from "../resume_parser/resumeType.js";
import { LLMChain } from "langchain/chains";
import { ChatPromptTemplate } from "langchain/prompts";

const chat = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4", // "gpt-3.5-turbo" does not provide good result
  maxConcurrency: 5,
  maxRetries: 3,
  timeout: 60000,
});

export const resumeLLMChain = (resume: ParsedResume) => {
  // workaround to escape curly braces
  const stringified = JSON.stringify(resume)
    .replace(/\{/g, "{{")
    .replace(/\}/g, "}}");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an HR expert. Your objective is to provide insight from candidate's work experience. Answer questions based on following json: ${stringified}`,
    ],
    ["human", "{input}"],
  ]);

  const chain = new LLMChain({
    llm: chat,
    prompt,
    //verbose: true,
  });

  return chain;
};
