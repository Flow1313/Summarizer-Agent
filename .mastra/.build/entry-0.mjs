import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

const fetchWebContentTool = createTool({
  // 'id' is the function name the agent will call.
  id: "fetch-web-content",
  // 'description' tells the agent WHEN to use this tool.
  description: "Fetches and extracts the main text content from a web page URL. Use this tool when a user provides a URL and asks for a summary.",
  // 'inputSchema' defines and validates the arguments for the tool.
  inputSchema: z.object({
    url: z.string().url().describe("The valid URL to scrape content from.")
  }),
  // 'outputSchema' defines and validates the tool's return value.
  outputSchema: z.object({
    textContent: z.string().describe("The extracted text content of the webpage.")
  }),
  // 'execute' is the actual logic that runs.
  execute: async ({ input }) => {
    try {
      const { url } = input;
      console.log(`[Tool] Fetching content from: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
      });
      const $ = cheerio.load(response.data);
      $("script, style, nav, footer, aside").remove();
      const textContent = $("body").text().replace(/\s\s+/g, " ").trim();
      if (!textContent) {
        throw new Error("Could not extract meaningful text from the page.");
      }
      console.log(`[Tool] Content extracted. Length: ${textContent.length} chars.`);
      return {
        textContent: textContent.substring(0, 1e4)
      };
    } catch (error) {
      console.error(`[Tool] Error fetching URL: ${error.message}`);
      return { textContent: `Error: Could not fetch or process the URL. ${error.message}` };
    }
  }
});

const summarizerAgent = new Agent({
  id: "summarizer-agent",
  // API endpoint: /api/agents/summarizer-agent/ask
  name: "Summarizer Agent",
  description: "Summarizes long text or web content into concise summaries.",
  model: google("models/gemini-2.5-flash-preview-09-2025"),
  tools: {
    fetchWebContentTool
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
  }
});

const mastra = new Mastra({
  agents: {
    // The key 'summarizerAgent' MUST match the agent's 'name'
    // and the name used in the Telex Workflow URL.
    summarizerAgent
  }
});

export { mastra };
