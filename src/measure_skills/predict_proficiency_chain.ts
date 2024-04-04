import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ParsedResume } from "../resume_parser/resumeType";
import { OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const text = fs.readFileSync(path.join(`${__dirname}/scores_v2.txt`), "utf-8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const serializedDocs = (docs: Array<Document>) =>
  docs.map((doc) => doc.pageContent).join("\n\n");
// Predict proficiency level of skills using chain
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
    .describe("knowledge level proficiencies"),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const formatInstructions = parser.getFormatInstructions();
const formatPrompt = new PromptTemplate({
  template: "Format input.\n{format_instructions}\n{input}",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions },
});

export const predictProficiencyChain = async (model: OpenAI) => {
  // Create documents from the knowledge proficiency level text.
  const docs = await textSplitter.createDocuments([text]);
  // Create a vector store from the documents.
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  // Initialize a retriever wrapper around the vector store
  const vectorStoreRetriever = vectorStore.asRetriever();

  const chatPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an HR expert. Your objective is to provide knowledge proficiency level from candidate's work experience. Refer to the following text that defines knowledge proficiency level\n" +
        "---------\n" +
        "{context}",
    ],
    ["human", "{question}"],
  ]);

  // When used in LLMChain
  // const chain = new LLMChain({
  //   llm: model,
  //   prompt: chatPrompt,
  //   verbose: true,
  //   outputKey: "output",
  // });
  // const result = await chain.invoke({
  //   context: text, // can not handle vector store so we must pass raw text,
  //   question,
  // });
  return RunnableSequence.from([
    {
      context: vectorStoreRetriever.pipe(serializedDocs),
      question: new RunnablePassthrough(),
    },
    chatPrompt,
    model,
    new StringOutputParser(),
  ]);
};

const generateSkillPrompt = (resume: ParsedResume, skills: string[]) => {
  const workexperiences = resume.workExperiences
    .map(
      (we) =>
        `Company:${we?.company}, Title:${we?.title}, ${we?.description}` || "",
    )
    .join("\n\n");

  return `Answer knowledge proficiency level and reasoning for each skill, only from the workexperience below. Go through each skill and check if it is mentioned in the work experience. If it is, provide a proficiency level based on the context in which it is mentioned. If a knowledge is not mentioned, answer "unknown".\nSkills:${skills.join(
    ",",
  )}\nWorkexperience: ${workexperiences}`;
};

export { formatPrompt, generateSkillPrompt, parser };
