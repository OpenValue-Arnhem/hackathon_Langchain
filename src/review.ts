import fs from "fs";
import path from "path";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "codellama", // Default value
});

const input = fs.readFileSync(path.join(__dirname, "../", "input.ts"), {
  encoding: "utf-8",
});

console.log(input);

model
  .pipe(new StringOutputParser())
  .stream(
    `Please review the following typescript code for any bugs: 
    <code>
${input}
</code>
`
  )
  .then(async (stream) => {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return chunks.join("");
  })
  .then((res) => {
    fs.writeFileSync(path.join(__dirname, "review.txt"), res, {
      encoding: "utf-8",
    });
  });
