import { ParsedResume } from "../resume_parser/resumeType";
import { requiredSkillMentionPrompt } from "./requirements_prompts.js";
import { resumeLLMChain } from "./resume_chain.js";

export const skillsReview = async (resume: ParsedResume) => {
  const chain = resumeLLMChain(resume);
  const requiredSkillMention = await chain.invoke({
    input: requiredSkillMentionPrompt,
  });

  return {
    email: resume.email || "",
    requiredSkill: requiredSkillMention.text.toLowerCase() === "yes",
  };
};
