import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rawData from "./data/page-1-raw.json" assert { type: "json" };
import cache from "./data/coresignal-cache.json" assert { type: "json" };
import { convert } from "html-to-text";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const dir = path.dirname(__filename);

const CORESIGNAL_API_KEY =
  "eyJhbGciOiJFZERTQSIsImtpZCI6ImM5MDllOTVhLWVlM2MtOTNjZC00ZDMzLTVjNTM2YTVkM2Y1MSJ9.eyJhdWQiOiJub3h4IiwiZXhwIjoxNzI4MDIxOTM5LCJpYXQiOjE2OTY0NjQ5ODcsImlzcyI6Imh0dHBzOi8vb3BzLmNvcmVzaWduYWwuY29tOjgzMDAvdjEvaWRlbnRpdHkvb2lkYyIsIm5hbWVzcGFjZSI6InJvb3QiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJub3h4Iiwic3ViIjoiZmEwYzRjOWMtYzIxYy1mZmRmLWMwYjktNDhhZWQ1YWY5YzE2IiwidXNlcmluZm8iOnsic2NvcGVzIjoiY2RhcGkifX0.bs6h-v9xhod_NvMEi01vY1MhcuYLDXxUrgZQVpncExTTqqlj85D6ZFCtfYSJTQ8lW6FsSlFuoPstNWKeViCUDw";

const CORESIGNAL_BASE_URL =
  "https://api.coresignal.com/cdapi/v1/linkedin/company";

const searchEndpoint = `${CORESIGNAL_BASE_URL}/search/filter`;

const collectEndpoint = `${CORESIGNAL_BASE_URL}/collect`;

type GetCompanyInfoFromCoreSignalParams = {
  website_url: string;
  name: string;
};
const getCompanyInfoFromCoreSignal = async ({
  website_url,
  name,
}: GetCompanyInfoFromCoreSignalParams) => {
  const cachedResult = cache[website_url];
  if (cachedResult) {
    return cachedResult;
  }

  const searchRes = await fetch(searchEndpoint, {
    headers: {
      Authorization: `Bearer ${CORESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ exact_website: website_url }),
  }).then((r) => r.json());
  console.log("searchRes: ", searchRes);

  const [id] = searchRes;

  const collectRes = await fetch(`${collectEndpoint}/${id}`, {
    headers: {
      Authorization: `Bearer ${CORESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "GET",
  }).then((r) => r.json());
  console.log("collectRes: ", collectRes);

  cache[website_url] = collectRes;

  return collectRes;
};

const newData = await Promise.all(
  rawData.map(async (d) => {
    const extraCompanyInfo = await getCompanyInfoFromCoreSignal(d.company);

    const enrichedInfo = {
      size: extraCompanyInfo.size,
      industry: extraCompanyInfo.industry,
      type: extraCompanyInfo.type,
      headquarters_new_address: extraCompanyInfo.headquarters_new_address,
      employees_count: extraCompanyInfo.employees_count,
    };

    return {
      _id: d._id,
      title: d.title,
      location: d.location,
      company: { ...d.company, ...enrichedInfo },
      description: convert(d.description),
    };
  }),
);

writeFileSync(
  `${dir}/data/coresignal-cache.json`,
  JSON.stringify(cache, null, 2),
);

writeFileSync(
  `${dir}/data/page-1-compressed.json`,
  JSON.stringify(newData, null, 2),
);
