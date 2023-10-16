import { calculateValidSkills } from "./calculate_skills";
import resume from "./resume.json";
import { ResumeData } from "./resumeType";

describe("calculateValidSkills", () => {
  it("should return an array of valid skills", () => {
    const typedResume = resume as ResumeData;
    const validSkills = calculateValidSkills(typedResume);
    expect(validSkills).toEqual([
      "Amazon Web Services",
      "Node.Js",
      "NestJS",
      "Redis",
      "WebSocket",
      "Backend",
      "Front End Software Development",
    ]);
  });
});
