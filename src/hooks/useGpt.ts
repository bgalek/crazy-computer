import {AzureKeyCredential, ChatRequestMessage, OpenAIClient} from "@azure/openai";
import scenarios from "../scenarios.ts";

// const key = window.localStorage.getItem("key") || "NO_AZURE_KEY";

const client = new OpenAIClient(
    "https://hackmerlin-openai.openai.azure.com/",
    new AzureKeyCredential(scenarios["api-key"])
);

export function askGpt(level: number, messages: ChatRequestMessage[] = []) {
    const currentScenario = scenarios.levels[level];
    const history: ChatRequestMessage[] = [{
        role: "system",
        content: currentScenario.prompt
    }, ...messages];
    return client.getChatCompletions("hackmerlin-gpt35", history);
}
