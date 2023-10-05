# LLM experiments

## Predict industry from company name

- Using ReAct and SerpAPI for prediction

```
pnpm ts-node --esm src/predict_industry.ts Tesla
{ output: 'an automotive and energy company.' }

pnpm ts-node --esm src/predict_industry.ts "PG&E"
{ output: 'Utility company' }

pnpm ts-node --esm src/predict_industry.ts Noxx https://noxx.xyz
{ output: 'a payment and resume creation service.' }

```

## Update Airtable Script

```
pnpm ts-node --esm src/update_airtable.ts
```

## Review coverletter

Review coverletter and give matching scores to the job description

- Add jd.json under `src/test/`
- add `cover_letter_xx.txt` under `src/test/` and run:

```
NODE_NO_WARNINGS=1 pnpm ts-node --esm src/cover_letter_review.ts
```
