import dotenv from "dotenv";
dotenv.config();
//import { ChatOpenAI } from "langchain/chat_models/openai";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { runBatch } from "../batch/index.js";
import { skills_test } from "./skills.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { FewShotPromptTemplate } from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Examples for the few-shot prompt
const examples = [
  {
    skill: "ReactJS",
    tags: "JavaScript, Front-end Web Development, Framework, Library",
  },
  { skill: "JavaScript (Programming Language)", tags: "Programming Language" },
  { skill: "Node.Js", tags: "Back-end Web Development, Framework, Library" },
  {
    skill: "Cascading Style Sheets (CSS)",
    tags: "Programming Language, Front-end Web Development",
  },
  {
    skill: "Amazon Web Services",
    tags: "Cloud Computing, Serverless Computing, Infrastructure, Toolings, API, Back-end Web Development, DevOps, Performance monitoring, Security, Network, Analytics",
  },
  {
    skill: "MongoDB",
    tags: "Back-end Web Development, Database, NoSQL, Data modeling, Performance tuning",
  },
  {
    skill: "MySQL",
    tags: "Back-end Web Development, Database, SQL, Relational Database, Data modeling, Performance tuning",
  },
  { skill: "Github", tags: "Project management, Toolings" },
  {
    skill: "Django Web Framework",
    tags: "Python, Back-end Web Development, Framework, Library",
  },
];

const examplePrompt = new PromptTemplate({
  inputVariables: ["skill", "tags"],
  template: "Input: {skill}\nOutput: {tags}",
});

const fewShotPrompt = new FewShotPromptTemplate({
  examples,
  examplePrompt: examplePrompt,
  prefix: "Add tags to each skill. Provide in array format. ",
  // suffix: "Input: {skill}\nOutput:",
  inputVariables: [""],
});
const model = new OpenAI({
  temperature: 0,
  modelName: "gpt-4",
});
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a software developer. Your objective is to categorize skills. ${await fewShotPrompt.format(
      {},
    )}`,
  ],
  ["human", "{input}"],
]);

const chain = RunnableSequence.from([
  {
    input: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const zodSchema = z.object({
  skills: z
    .array(
      z.object({
        skill: z.string().describe("skill"),
        tags: z.array(z.string().describe("tags")),
      }),
    )
    .describe("skills with tags"),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const formatInstructions = parser.getFormatInstructions();
const formatPrompt = new PromptTemplate({
  template: "Format input.\n{format_instructions}\n{input}",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions },
});

const main = async () => {
  const skillsList = skills_test;

  const results: {
    skill: string;
    tags?: string[];
  }[] = [];
  try {
    await runBatch(
      skillsList.length,
      5,
      async (taskId) => {
        console.log(`Processing task ${taskId}`);
        const shouldSkip = taskId % 5 !== 0;
        if (shouldSkip) {
          console.log(`Skipping task ${taskId}`);
          return;
        }
        const skills = skillsList.slice(taskId, taskId + 5);
        console.log("skills", skills);

        if (!skills) {
          console.log(`hmmm`);
          return;
        }
        const result = await chain.invoke(
          `Output tags to this skill. Use "unknown" tag if the tag is not predictable. Skills: ${skills.join(
            ", ",
          )}`,
        );
        // Format answer
        const format = await formatPrompt.format({
          input: result,
        });
        const response = await model.call(format);
        // console.log("response", response);
        const parsedResult = (await parser.parse(response)) as {
          skills: { skill: string; tags: string[] }[];
        };

        results.push(...parsedResult.skills);
      },
      async (batchId) => {
        console.log(`Storing batch ${batchId}`);
        // store temp result in `out` folder
        fs.writeFileSync(
          path.join(__dirname, `../../out/categorize.json`),
          JSON.stringify(results, null, 2),
        );
      },
    );
  } catch (error) {
    console.log(error);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
