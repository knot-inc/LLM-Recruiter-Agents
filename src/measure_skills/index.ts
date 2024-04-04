import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Knowledge, ParsedResume } from "../resume_parser/resumeType";
import { runBatch } from "../batch/index.js";
import {
  formatPrompt,
  generateSkillPrompt,
  parser,
  predictProficiencyChain,
} from "./predict_proficiency_chain.js";
import { OpenAI } from "@langchain/openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emails = ["add emails here"];
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

const main = async (filepath: string) => {
  const model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
  const chain = await predictProficiencyChain(model);

  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];
  const selectedResumes = resumes.filter((r) => emails.includes(r.email));

  const results: {
    email: string;
    knowledges?: Knowledge[];
  }[] = [];

  await runBatch(
    selectedResumes.length,
    5,
    async (taskId) => {
      console.log(`Processing task ${taskId}`);
      const resume = selectedResumes[taskId];
      if (!resume) {
        console.log(`No resume for task ${taskId}`);
        return;
      }
      const result = await chain.invoke(generateSkillPrompt(resume, skills));
      // Format answer
      const format = await formatPrompt.format({
        input: result,
      });
      const response = await model.call(format);
      const parsedResult = await parser.parse(response);
      results.push({
        email: resume.email,
        knowledges: parsedResult.knowledges,
      });
    },
    async (batchId) => {
      console.log(`Storing batch ${batchId}`);
      // store temp result in `out` folder
      fs.writeFileSync(
        path.join(__dirname, `../../out/glasp/measure_skill_2.json`),
        JSON.stringify(results, null, 2),
      );
    },
  );
};

main(path.join(`${__dirname}/../../out/glasp/parsed_resumes.json`)).catch(
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
