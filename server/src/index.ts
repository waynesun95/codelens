import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { getReviewPrompt } from "../prompts/review";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Standard review endpoint (non-streaming)
app.post("/api/review", async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff || typeof diff !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'diff' field" });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: getReviewPrompt(diff),
        },
      ],
    });

    // Extract the text content from the response
    const textBlock = message.content.find((block) => block.type === "text");
    const reviewText = textBlock ? textBlock.text : "";

    // Parse the JSON from Claude's response
    try {
      const review = JSON.parse(reviewText);
      res.json(review);
    } catch {
      // If Claude didn't return valid JSON, return the raw text
      res.json({ raw: reviewText, issues: [], summary: "Failed to parse structured review." });
    }
  } catch (error: any) {
    console.error("Review error:", error.message);
    res.status(500).json({ error: "Failed to generate review" });
  }
});

// Streaming review endpoint
app.post("/api/review/stream", async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff || typeof diff !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'diff' field" });
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: getReviewPrompt(diff),
        },
      ],
    });

    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`);
    });

    stream.on("end", () => {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      res.write(`data: ${JSON.stringify({ type: "error", content: "Stream failed" })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on("close", () => {
      stream.abort();
    });
  } catch (error: any) {
    console.error("Stream error:", error.message);
    res.status(500).json({ error: "Failed to start review stream" });
  }
});

app.listen(PORT, () => {
  console.log(`CodeLens server running on http://localhost:${PORT}`);
});
