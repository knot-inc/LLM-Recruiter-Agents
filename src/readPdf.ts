import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { writeFile, writeFileSync } from "fs";

// const PINECONE_INDEX_NAME = "resume-parser";
// const PINECONE_NAME_SPACE = "resume-parser-test";

// const pinecone = new Pinecone({
//   apiKey: "6b43c6d6-110a-4b42-a2a6-03e99afea627",
//   environment: "gcp-starter",
// });

/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = "./src/test/pdfs/Ken Ore.pdf";

export const run = async () => {
  try {
    // Load the PDF.
    const loader = new PDFLoader(filePath, {
      splitPages: false,
    });

    /*load raw docs from the all files in the directory */
    // const directoryLoader = new DirectoryLoader(filePath, {
    //   ".pdf": (path) => new PDFLoader(path),
    // });
    const rawDocs = await loader.load();

    // const loader = new PDFLoader(filePath);
    // const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log("split docs", docs);

    console.log("creating vector store...");
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    // const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    const response = await chain.call({
      query: `
      Use the context: {context} to extract the following resume information:
      {
        "name": "",
        "email": "",
        "workExperience": [{
          "company": "",
          "position": "",
          "startDate": "",
          "endDate": "",
          "summary": ""
        }],
        "education": {
          "institution": "",
          "area": "",
          "studyType": ""
        },
        "technologies": [],
      }
    
      Your response must contain valid json only.
      `,
    });

    console.log(response);
    const parsedResponse = JSON.parse(response.text);
    console.log("parsedResponse: ", parsedResponse);
    writeFileSync("./out.json", JSON.stringify(parsedResponse, null, 2));

    //embed the PDF documents
    // await PineconeStore.fromDocuments(docs, embeddings, {
    //   pineconeIndex: index,
    //   namespace: PINECONE_NAME_SPACE,
    //   textKey: "text",
    // });
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }
};

(async () => {
  await run();
  console.log("ingestion complete");
})();
