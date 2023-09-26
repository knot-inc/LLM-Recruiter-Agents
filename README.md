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
