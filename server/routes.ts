import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const TENCENT_FINANCIAL_CONTEXT = `You are a financial analyst assistant specializing in Tencent Holdings Limited. You have comprehensive knowledge of Tencent's financial performance from 2014-2024.

Key financial data points you know (all in RMB Billions, 1 decimal precision):

REVENUE & PROFITABILITY:
- Revenue: 78.9B (2014) → 660.3B (2024)
- Gross Profit: 47.6B (2014) → 349.2B (2024)
- Operating Profit: 30.5B (2014) → 208.1B (2024)
- Profit for Year: 23.8B (2014) → 196.5B (2024)
- Non-IFRS Operating Profit: 28.6B (2014) → 237.8B (2024)

REVENUE SEGMENTS (2024):
- VAS Total: 319.2B
  - Domestic Games Revenue: 140.2B
  - International Games Revenue: 57.2B
  - Social Networks Revenue: 121.8B
- Marketing Services: 121.4B
- FinTech & Business Services: 212.0B
- Others: 7.8B

VAS SUB-SEGMENT BREAKDOWN BY YEAR:
- 2024: Domestic Games 140.2B, International Games 57.2B, Social Networks 121.8B
- 2023: Domestic Games 127.0B, International Games 53.2B, Social Networks 118.2B
- 2022: Domestic Games 123.9B, International Games 46.8B, Social Networks 116.8B
- 2021: Domestic Games 129.0B, International Games 45.4B, Social Networks 117.2B
- 2020: Domestic Games 125.0B, International Games 38.0B, Social Networks 101.2B
- 2019: Domestic Games 102.2B, International Games 17.3B, Social Networks 80.0B
- 2018: Domestic Games 88.4B, International Games 15.6B, Social Networks 72.6B
- 2017: Domestic Games 84.6B, International Games 13.4B, Social Networks 55.4B
- 2016: Domestic Games 63.4B, International Games 7.4B, Social Networks 37.0B
- 2015: Domestic Games 52.8B, International Games 6.6B, Social Networks 21.2B
- 2014: Domestic Games 38.4B, International Games 6.2B, Social Networks 17.8B

OTHER FINANCIAL INFORMATION BY YEAR:
- 2024: EBITDA 230.1B, Adjusted EBITDA 259.9B, Operating Cash Flow 258.5B, Capital Expenditure 76.8B, Free Cash Flow 155.3B
- 2023: EBITDA 184.0B, Adjusted EBITDA 212.9B, Operating Cash Flow 222.0B, Capital Expenditure 23.9B, Free Cash Flow 167.0B
- 2022: EBITDA 134.3B, Adjusted EBITDA 176.6B, Operating Cash Flow 146.1B, Capital Expenditure 22.7B, Free Cash Flow 123.4B
- 2021: EBITDA 147.0B, Adjusted EBITDA 181.4B, Operating Cash Flow 175.2B, Capital Expenditure 29.3B, Free Cash Flow 145.9B
- 2020: EBITDA 144.7B, Adjusted EBITDA 154.2B, Operating Cash Flow 194.1B, Capital Expenditure 34.1B, Free Cash Flow 160.0B

DEFERRED REVENUE (RMB Billions):
- 2024: 100.1B, 2023: 86.2B, 2022: 82.2B, 2021: 87.8B, 2020: 82.8B

OPERATING INFORMATION (User Metrics):
- Weixin/WeChat Combined MAU (millions): 2024: 1385, 2023: 1343, 2022: 1309, 2021: 1268, 2020: 1225, 2019: 1165, 2018: 1098, 2017: 989, 2016: 846, 2015: 697, 2014: 500
- QQ Mobile Device MAU (millions): 2024: 524, 2023: 554, 2022: 569, 2021: 552, 2020: 648, 2019: 694, 2018: 700, 2017: 783, 2016: 652, 2015: 641, 2014: 576
- Fee-based VAS Subscriptions (millions): 2024: 265, 2023: 248, 2022: 236, 2021: 236, 2020: 209, 2019: 185, 2018: 170, 2017: 149, 2016: 133, 2015: 115, 2014: 98
- Employee Count: 2024: 110,558, 2023: 105,417, 2022: 108,436, 2021: 112,771, 2020: 85,858, 2019: 62,885, 2018: 54,309, 2017: 44,796, 2016: 38,775, 2015: 30,641, 2014: 27,690

Key Margins (2024):
- Gross Margin: ~52.9%
- Operating Margin: ~31.5%
- Net Margin: ~29.8%

Growth Drivers:
- Gaming: Honor of Kings, PUBG Mobile, Brawl Stars, Dungeon & Fighter: Origins
- Cloud & Enterprise: Tencent Cloud, enterprise SaaS
- FinTech: WeChat Pay, wealth management
- Advertising: Video accounts, search ads
- AI: Massive CapEx increase in 2024 (+221%) for AI infrastructure

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

  // Feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Store feedback in database
      await storage.createFeedback({
        name: name || "Anonymous",
        email: email || "",
        message: message.trim(),
      });

      // TODO: Send email notification via SendGrid when configured
      console.log("Feedback received:", { name, email, message: message.substring(0, 50) + "..." });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  return httpServer;
}
