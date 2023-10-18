import { ParsedResume } from "../resume_parser/resumeType";
import {
  leadershipRoleMentionPrompt,
  leadershipSkillMentionPrompt,
  requiredSkillMentionPrompt,
} from "./requirements_prompts.js";
import { resumeLLMChain } from "./resume_chain.js";

export const requirementReview = async (resume: ParsedResume) => {
  const chain = resumeLLMChain(resume);
  const requiredSkillMention = await chain.invoke({
    input: requiredSkillMentionPrompt,
  });

  const leadershipRoleMention = await chain.invoke({
    input: leadershipRoleMentionPrompt,
  });

  const leadershipSkillMention = await chain.invoke({
    input: leadershipSkillMentionPrompt,
  });

  return {
    email: resume.email || "",
    requiredSkill: requiredSkillMention.text.toLowerCase() === "yes",
    leadershipRole: leadershipRoleMention.text.toLowerCase() === "yes",
    leadershipSkill: leadershipSkillMention.text.toLowerCase() === "yes",
  };
};
