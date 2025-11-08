import { Mastra } from '@mastra/core/mastra';
import { summarizerAgent } from './agents/summarizer-agent';

export const mastra = new Mastra({
  agents: [summarizerAgent],       // ✅ register agents as an array
  bundler: {
    externals: ['axios'],          // ✅ prevent build errors with axios
  },
  observability: {
    aiTracing: true,               // optional, replaces deprecated telemetry
  },
});