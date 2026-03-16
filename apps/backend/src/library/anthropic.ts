import Anthropic from "@anthropic-ai/sdk";

import { config } from "../config";

export function createAnthropicClient() {
  return new Anthropic({ apiKey: config.anthropic.apiKey });
}
