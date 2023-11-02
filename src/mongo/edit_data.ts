import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import data from "./data/page-1.json" assert { type: "json" };
import { convert } from "html-to-text";

const __filename = fileURLToPath(import.meta.url);

const dir = path.dirname(__filename);

const newData = data.map((d) => ({
  _id: d._id,
  title: d.title,
  location: d.location,
  company: d.company,
  description: convert(d.description),
}));

writeFileSync(
  `${dir}/data/page-1-compressed.json`,
  JSON.stringify(newData, null, 2),
);
