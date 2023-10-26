import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import dotenv from "dotenv";
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
    const query = "Software Engineer in Europe";

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    const res = await client
      .db("test")
      .collection("test_jobs")
      .aggregate([
        {
          $vectorSearch: {
            queryVector: await embeddings.embedQuery(query),
            path: "description_embedding",
            numCandidates: 100,
            limit: 10,
            index: "PlotSemanticSearch3",
          },
        },
      ])
      .toArray();

    console.log("query: ", query);
    console.log("number of results: ", res.length);

    res.forEach((r) => {
      console.log(`${r.company.name} is hiring for a ${r.title}.`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
