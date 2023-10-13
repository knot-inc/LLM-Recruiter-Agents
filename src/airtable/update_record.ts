import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config();

// Personal Access Token
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
type updateAirtableRecordParams = {
  email: string;
  fields: Partial<Record<string, any>>;
  baseId: string;
  tableId: string;
};

export const updateAirtableRecord = async (
  params: updateAirtableRecordParams,
) => {
  const { email, fields, baseId, tableId } = params;

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(baseId);

  // we need to the get ID of the record
  // e.g. reccHwii16nCv5rBB
  const records = await base(tableId)
    .select({ filterByFormula: `{Email} = "${email}"`, maxRecords: 1 })
    .firstPage();
  base(tableId);
  if (records && records.length > 0) {
    const recordId = records[0].getId();
    // console.log(recordId, fields);
    // Now use the retrieved ID to update the record.
    base(tableId).update([
      {
        id: recordId,
        fields,
      },
    ]);

    console.log("Done: " + email);
  } else {
    console.log("No record found for the email:", email);
  }
};
