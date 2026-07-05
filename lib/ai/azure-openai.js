import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment =
  process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

if (!endpoint || !apiKey) {
  throw new Error(
    "Missing Azure OpenAI configuration."
  );
}

const client = new AzureOpenAI({
  endpoint,
  apiKey,
  apiVersion: "2024-05-01-preview",
  deployment,
});

export default client;