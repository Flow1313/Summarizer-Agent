import { Mastra } from '@mastra/core/mastra';
import { summarizerAgent } from './agents/summarizer-agent';

/**
 * This is the main entry point for the Mastra framework.
 * It registers all your agents, workflows, and tools.
 */
export const mastra = new Mastra({
  agents: {
    // The key 'summarizerAgent' MUST match the agent's 'name'
    // and the name used in the Telex Workflow URL.
    summarizerAgent,
  },
});