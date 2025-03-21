import { XaiClient } from '@xai/sdk';

const xaiClient = new XaiClient({
  apiKey: process.env.XAI_API_KEY
});

export default xaiClient;