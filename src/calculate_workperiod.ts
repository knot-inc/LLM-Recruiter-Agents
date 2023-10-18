import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ParsedResume } from "./resume_parser/resumeType";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Quit 2+ jobs in less than a year in the last 3 companies
// Worked for more than 2 years in 2 out of the last 3 companies
const checkWorkPeriod = async (filepath: string) => {
  const buffer = fs.readFileSync(filepath);
  const resumes = JSON.parse(buffer.toString()) as ParsedResume[];
  const outDir = path.join(`${__dirname}/../out/`);

  const result: {
    email: string;
    hasWorkPeriodLessThanOneYear: boolean;
    hasWorkPeriodMoreThanTwoYears: boolean;
  }[] = [];
  for (const resume of resumes) {
    const email = resume.email;
    const hasWorkPeriodMoreThanTwoYears =
      resume.workExperiences
        .map((workExperience) => {
          return workExperience.months >= 24;
        })
        .filter((w) => w).length >= 2;

    // If the first work experience is more than 1 year, then we don't need to check the rest
    const recentWorkExperience = resume.workExperiences[0] || { months: 0 };
    if (recentWorkExperience?.months >= 12) {
      result.push({
        email,
        hasWorkPeriodLessThanOneYear: false,
        hasWorkPeriodMoreThanTwoYears,
      });
      continue;
    }
    const workExperiences = resume.workExperiences?.slice(1) || [];

    const hasWorkPeriodLessThanOneYear = workExperiences.some(
      (workExperience) => {
        return workExperience.months < 12;
      },
    );
    result.push({
      email,
      hasWorkPeriodLessThanOneYear,
      hasWorkPeriodMoreThanTwoYears,
    });
  }
  fs.writeFileSync(
    path.join(outDir, "glasp_workperiod.json"),
    JSON.stringify(result, null, 2),
  );
};

checkWorkPeriod(
  path.join(`${__dirname}/../out/glasp/parsed_resumes.json`),
).catch((e) => {
  console.error(e);
  process.exit(1);
});
