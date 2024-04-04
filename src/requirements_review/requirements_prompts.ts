import { PromptTemplate } from "@langchain/core/prompts";

// const skills = ["Firebase", "FireStore"];
const skills = ["Browser extension", "Chrome extension", "Safari extension"];
const requiredSkillMentionTemplate = PromptTemplate.fromTemplate(
  "Does this work experiences mention about any skills related to {skills}? Answer yes or no",
);

export const requiredSkillMentionPrompt =
  await requiredSkillMentionTemplate.format({
    skills: skills.join(", "),
  });

export const leadershipRoleMentionPrompt =
  "Does this work experiences mention about any leadership role such as CEO, CTO and co-founder? Answer yes or no";

export const leadershipSkillMentionPrompt =
  "Does this work experiences mention about any leadership skill such as management or leading a project? Answer yes or no";
