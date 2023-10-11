import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { Resume } from "./resumeType.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = (postData: string) => ({
  method: "POST",
  headers: {
    "Sovren-AccountId": `${process.env.SOVREN_ACCOUNT_ID}`,
    "Sovren-ServiceKey": `${process.env.SOVREN_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: postData,
});

export const parseResume = async (filepath: string): Promise<Resume> => {
  const base64Doc = fs.readFileSync(filepath).toString("base64");
  const modifiedDate: string = new Date(fs.statSync(filepath).mtimeMs)
    .toISOString()
    .substring(0, 10);
  // other options here (see https://sovren.com/technical-specs/latest/rest-api/resume-parser/api/)
  const postData: string = JSON.stringify({
    DocumentAsBase64String: base64Doc,
    DocumentLastModified: modifiedDate,
    SkillsSettings: {
      Normalize: true,
    },
  });
  const response = await fetch(
    "https://rest.resumeparsing.com/v10/parser/resume",
    options(postData),
  );
  const data = await response.json();
  const resume = data.Value as Resume;
  //console.log(JSON.stringify(resume));

  // Write result to file
  const outDir = path.join(`${__dirname}/../../out/`);
  if (fs.existsSync(outDir) === false) {
    fs.mkdirSync(outDir);
  }
  const fileName = path.basename(filepath).replace(".pdf", ".json");

  fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(resume));
  return resume;
};
