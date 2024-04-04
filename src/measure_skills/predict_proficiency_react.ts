import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";
import { z } from "zod";
// import { JSONLoader } from "langchain/document_loaders/fs/json";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorDBQAChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ParsedResume } from "../resume_parser/resumeType";

// --- as of 2024-04-04, the following code is not yet available without deprecated code ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ReAct Agent to predict proficiency level of skills
// https://github.com/joelparkerhenderson/maturity-models/blob/main/examples/skill/skills-maturity-model-by-prowareness/index.md
const text = fs.readFileSync(path.join(`${__dirname}/scores.txt`), "utf-8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const zodSchema = z.object({
  knowledges: z
    .array(
      z.object({
        knowledge: z.string().describe("Knowledge"),
        level: z
          .string()
          .describe(
            "Proficiency level, e.g. Novice, Intermediate, Advanced, Expert",
          ),
        reason: z.string().describe("Reason for this proficiency"),
      }),
    )
    .describe("skill proficiencies"),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
  template: "Format input.\n{format_instructions}\n{input}",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions },
});

const main = async (filepath: string) => {
  const docs = await textSplitter.createDocuments([text]); // await loader.load();
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  const model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
  const chain = VectorDBQAChain.fromLLM(model, vectorStore);

  const tools = [
    new ChainTool({
      name: "knowledge-proficiency-level",
      description:
        "knowledge proficiency level - useful when you need to refer about knowledge proficiency level",
      chain,
    }),
  ];
  const skills: string[] = [
    "GraphQL",
    "Rust",
    "TypeScript",
    "Python",
    "iOS native app development",
    "Android native app development",
    "Chrome/Safari Browser extension development",
    "Next.js",
    "Recommendation system using AI/ML",
  ];

  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];
  // const outDir = path.join(`${__dirname}/../../out/`);
  const workexperiences = resumes[0].workExperiences
    .map(
      (we) =>
        `Company:${we?.company}, Title:${we?.title}, ${we?.description}` || "",
    )
    .join("\n\n");

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-zero-shot-react-description", // Allowing to use tools properly https://github.com/langchain-ai/langchain/issues/1559
    verbose: true,
  });

  let input = `Provide knowledge proficiency level and reasoning for each skill, only from the workexperience below. If a knowledge is not mentioned, answer "unknown".\nSkills:${skills.join(
    ",",
  )}\nWorkexperience: ${workexperiences}`;
  const result = await executor.call({ input });

  // --output--
  /**
   {
  "text": "Thought: The question asks for knowledge proficiency level and reasoning for each skill based on the provided work experience. I will go through each skill and check if it is mentioned in the work experience. If it is, I will provide a proficiency level based on the context in which it is mentioned. If it is not mentioned, I will answer \"unknown\".\n\nSkill: GraphQL\nThought: GraphQL is mentioned in both the Superformula and Devsu work experiences. It seems to be a key technology used in both roles, suggesting a high proficiency level.\nFinal Answer: High proficiency - Used as a key technology in two roles.\n\nSkill: Rust\nThought: Rust is not mentioned in any of the work experiences.\nFinal Answer: Unknown\n\nSkill: TypeScript\nThought: TypeScript is mentioned in the Superformula work experience. It is listed as one of the main technologies used, suggesting a high proficiency level.\nFinal Answer: High proficiency - Used as a main technology in the role at Superformula.\n\nSkill: Python\nThought: Python is not mentioned in any of the work experiences.\nFinal Answer: Unknown\n\nSkill: iOS native app development\nThought: iOS native app development is not mentioned in any of the work experiences.\nFinal Answer: Unknown\n\nSkill: Android native app development\nThought: Android native app development is not mentioned in any of the work experiences.\nFinal Answer: Unknown\n\nSkill: Chrome/Safari Browser extension development\nThought: Chrome/Safari Browser extension development is not mentioned in any of the work experiences.\nFinal Answer: Unknown\n\nSkill: Next.js\nThought: Next.js is mentioned in the Superformula work experience. It is listed as one of the main technologies used, suggesting a high proficiency level.\nFinal Answer: High proficiency - Used as a main technology in the role at Superformula.\n\nSkill: Recommendation system using AI/ML\nThought: Recommendation system using AI/ML is not mentioned in any of the work experiences.\nFinal Answer: Unknown"
}
   */

  // Format answer
  const format = await prompt.format({
    input: result.output,
  });
  const response = await model.call(format);

  console.log(await parser.parse(response));
};

main(path.join(`${__dirname}/../../out/test/parsed_resumes.json`)).catch(
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
