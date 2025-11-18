/**
 * AI Models Configuration for OpenRouter
 */

export const AI_MODELS = {
  // Content generation - fast, cost-effective
  gemini_flash_lite: {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    contextWindow: 32000,
    maxOutput: 20000,
  },

  // Image generation
  gemini_image: {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
  },

  // Strategic thinking - FREE tier
  gemini_thinking: {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Flash Thinking (Free)',
    contextWindow: 32000,
  },
};
