import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { updateAirtableRecord } from "./airtable/update_record.js";
import { createFields } from "./airtable/create_fields.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Personal Access Token
const RECUITMENT_POC_BASE_ID = "appCtMM5bG3zNPKG0";
const JOB_APPLICANTS_TABLE_ID = "tblIE1UWTaOeMQG0q";

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/glasp_skills_review.json`),
  );

  const resumes = JSON.parse(resumesBuffer.toString()) as {
    email: string;
    requiredSkill: boolean;
  }[];

  // create fields (required only once)
  const fields = {
    HasBrowserExtensionSkill: "checkbox",
  };
  await createFields(fields, RECUITMENT_POC_BASE_ID, JOB_APPLICANTS_TABLE_ID);
  for (const resume of resumes) {
    const email = resume.email;
    await updateAirtableRecord({
      email,
      fields: {
        HasBrowserExtensionSkill: resume.requiredSkill,
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
