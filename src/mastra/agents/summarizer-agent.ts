import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { fetchWebContentTool } from '../tools/web-scrapper-agent';

/**
 * This is the Mastra Agent.
 * It's the "brain" that uses the LLM (Gemini) and decides when to call tools.
 */
export const summarizerAgent = new Agent({
  id: "summarizer-agent", // ✅ explicitly set an ID for API route
  name: "Summarizer Agent",
  model: google("models/gemini-2.5-flash-preview-09-2025"),
  tools: { fetchWebContentTool },
});
  