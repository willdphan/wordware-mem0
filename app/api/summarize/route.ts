import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    console.log("Attempting to summarize:", description);

    if (!process.env.NEXT_PUBLIC_CLAUDE_API_KEY) {
      console.error("NEXT_PUBLIC_CLAUDE_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 30,
      messages: [
        {
          role: "user",
          content: `Summarize the following text in 5 words or less. You must analyze the context of the text and provide what action you took (as the llm agent) YOU MUST NOT PROVIDE ANY OTHER TEXT OR USE ANY OTHER BACKGROUND INFORMATION. The information is about crypto coins and markets. We are using the coin gecko api. USE BELOW:
          
          \n\n${description}\n\n:`,
        },
      ],
    });

    console.log("Claude API response:", response);

    // Fix: Access the content correctly based on Claude 3's response structure
    if (!response.content[0] || !("text" in response.content[0])) {
      throw new Error("Unexpected response format from Claude API");
    }

    const summary = response.content[0].text;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Unexpected error in summarize API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
