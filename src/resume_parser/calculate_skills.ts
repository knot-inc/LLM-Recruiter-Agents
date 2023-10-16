/**
 * Calculates the valid skills from the given resume data.
 * Valid skills are
 * - skills that are found in the skills section and work history section.
 * - skills that are mentioned in the first 3 work history positions.
 * @param resume The resume data to calculate the skills from.
 * @returns An array of valid skills found in the resume data.
 */
import { ResumeData } from "./resumeType";

export function calculateValidSkills(resume: ResumeData): string[] {
  const validSkills = resume.Skills.Normalized?.filter(
    (s) =>
      s.FoundIn?.some((f) => f.SectionType === "SKILLS") &&
      s.FoundIn?.some((f) => f.SectionType === "WORK HISTORY"),
  )
    ?.filter(
      (s) =>
        s.FoundIn?.some(
          (f) =>
            (f.SectionType === "WORK HISTORY" &&
              Number(f.Id?.replace("POS-", ""))) ||
            Number.MAX_VALUE <= 3,
        ),
    )
    .map((s) => s.Name);

  return validSkills;
}
