import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * This is a Mastra Tool.
 * Its job is to perform a specific action: fetch a URL and return its text content.
 * The Agent will call this tool when it needs to get content from a webpage.
 */
export const fetchWebContentTool = createTool({
  // 'id' is the function name the agent will call.
  id: 'fetch-web-content',
  
  // 'description' tells the agent WHEN to use this tool.
  description: 'Fetches and extracts the main text content from a web page URL. Use this tool when a user provides a URL and asks for a summary.',
  
  // 'inputSchema' defines and validates the arguments for the tool.
  inputSchema: z.object({
    url: z.string().url().describe('The valid URL to scrape content from.'),
  }),

  // 'outputSchema' defines and validates the tool's return value.
  outputSchema: z.object({
    textContent: z.string().describe('The extracted text content of the webpage.'),
  }),

  // 'execute' is the actual logic that runs.
  execute: async ({ input }) => {
    try {
      const { url } = input;
      console.log(`[Tool] Fetching content from: ${url}`);
      
      // Use axios to get the HTML
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
      });
      
      // Use cheerio to parse the HTML and extract text
      const $ = cheerio.load(response.data);
      
      // Remove script/style tags, then get the text of the body
      $('script, style, nav, footer, aside').remove();
      const textContent = $('body').text()
        .replace(/\s\s+/g, ' ') // Replace multiple whitespace with single space
        .trim(); 
        
      if (!textContent) {
        throw new Error('Could not extract meaningful text from the page.');
      }
      
      console.log(`[Tool] Content extracted. Length: ${textContent.length} chars.`);
      
      // Return the text content, maxing out at 10,000 chars to be safe for the LLM
      return {
        textContent: textContent.substring(0, 10000),
      };
    } catch (error: any) {
      console.error(`[Tool] Error fetching URL: ${error.message}`);
      // Let the agent know the tool failed
      return { textContent: `Error: Could not fetch or process the URL. ${error.message}` };
    }
  },
});