import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { ParsedResume } from "../resume_parser/resumeType.js";
import { exit } from "process";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const reviewSkills = async (
  filepath: string,
  skills: { skill: string; weight: number }[],
): Promise<void> => {
  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];

  // accumulate workexperiences
  const skillsInEachResume = resumes
    .map((resume) => {
      const w = (resume.workExperiences || [{}])
        .map((we) => we?.description || "")
        .join("\n====================\n");

      return {
        email: resume.email,
        flattenedWorkExperiences: w,
      };
    })
    .map((flattenedResume) => {
      const skillCounts = skills.map((skill) => {
        const count = flattenedResume.flattenedWorkExperiences.match(
          new RegExp(skill.skill, "gi"),
        );
        return { skill, count: (count?.length || 0) * skill.weight };
      });
      const average =
        skillCounts.reduce((acc, curr) => acc + curr.count, 0) /
        skillCounts.length;
      return {
        email: flattenedResume.email,
        skillCounts,
        skillCountsAverage: average,
      };
    });

  // sort by skillCountsAverage
  skillsInEachResume.sort(
    (a, b) => b.skillCountsAverage - a.skillCountsAverage,
  );
  // store result in `out` folder
  const outDir = path.join(`${__dirname}/../../out/`);
  fs.writeFileSync(
    path.join(outDir, "skills_in_each_resume.json"),
    JSON.stringify(skillsInEachResume, null, 2),
  );
};

reviewSkills(path.join(`${__dirname}/../../out/indeed/parsed_resumes.json`), [
  { skill: "React", weight: 3 },
  { skill: "Next.js", weight: 3 },
  { skill: "GraphQL", weight: 3 },
  { skill: "Node.js", weight: 3 },
  { skill: "JavaScript", weight: 3 },
  { skill: "TypeScript", weight: 3 },
  { skill: "Tailwind", weight: 3 },
  { skill: "aws", weight: 3 },
  { skill: "cdk", weight: 3 },
  { skill: "lambda", weight: 3 },
  { skill: "dynamodb", weight: 3 },
  { skill: "postgresql", weight: 3 },
  { skill: "cognito", weight: 3 },
  { skill: "s3", weight: 3 },
  { skill: "auth0", weight: 3 },
  { skill: "git", weight: 3 },
  { skill: "yarn", weight: 3 },
  { skill: "Aurora", weight: 2 },
  { skill: "AppSync", weight: 2 },
  { skill: "Storybook", weight: 2 },
  { skill: "Solidity", weight: 2 },
  { skill: "IPFS", weight: 2 },
  { skill: "Rust", weight: 1 },
  { skill: "Go-lang", weight: 1 },
  { skill: "Golang", weight: 1 },
  { skill: "docker", weight: 1 },
  { skill: "zero knowledge proof", weight: 1 },
  { skill: "figma", weight: 1 },
]).catch((e) => {
  console.error(e);
  exit(1);
});
