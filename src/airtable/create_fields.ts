import dotenv from "dotenv";

dotenv.config();

// Personal Access Token
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

export const createFields = async (
  fields: Record<string, string>,
  baseId: string,
  tableId: string,
) => {
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
    if (type === "checkbox") {
      req["options"] = {
        color: "greenBright",
        icon: "check",
      };
    }
    const r = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`,
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
