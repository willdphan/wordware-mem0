import { NextRequest, NextResponse } from "next/server";
// handles receiving the Wordware API response and forwards the raw stream to the client

const WORDWARE_API_URL =
  "https://api.wordware.ai/v1alpha/apps/wordware/feed4bf1-8f93-4118-a6f8-083f07ea30e9/runs/stream";
const NEXT_PUBLIC_WORDWARE_API_KEY =
  "ww-LJz6yoDVqeUzAJCuF5apTdQBnzdYqEMpztjjHfVhb5iGozVxajuNsT";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs } = body;

    const response = await fetch(WORDWARE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEXT_PUBLIC_WORDWARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: { question: inputs.question },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Wordware API responded with status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    // Transform the response into a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body is null");

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Forward the raw chunks directly to the client
            controller.enqueue(value);
          }
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.error(e);
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
