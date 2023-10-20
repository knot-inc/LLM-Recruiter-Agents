import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { updateAirtableRecord } from "./airtable/update_record.js";
import { createFields } from "./airtable/create_fields.js";
import { Knowledge } from "./resume_parser/resumeType.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Personal Access Token
const RECUITMENT_POC_BASE_ID = "appCtMM5bG3zNPKG0";
const JOB_APPLICANTS_TABLE_ID = "tblwY7LZA5CFaJXIF";

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

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/glasp/measure_skill_2.json`),
  );

  const resumes = JSON.parse(resumesBuffer.toString()) as {
    email: string;
    knowledges: Knowledge[];
  }[];

  // create fields (required only once)
  // const fields = skills.reduce((acc, skill) => {
  //   acc[`${skill} Level`] = "multilineText";
  //   return acc;
  // }, {});
  // await createFields(fields, RECUITMENT_POC_BASE_ID, JOB_APPLICANTS_TABLE_ID);
  for (const resume of resumes) {
    const email = resume.email;
    resume.knowledges.forEach(async (knowledge) => {
      if (knowledge.level === "Unknown") {
        return;
      }
      try {
        await updateAirtableRecord({
          email,
          fields: {
            [`${knowledge.knowledge} Level`]: `${knowledge.level}\n - ${knowledge.reason}`,
          },
          tableId: JOB_APPLICANTS_TABLE_ID,
          baseId: RECUITMENT_POC_BASE_ID,
        });
      } catch (e) {
        console.error(e);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
