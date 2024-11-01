import { NextRequest, NextResponse } from "next/server";

const WORDWARE_API_URL = "https://app.wordware.ai/api/released-app/3db7ccbe-a884-4894-9540-c17a2fb43509/run";
const NEXT_PUBLIC_WORDWARE_API_KEY = "ww-EsIQ14sOBkneVI3km8HZnQ8b72kz4A4fsVc5Gukbz5vmWleUwRNzOr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs, version } = body;

    if (!NEXT_PUBLIC_WORDWARE_API_KEY) {
      console.error("NEXT_PUBLIC_WORDWARE_API_KEY is not set");
      return NextResponse.json(
        { error: "API key is not set" },
        { status: 500 }
      );
    }

    const response = await fetch(WORDWARE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEXT_PUBLIC_WORDWARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: { question: inputs.question },
        version: version || "^3.4",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Wordware API error:", errorText);
      return NextResponse.json(
        {
          error: `Wordware API responded with status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    // Create a new ReadableStream to forward the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is null");
        }
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              controller.enqueue(line + "\n");
            }
          }

          buffer = lines[lines.length - 1];
        }

        if (buffer) {
          controller.enqueue(buffer);
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: `An error occurred: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "GET method is not supported for this endpoint" },
    { status: 405 }
  );
}
