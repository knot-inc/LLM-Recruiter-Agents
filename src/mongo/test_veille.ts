import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cache from "./data/veile-cache.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);

const dir = path.dirname(__filename);

const BASE_URL = "https://companies-datas.p.rapidapi.com/v2/company";

type GetCompanyInfo = {
  website_url: string;
};
const getCompanyInfo = async ({ website_url }: GetCompanyInfo) => {
  // "https://www.facebook.com"
  // const domain = new URL(website_url).hostname;
  const url = `${BASE_URL}?query="${website_url}`;
  console.log("url: ", url);

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": "d635154c4fmsh9d19ec8c7bd8cf7p1d936ajsnfdeca3d87b13",
      "X-RapidAPI-Host": "companies-datas.p.rapidapi.com",
    },
    method: "GET",
  }).then((r) => r.json());
  console.log("res: ", res);

  cache[website_url] = res;

  return res;
};

const run = async () => {
  try {
    const res = await getCompanyInfo({
      website_url: "www.openai.com",
      // name: "Facebook",
    });

    writeFileSync(
      `${dir}/data/veile-cache.json`,
      JSON.stringify(cache, null, 2),
    );

    writeFileSync(`${dir}/data/veile-res.json`, JSON.stringify(res, null, 2));
  } catch (error) {
    console.log("error: ", error);
  }
};

run();
