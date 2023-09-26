import dotenv from "dotenv";
dotenv.config();
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  FewShotPromptTemplate,
  PromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";

import { RunnableSequence } from "langchain/schema/runnable";
import { BufferMemory } from "langchain/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { checkbox, input } from "@inquirer/prompts";

import fs from "fs";

// Examples for the few-shot prompt
const examples = [
  {
    skill: "Next.js(React), TypeScript, Tailwind CSS",
    question: `["How long is the year of experience required for Next.js(React)?",\n"How long is the year of experience required for TypeScript?",\n "How long is the year of experience required for Tailwind CSS?",\n"Which ones are required? Next.js(React), TypeScript, Tailwind CSS"]`,
  },
  {
    skill: "Node.js, Express.js, MongoDB",
    question: `["How long is the year of experience required for Node.js?",\n"How long is the year of experience required for Express.js?",\n"How long is the year of experience required for MongoDB?",\n"Which ones are required? Node.js, Express.js, MongoDB"]`,
  },
  {
    skill: "Python, Django, PostgreSQL",
    question: `["How long is the year of experience required for Python?",\n "How long is the year of experience required for Django?",\n "How long is the year of experience required for PostgreSQL?",\n "Which ones are required? Python, Django, PostgreSQL"`,
  },
];
const examplePrompt = new PromptTemplate({
  inputVariables: ["skill", "question"],
  template: "Input: {skill}\nOutput: {question}",
});

const fewShotPrompt = new FewShotPromptTemplate({
  examples,
  examplePrompt: examplePrompt,
  prefix:
    "Create questions that ask which skills are required and How long is the year of experience required for each skill. Provide in array format. ",
  suffix: "Input: {skill}\nOutput:",
  inputVariables: ["skill"],
});
const model = new ChatOpenAI({ temperature: 0 });
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an HR expert. Your objective is to help the company improve the completeness and clarity of their job description. ${await fewShotPrompt.format(
      { skill: "AWS Lambda function, AWS Cognito" },
    )}`,
  ],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const memory = new BufferMemory({
  returnMessages: true,
  inputKey: "input",
  outputKey: "output",
  memoryKey: "history",
});

const chain = RunnableSequence.from([
  {
    input: (initialInput) => initialInput.input,
    memory: () => memory.loadMemoryVariables({}),
  },
  {
    input: (previousOutput) => previousOutput.input,
    history: (previousOutput) => previousOutput.memory.history,
  },
  prompt,
  model,
]);

// /Users/tomoima525/workspace/typescript/llm-experiments/src/test/jd.md
const main = async () => {
  try {
    const path = await input({
      message:
        "please provide a path to a job description file e.g. /Users/username/Downloads/job_description.txt:",
    });
    const exists = fs.existsSync(path);
    if (!exists) {
      console.log("File does not exist");
      return;
    }
    const loader = new TextLoader(path);
    const docs = await loader.load();
    const jd = docs[0].pageContent;

    const initialInput = {
      input: `Please provide follow-up questions for technical requirements. Create questions that ask which skills are required and How long is the year of experience required for each skill. Provide in array format. Job description: ${jd}`,
    };

    const response = await chain.invoke(initialInput);

    await memory.saveContext(initialInput, {
      output: response,
    });
    console.log("===== questions to ask =====");
    const list = JSON.parse(response.content);

    // Asking questions for all technologies
    // for (let i = 0; i < list.length; i++) {
    //   const element = list[i];
    //   const result = input({
    //     message: element,
    //   });
    //   const qInput = {
    //     input: `The answer to ${element} is: ${result}`,
    //   };
    //   const response = await chain.invoke(qInput);
    //   await memory.saveContext(qInput, {
    //     output: response,
    //   });
    // }

    const requiredQuestion = list[list.length - 1];
    const listInput = {
      input: `Please list skills as an array: ${requiredQuestion}`,
    };

    const listResponse = await chain.invoke(listInput);
    const choices = JSON.parse(listResponse.content).map((e) => {
      return {
        name: e,
        value: e,
      };
    });
    const result = checkbox({
      message: `${requiredQuestion}: `,
      choices,
    });

    const qInput = {
      input: `The answer to ${requiredQuestion} is: ${result}`,
    };
    const res = await chain.invoke(qInput);
    await memory.saveContext(qInput, {
      output: res,
    });

    const finalInput = {
      input:
        "Based on the answers, update the job description with technical requirements. Technical requirements should have the following format: {skill} - {required or optional}",
    };
    const finalResponse = await chain.invoke(finalInput);
    console.log("===== refined output =====");
    console.log(finalResponse.content);
  } catch (error) {
    console.log(error);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
