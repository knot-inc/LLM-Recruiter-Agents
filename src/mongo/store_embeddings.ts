import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import dotenv from "dotenv";
import data from "./data/page-1-compressed.json" assert { type: "json" };
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    /* Embed queries */
    const dataWithEmbeddings = await Promise.all(
      data.map(async (d) => ({
        ...d,
        description_embedding: await embeddings.embedQuery(d.description),
      })),
    );

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    const res = await client
      .db("test")
      .collection("test_jobs")
      .insertMany(dataWithEmbeddings as any);

    console.log("res: ", res);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
