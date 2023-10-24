import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ParsedResume } from "../resume_parser/resumeType";
import { Parser } from "@json2csv/plainjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tags2csv = async (folderpath: string) => {
  const categories = fs
    .readdirSync(folderpath)
    .filter((file) => file.startsWith("categorize"))
    .map((file) => {
      const buffer = fs.readFileSync(path.join(folderpath, file));

      const c = JSON.parse(buffer.toString()) as { skill: string; tags: [] }[];
      return c.map((x) => {
        const tags = x.tags.join(",");
        return { skill: x.skill, tags };
      });
    })
    .flatMap((x) => x);
  const outDir = path.join(`${__dirname}/../../out/`);

  const parser = new Parser();
  const csv = parser.parse(categories);

  fs.writeFileSync(path.join(outDir, "all-categories.csv"), csv);
};

tags2csv(path.join(`${__dirname}/../../out/`)).catch((e) => {
  console.error(e);
  process.exit(1);
});
