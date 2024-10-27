import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    console.log("Attempting to summarize:", description);

    if (!process.env.CLAUDE_API_KEY) {
      console.error("CLAUDE_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 30,
      messages: [
        {
          role: "user",
          content: `Summarize the following text in 5 words or less:\n\n${description}\n\nSummary:`,
        },
      ],
    });

    console.log("Claude API response:", response);

    const summary = response.content[0].text.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Unexpected error in summarize API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}