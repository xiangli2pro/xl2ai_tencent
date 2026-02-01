import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const TENCENT_FINANCIAL_CONTEXT = `You are a financial analyst assistant specializing in Tencent Holdings Limited. You have comprehensive knowledge of Tencent's financial performance from 2014-2024.

Key financial data points you know (all in RMB Billions):
- Revenue grew from 78.93B (2014) to 660.26B (2024)
- Gross Profit grew from 47.56B (2014) to 345.89B (2024)
- Operating Profit grew from 23.45B (2014) to 198.76B (2024)
- Net Profit grew from 23.81B (2014) to 176.43B (2024)

Revenue Segments (2024):
- VAS (Value-Added Services): 302.56B (games, social networks, music)
- Marketing Services (Online Advertising): 115.32B
- FinTech & Business Services: 212.45B
- Others: 29.93B

Key Margins (2024):
- Gross Margin: ~52%
- Operating Margin: ~30%
- Net Margin: ~27%

Growth Drivers:
- Gaming: WeChat Mini Games, domestic and international titles
- Cloud & Enterprise: Tencent Cloud, enterprise SaaS
- FinTech: WeChat Pay, wealth management
- Advertising: Video accounts, search ads

Answer user questions about Tencent's financial performance, trends, segment analysis, margins, and business outlook based on the annual report data. Be concise but insightful.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Financial chatbot API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: TENCENT_FINANCIAL_CONTEXT },
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages,
        max_completion_tokens: 1024,
      });

      const reply = response.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
      
      res.json({ reply });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  return httpServer;
}
