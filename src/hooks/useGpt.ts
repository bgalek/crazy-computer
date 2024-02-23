import {AzureKeyCredential, ChatRequestMessage, OpenAIClient} from "@azure/openai";
import scenarios from "../scenarios.ts";

const client = new OpenAIClient(
    "https://hackmerlin-openai.openai.azure.com/",
    new AzureKeyCredential(scenarios["api-key"])
);

export function askGpt(level: number, messages: ChatRequestMessage[] = []) {
    const currentScenario = scenarios.levels[level];
    const history: ChatRequestMessage[] = [{
        role: "system",
        content: currentScenario.prompt
    }, ...messages.slice(-3)];
    try {
        return client.getChatCompletions("hackmerlin-gpt4", history, {
            temperature: currentScenario.temperature || 0.5,
            maxTokens: 150
        });
    } catch (e) {
        return Promise.resolve({
                choices: [{
                    message: {content: "NIE UDAŁO SIĘ DOSTARCZYĆ WIADOMOŚCI, SPRÓBUJ PONOWNIE"}
                }]
            }
        );
    }
}
