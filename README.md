# LLM HR Agents

- Implemenations of LLM Agents for evaluating and screening applicants using RAG, CoT and other techniques

# For Screening

## Review work experience

- Review work experience such as Leadership experience and other required skills in the job description

```
pnpm ts-node --esm src/requirements_review/index.ts
```

## Predict industry from company name

- Using [ReAct](https://react-lm.github.io/) and SerpAPI for prediction

```
pnpm ts-node --esm src/predict_industry.ts Tesla
{ output: 'an automotive and energy company.' }

pnpm ts-node --esm src/predict_industry.ts "PG&E"
{ output: 'Utility company' }

pnpm ts-node --esm src/predict_industry.ts Noxx https://noxx.xyz
{ output: 'a payment and resume creation service.' }

```

## Measure skills from resume

- Count the number of times a skill is mentioned in a resume

```
pnpm ts-node --esm src/review_skills/index.ts
```

- Measure skills based on [Proficiency levels](https://hr.uiowa.edu/careers/competencies/proficiency-levels)

```
# Knowledge proficiency level
Expert: Design and optimize architectures of multiple projects using this knowledge. Lead multiple teams. Mentored people.
Advanced: Have used in multiple projects. Collaborate with members. Maintained a project.
Intermediate: Have used in or completed a production level project. Used in a part of a project.
Novice: Understands the concept.
```

```
pnpm ts-node --esm src/measure_skills/index.ts
```

## Review coverletter

Review coverletter and give matching scores to the job description

- Add jd.json under `src/test/`
- add `cover_letter_xx.txt` under `src/test/` and run:

```
NODE_NO_WARNINGS=1 pnpm ts-node --esm src/cover_letter_review.ts
```

# Utilities

## Parse resume and extract skills and work experiences

- Parse resume using Sovren
- Place resumes under `resume/{company_name}/`
- Run:

```
pnpm ts-node --esm src/resume_parser/index.ts
```

## Update Airtable Script

- Update Airtable record
- Set `AIRTABLE_API_KEY`, `RECUITMENT_POC_BASE_ID` and `JOB_APPLICANTS_TABLE_ID` (table name you would want to update) in .env
- Run the script

```
// pnpm ts-node --esm src/insert_{functions}.ts
pnpm ts-node --esm src/insert_requirements.ts
```
