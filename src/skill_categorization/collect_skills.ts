import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ParsedResume } from "../resume_parser/resumeType";
import { Parser } from "@json2csv/plainjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const collectSkills = async (filepath: string) => {
  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];
  const outDir = path.join(`${__dirname}/../../out/`);

  const result: string[][] = [];
  for (const resume of resumes) {
    const skills = resume.skills;
    result.push(skills);
  }

  const flatten = result.flatMap((x) => x);

  // count unique skills in result
  const counts: { [key: string]: number } = {};
  flatten.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });

  const sort = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const parser = new Parser();
  const csv = parser.parse(sort);

  fs.writeFileSync(path.join(outDir, "all-skills.csv"), csv);
};

collectSkills(
  path.join(`${__dirname}/../../out/all_parsed_resumes.json`),
).catch((e) => {
  console.error(e);
  process.exit(1);
});
