import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { ParsedResume } from "../resume_parser/resumeType.js";
import { exit } from "process";
import { requirementReview } from "./requirements_review.js";
import { runBatch } from "../batch/index.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const reviewSkills = async (filepath: string): Promise<void> => {
  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];
  const outDir = path.join(`${__dirname}/../../out/`);

  const result: {
    email: string;
    requiredSkill: boolean;
    leadershipRole: boolean;
    leadershipSkill: boolean;
  }[] = [];
  await runBatch(
    resumes.length,
    10,
    async (taskId) => {
      console.log(`Processing task ${taskId}`);
      const resume = resumes[taskId];
      if (!resume) {
        console.log(`No resume for task ${taskId}`);
        return;
      }
      result.push(await requirementReview(resume));
    },
    async (batchId) => {
      console.log(`Storing batch ${batchId}`);
      // store temp result in `out` folder
      fs.writeFileSync(
        path.join(outDir, "glasp_requirements_review.json"),
        JSON.stringify(result, null, 2),
      );
    },
  );
  // store result in `out` folder
  fs.writeFileSync(
    path.join(outDir, "glasp_requirements_review.json"),
    JSON.stringify(result, null, 2),
  );
};

reviewSkills(
  path.join(`${__dirname}/../../out/glasp/parsed_resumes.json`),
).catch((e) => {
  console.error(e);
  exit(1);
});
