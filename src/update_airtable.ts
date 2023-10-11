import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import Airtable from "airtable";
import { fileURLToPath } from "url";
import { ParsedResume } from "./resume_parser/resumeType";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Personal Access Token
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const RECUITMENT_POC_BASE_ID = "appCtMM5bG3zNPKG0";
const JOB_APPLICANTS_TABLE_ID = "tbl4tUbCI0OkJEIKV";

type updateAirtableRecordParams = {
  email: string;
  fields: Partial<Record<string, any>>;
  tableId: string;
};

const createFields = async (fields: Record<string, string>) => {
  const keys = Object.keys(fields);
  keys.forEach(async (key: string) => {
    const type = fields[key];
    console.log("New field: " + key + " type: " + type);
    const req = {
      description: "",
      name: key,
      type,
    };
    if (type === "number") {
      req["options"] = {
        precision: 1,
      };
    }
    const r = await fetch(
      `https://api.airtable.com/v0/meta/bases/${RECUITMENT_POC_BASE_ID}/tables/${JOB_APPLICANTS_TABLE_ID}/fields`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(req),
      },
    );
    console.log(await r.json());
  });
};
const updateAirtableRecord = async (params: updateAirtableRecordParams) => {
  const { email, fields, tableId } = params;

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    RECUITMENT_POC_BASE_ID,
  );

  // we need to the get ID of the record
  // e.g. reccHwii16nCv5rBB
  const records = await base(tableId)
    .select({ filterByFormula: `{Email} = "${email}"`, maxRecords: 1 })
    .firstPage();
  base(tableId);
  if (records && records.length > 0) {
    const recordId = records[0].getId();
    console.log(recordId, fields);
    // Now use the retrieved ID to update the record.
    base(tableId).update([
      {
        id: recordId,
        fields,
      },
    ]);

    console.log("Done.");
  } else {
    console.log("No record found for the email:", email);
  }
};

const main = async () => {
  // read the json file from the out folder
  const resumesBuffer = fs.readFileSync(
    path.join(`${__dirname}/../out/parsed_resumes.json`),
  );

  const resumes = JSON.parse(resumesBuffer.toString()) as ParsedResume[];

  // create fields (required only once)
  // const fields = {
  //   Portfolio: "url",
  //   "Total Work Experience(year)": "number",
  //   "Work Experiences": "multilineText",
  //   Skills: "multilineText",
  // };
  // await createFields(fields);
  for (const resume of resumes) {
    const email = resume.email;
    await updateAirtableRecord({
      email,
      fields: {
        Portfolio: resume.portfolio,
        "Years of Experience": Math.round(resume.totalWorkExperience / 12),
        "Work Experiences": JSON.stringify(resume.workExperiences, null, 2),
        Skills: resume.skills.join(", "),
      },
      tableId: JOB_APPLICANTS_TABLE_ID,
    });
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
