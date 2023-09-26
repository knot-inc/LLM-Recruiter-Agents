import dotenv from "dotenv";
import Airtable from "airtable";
dotenv.config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

const RECUITMENT_POC_BASE_ID = "appAzPLABIFEnKEaq";
const JOB_APPLICANTS_TABLE_ID = "tblPkxGkE589uoHUy";

type updateAirtableRecordParams = {
  email: string;
  columnName: string;
  columnValue: string;
  tableId: string;
};
const updateAirtableRecord = async (params: updateAirtableRecordParams) => {
  const { email, columnName, columnValue, tableId } = params;

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    RECUITMENT_POC_BASE_ID,
  );

  // we need to the get ID of the record
  // e.g. reccHwii16nCv5rBB
  const records = await base(tableId)
    .select({ filterByFormula: `{Email} = "${email}"`, maxRecords: 1 })
    .firstPage();

  if (records && records.length > 0) {
    const recordId = records[0].getId();

    // Now use the retrieved ID to update the record.
    await base(tableId).update([
      {
        id: recordId,
        fields: {
          [columnName]: columnValue,
        },
      },
    ]);

    console.log("Done.");
  } else {
    console.log("No record found for the email:", email);
  }
};

const main = async () => {
  try {
    const workExperiences = [
      {
        "Company Name": "Google",
        Industry: "Technology",
        "Job Title": "Software Engineer",
        "Years of Experience": 2,
      },
      {
        "Company Name": "Facebook",
        Industry: "Technology",
        "Job Title": "Senior Software Engineer",
        "Years of Experience": 3,
      },
    ];

    await updateAirtableRecord({
      email: "test@gmail.com",
      columnName: "Work Experiences",
      columnValue: JSON.stringify(workExperiences, null, 2),
      tableId: JOB_APPLICANTS_TABLE_ID,
    });
  } catch (error) {
    console.log("error calling airtable: ", error);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
