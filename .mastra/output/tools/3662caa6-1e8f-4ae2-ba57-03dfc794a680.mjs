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

export { fetchWebContentTool };
