import fs from "fs";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { parseResume } from "./parse_resume.js";
import { fileURLToPath } from "url";
import { Resume } from "./resumeType.js";
import { calculateMonthsBetweenDates } from "./calculate_workmonth.js";
import { calculateValidSkills } from "./calculate_skills.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  // load resumes from `resume` folder and parse them
  const resumesDir = path.join(`${__dirname}/../../resume/test`);
  const resumes = fs.readdirSync(resumesDir);
  const parsedResumes: { filename: string; resume: Resume }[] = [];
  for (const resume of resumes) {
    if (resume.endsWith(".pdf") || resume.endsWith(".docx")) {
      console.log(`Parsing ${resume}`);
      parsedResumes.push({
        filename: resume,
        resume: await parseResume(path.join(resumesDir, resume)),
      });
    }
  }

  // const resumesDir = path.join(`${__dirname}/../../out`);
  // const resumes = fs.readdirSync(resumesDir);
  // const parsedResumes: { filename: string; resume: Resume }[] = [];
  // for (const resume of resumes) {
  //   if (resume.endsWith(".json")) {
  //     console.log(`${resume}`);

  //     const buffer = fs.readFileSync(path.join(resumesDir, resume));
  //     const resumeJson = JSON.parse(buffer.toString());
  //     parsedResumes.push({
  //       filename: resume,
  //       resume: resumeJson,
  //     });
  //   }
  // }

  // put it in to a json format
  const v = [];
  for (const parseRes of parsedResumes) {
    if (
      parseRes.resume.ParsingResponse.Code !== "Success" &&
      !parseRes.resume.ResumeData
    ) {
      console.log(
        `Failed to parse resume ${parseRes.filename}:`,
        parseRes.resume.ParsingResponse.Message,
      );
      continue;
    }
    const resume = parseRes.resume.ResumeData;
    const email = (resume.ContactInformation.EmailAddresses || [""])[0];
    const github = resume.ContactInformation.WebAddresses?.find(
      (x) => x.Type === "GitHub",
    )?.Address;
    const linkedin = resume.ContactInformation.WebAddresses?.find(
      (x) => x.Type === "LinkedIn",
    )?.Address;
    const portfolio = resume.ContactInformation.WebAddresses?.find(
      (x) => x.Type === "PersonalWebsite",
    )?.Address;
    const workSummary = resume.EmploymentHistory.ExperienceSummary;
    const totalWorkExperience =
      resume.EmploymentHistory.ExperienceSummary.MonthsOfWorkExperience;
    const workExperiences = resume.EmploymentHistory.Positions?.map((p) => {
      const months = calculateMonthsBetweenDates(
        p.StartDate?.Date,
        p.EndDate?.Date,
      );
      return {
        id: Number(p.Id.replace("POS-", "")),
        startDate: p.StartDate?.Date || "unknown",
        endDate: p.EndDate?.Date || "unknown",
        months,
        title: p.JobTitle?.Normalized || "unknown",
        company: p.Employer?.Name?.Normalized || "unknown",
        description: p.Description?.replaceAll("\n", " ") || "unknown",
      };
    })
      .sort((a, b) => a.id - b.id)
      .slice(0, 3);
    const companies = workExperiences.map((w) => w.company);
    const skills = calculateValidSkills(resume);
    v.push({
      email,
      github,
      linkedin,
      portfolio,
      totalWorkExperience,
      workExperiences,
      workSummary,
      skills,
      companies,
    });
  }

  // write it to a file
  const outDir = path.join(`${__dirname}/../../out/test`);
  if (fs.existsSync(outDir) === false) {
    fs.mkdirSync(outDir);
  }
  fs.writeFileSync(path.join(outDir, "parsed_resumes.json"), JSON.stringify(v));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
