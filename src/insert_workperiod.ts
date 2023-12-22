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
const RECUITMENT_POC_BASE_ID = process.env.RECUITMENT_POC_BASE_ID as string;
const JOB_APPLICANTS_TABLE_ID = process.env.JOB_APPLICANTS_TABLE_ID as string;

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/glasp_workperiod.json`),
  );

  const resumes = JSON.parse(resumesBuffer.toString()) as {
    email: string;
    hasWorkPeriodLessThanOneYear: boolean;
    hasWorkPeriodMoreThanTwoYears: boolean;
  }[];

  // create fields (required only once)
  // const fields = {
  //   "Issue with workPeriod": "checkbox",
  //   "Worked more than 2 years": "checkbox",
  // };
  // await createFields(fields, RECUITMENT_POC_BASE_ID, JOB_APPLICANTS_TABLE_ID);
  for (const resume of resumes) {
    const email = resume.email;
    await updateAirtableRecord({
      email,
      fields: {
        "Issue with workPeriod": resume.hasWorkPeriodLessThanOneYear,
        "Worked more than 2 years": resume.hasWorkPeriodMoreThanTwoYears,
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
