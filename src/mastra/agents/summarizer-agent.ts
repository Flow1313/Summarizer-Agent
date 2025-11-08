import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { fetchWebContentTool } from '../tools/web-scrapper-agent';

/**
 * Summarizer Agent
 * - Summarizes plain text
 * - Summarizes webpage content using fetchWebContentTool
 */
export const summarizerAgent = new Agent({
  id: 'summarizer-agent', // API endpoint: /api/agents/summarizer-agent/ask
  name: 'Summarizer Agent',
  description: 'Summarizes long text or web content into concise summaries.',

  model: google('models/gemini-2.5-flash-preview-09-2025'),

  tools: {
    fetchWebContentTool,
  },

  systemPrompt: `
You are a summarizing assistant. Your job is to:
1. Condense long text into concise, accurate summaries.
2. Highlight key points and main ideas.
3. Summarize webpage content if a URL is provided, using fetchWebContentTool.
Respond clearly and in readable paragraphs or bullet points.
  `,

  handleInput: async (input, tools) => {
    const urlPattern = /https?:\/\/[^\s]+/;

    if (urlPattern.test(input)) {
      const content = await tools.fetchWebContentTool({ url: input });
      return `Summarize this content: ${content}`;
    }

    return `Summarize this text: ${input}`;
  },
});
