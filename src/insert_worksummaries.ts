import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { ParsedResume } from "./resume_parser/resumeType.js";
import { updateAirtableRecord } from "./airtable/update_record.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Personal Access Token
const RECUITMENT_POC_BASE_ID = "appCtMM5bG3zNPKG0";
const JOB_APPLICANTS_TABLE_ID = "tblVpRVlakznsJbpu";

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/parsed_resumes.json`),
  );

  const resumes = JSON.parse(resumesBuffer.toString()) as ParsedResume[];

  // create fields (required only once)
  // const fields = {
  //   WorkSummary: "multilineText",
  //   Portfolio: "url",
  //   "Years of Experience": "number",
  //   "Work Experiences": "multilineText",
  //   Skills: "multilineText",
  // };
  // await createFields(fields);
  for (const resume of resumes) {
    const email = resume.email;
    await updateAirtableRecord({
      email,
      fields: {
        WorkSummary: resume.workSummary.Description.replaceAll("\n", "<br>"),
        Portfolio: resume.portfolio,
        "Years of Experience": Math.round(resume.totalWorkExperience / 12),
        "Work Experiences": JSON.stringify(resume.workExperiences, null, 2),
        Skills: (resume.skills || [""]).join(", "),
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
