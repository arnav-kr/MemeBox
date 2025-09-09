import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }

  async generateUserKeyword(titles: string[]): Promise<string> {
    try {
      const prompt = `
Based on these meme titles that the user has upvoted: ${titles.join(", ")}

Generate a single, punchy keyword or short phrase (2-3 words max) that captures their meme personality.
This will be shown on a landing page like "Welcome [Name], [keyword]"

Examples:
- "Meme Connoisseur"
- "Chaos Creator" 
- "Comedy Curator"
- "Viral Enthusiast"
- "Humor Hunter"
- "Spicy Content Lover"

Make it feel personal and based on their meme preferences. Keep it under 20 characters.
Just return the keyword/phrase, no quotes or extra formatting.

If title isn't present return "Meme Explorer"
`;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text?.trim() ?? "Meme Explorer";

    } catch (error) {
      console.error("Gemini landing keyword generation error:", error);
      return "Meme Explorer";
    }
  }
}

export const geminiService = new GeminiService();
