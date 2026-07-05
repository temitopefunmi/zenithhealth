import { AzureOpenAI } from "openai";

let client = null;

export function getAzureOpenAIClient() {
  if (client) {
    return client;
  }

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

if (!endpoint || !apiKey) {
  throw new Error(
    "Missing Azure OpenAI configuration."
  );
}

client = new AzureOpenAI({
  endpoint,
  apiKey,
  apiVersion: "2024-05-01-preview",
  deployment,
});

return client;
}