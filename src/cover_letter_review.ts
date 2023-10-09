// 1. Create embed from job description. Store in Vector DB.
// 2. List skills and explanations about culture fit that are mentioned in a cover letter.
// 3. Give score to each candidate. 3 point for must have skills, 2 point for nice to have skills, 1 point for culture fit.
import dotenv from "dotenv";
dotenv.config();

import jdJson from "./test/jd.json" assert { type: "json" };
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const embeddings = new OpenAIEmbeddings();
const chat = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4",
});

const generateHighlightPrompt = async (
  chat: ChatOpenAI,
  input: string,
  meta: string[],
) => {
  const metastr = meta.join(",");
  const zodSchema = z.object({
    qualities: z
      .array(
        z.object({
          quality: z.string().describe(`quality`),
          type: z.string().describe(`type(${metastr})`),
        }),
      )
      .describe(`List of ${metastr}`),
  });

  const parser = StructuredOutputParser.fromZodSchema(zodSchema);

  const formatInstructions = parser.getFormatInstructions();
  const formatPrompt = new PromptTemplate({
    template:
      "{instruction}. Format input in json.\n{format_instructions}\n{input}",
    inputVariables: ["input", "instruction"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const format = await formatPrompt.format({
    instruction: `Categories this qualities into types: ${metastr}\n`,
    input: `qualities: ${input}`,
  });
  // https://js.langchain.com/docs/modules/model_io/output_parsers/how_to/use_with_llm_chain
  const outputFixingParser = OutputFixingParser.fromLLM(chat, parser);
  return { format, outputFixingParser };
};

const main = async () => {
  // Step1. Create embed from job description. Store in Vector DB.
  const vectorStorePath = path.join(`${__dirname}/test/`, "jd_vector_store");
  let vectorStore;
  let meta: string[] = [];
  if (fs.existsSync(vectorStorePath)) {
    console.log("Loading vector store ...");
    // Load the vector store from the same directory
    vectorStore = await HNSWLib.load(vectorStorePath, embeddings);
    jdJson.jd.forEach((item: any) => {
      if (!meta.includes(item.meta)) {
        meta.push(item.meta);
      }
    });
  } else {
    console.log("No vector store. Creating vector store from jd ...");
    const jd = jdJson.jd;
    const docs: Document[] = [];
    for (let i = 1; i < jd.length; i++) {
      const item = jd[i];
      const newDoc = new Document({
        pageContent: item.text,
        metadata: { meta: item.meta },
      });
      if (!meta.includes(item.meta)) {
        meta.push(item.meta);
      }
      docs.push(newDoc);
    }
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    // Save the vector store to a directory
    const directory = path.join(`${__dirname}/test/`, "jd_vector_store");
    await vectorStore.save(directory);
  }

  console.log("Read Cover Letter ...");
  // Step2. List skills and explanations about culture fit that are mentioned in a cover letter.
  const cvPath = path.join(`${__dirname}/test/`, "cover_letter_04.txt");
  const loader = new TextLoader(cvPath);
  const docs = await loader.load();

  console.log("=== Cover Letter ===\n", docs[0].pageContent);
  console.log("\n\nSummarizing Cover Letter ... \n");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an HR expert. Your objective is to help a company to get insight from candidate's cover letter.`,
    ],
    ["human", "{input}"],
  ]);

  const r = await prompt.pipe(chat).invoke({
    input: `Explain explicit skills that this person is capable of from a cover letter. Ignore when passion is mentioned.\nCover letter: ${docs[0].pageContent}`,
  });
  console.log("=== Summarized Cover Letter ===\n", r.content);
  console.log("\n\nReviewing qualities ...\n");

  const highlightPrompt = await generateHighlightPrompt(chat, r.content, meta);
  // console.log(highlightPrompt.format);

  const chain = new LLMChain({
    llm: chat,
    prompt: prompt,
    outputParser: highlightPrompt.outputFixingParser,
    outputKey: "output",
  });

  const result = await chain.call({ input: highlightPrompt.format });

  // console.log(JSON.stringify(result.output));
  // Compare the result with the vector store and see if there is any match.
  const qualities = result.output.qualities as {
    quality: string;
    type: string;
  }[];
  console.log("====== Review Results ======\n");
  qualities.forEach(async (quality) => {
    const similarity = await vectorStore.similaritySearchWithScore(
      quality.quality,
      1,
      (d: Document) => {
        return d.metadata.meta === quality.type;
      },
    );
    // We can assume there's a strong similarity
    if (similarity[0][1] < 0.15) {
      console.log(
        `type: ${quality.type} --- ${quality.quality} --- score: ${Math.floor(
          (1 - similarity[0][1]) * 100,
        )} %`,
      );
    }
  });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
