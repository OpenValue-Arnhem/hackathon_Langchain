import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
  format: "json",
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
  ],
  ["human", `Translate "{input}" into {language}.`],
]);

const chain = prompt.pipe(model);

const language = "banana";

chain
  .invoke({
    input: "I love programming",
    language: language,
  })
  .then((res) => {
    const content: { original: string; translated: string } = JSON.parse(
      res.content as string
    );

    console.log(`Translated "${content.original}" to "${content.translated}"`);
  });
