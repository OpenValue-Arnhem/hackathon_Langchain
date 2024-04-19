import path from "path";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { EPubLoader } from "langchain/document_loaders/fs/epub";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { DallEAPIWrapper } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
});

const model = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
});

const embeddings = new OllamaEmbeddings({
  model: "llama2", // default value
  baseUrl: "http://localhost:11434", // default value
});

const loader = new EPubLoader(path.join(process.cwd(), "books", "lotr.epub"), {
  splitChapters: false,
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
        query: "What is the book about?",
      })
      .then((res) => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are a writer who wrote a book. The summarize of the book is: "${res.output_text}".`,
          ],
          [
            "human",
            `Create a prompt to generate a book cover. Only display the prompt.`,
          ],
        ]);

        prompt
          .pipe(model)
          .invoke({})
          .then((res) => {
            const tool = new DallEAPIWrapper({
              n: 1, // Default
              model: "dall-e-3", // Default
              apiKey: ``,
            });

            tool.invoke(res.content).then((res) => {
              console.log("res", res);
            });
          });
      });
  });
