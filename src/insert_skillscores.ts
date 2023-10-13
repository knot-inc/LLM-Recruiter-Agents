import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { SkillScore } from "./resume_parser/resumeType.js";
import { updateAirtableRecord } from "./airtable/update_record.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Personal Access Token
const RECUITMENT_POC_BASE_ID = "appCtMM5bG3zNPKG0";
const JOB_APPLICANTS_TABLE_ID = "tbl803RYcqTD7Lk5u";

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/workable/skills_in_each_resume.json`),
  );

  const skillScores = JSON.parse(resumesBuffer.toString()) as SkillScore[];

  for (const skillScore of skillScores) {
    const email = skillScore.email;
    await updateAirtableRecord({
      email,
      fields: {
        SkillScore: skillScore.skillCountsAverage,
      },
      tableId: JOB_APPLICANTS_TABLE_ID,
      baseId: RECUITMENT_POC_BASE_ID,
    });
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
