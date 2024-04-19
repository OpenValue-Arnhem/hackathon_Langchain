import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

import { Ollama } from "@langchain/community/llms/ollama";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";

const loader = new CheerioWebBaseLoader("https://www.nu.nl/", {
  selector: ".page-wrapper section.columns",
});

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
  format: "json",
});

const embeddings = new OllamaEmbeddings({
  model: "llama2", // default value
  baseUrl: "http://localhost:11434", // default value
});

loader
  .load()
  .then((docs) => {
    return MemoryVectorStore.fromDocuments(docs, embeddings);
  })
  .then((store) => {
    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQARefineChain(ollama),
      retriever: store.asRetriever(),
    });

    chain
      .invoke({
        query: "Please list the items.",
      })
      .then((res) => {
        console.log("res", res);
      });
  });
