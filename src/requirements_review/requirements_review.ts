import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ParsedResume } from "../resume_parser/resumeType";
import {
  leadershipRoleMentionPrompt,
  leadershipSkillMentionPrompt,
  requiredSkillMentionPrompt,
} from "./requirements_prompts.js";

const chat = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4",
});

export const requirementReview = async (resume: ParsedResume) => {
  // workaround to escape curly braces
  const stringified = JSON.stringify(resume)
    .replace(/\{/g, "{{")
    .replace(/\}/g, "}}");
  // console.log("stringified", stringified);
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an HR expert. Your objective is to provide insight from candidate's work experience. Answer questions based on following json: ${stringified}`,
    ],
    ["human", "{input}"],
  ]);

  const chain = new LLMChain({
    llm: chat,
    prompt,
    //verbose: true,
  });
  const requiredSkillMention = await chain.invoke({
    input: requiredSkillMentionPrompt,
  });
  // console.log("requiredSkillMention", requiredSkillMention);

  const leadershipRoleMention = await chain.invoke({
    input: leadershipRoleMentionPrompt,
  });

  //  console.log("leadershipRoleMention", leadershipRoleMention);
  const leadershipSkillMention = await chain.invoke({
    input: leadershipSkillMentionPrompt,
  });
  // console.log("leadershipSkillMention", leadershipSkillMention);
  return {
    email: resume.email || "",
    requiredSkill: requiredSkillMention.text.toLowerCase() === "yes",
    leadershipRole: leadershipRoleMention.text.toLowerCase() === "yes",
    leadershipSkill: leadershipSkillMention.text.toLowerCase() === "yes",
  };
};
