import Bytez from "bytez.js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Bytez API Key not configured" }, { status: 500 });
    }

    const { messages, aqi } = await req.json();
    const sdk = new Bytez(apiKey);
    const model = sdk.model("Qwen/Qwen3-0.6B");

    const systemPrompt = `You are an eco-friendly AI assistant for Pokhara, Nepal.
IMPORTANT: You MUST follow this structure for every response:
1. Start with your reasoning process wrapped in <think> tags.
2. Then provide your final conversational answer to the user.
3. If relevant, end with an image prompt wrapped in <image_prompt> tags.

Example:
<think>
The user is asking about AQI in Pokhara. I should explain the current level and give tips.
</think>
Namaste! The air quality today is...

Be conversational, warm, and use local context.`;
    
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || m.content
      }))
    ];

    // Add AQI context to the last message
    if (formattedMessages.length > 0) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      lastMsg.content = `Current Pokhara AQI: ${aqi}. ${lastMsg.content}`;
    }

    const { error, output } = await model.run(formattedMessages);

    if (error) {
      console.error("Bytez API Error:", error);
      throw new Error(error.message || "Failed to run model");
    }

    // Since bytez.js model.run returns a full response, we simulate streaming for the frontend typing effect
    const responseText = typeof output === 'string' ? output : (output?.content || JSON.stringify(output));
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        // Break the text into small chunks to simulate streaming
        const chunkSize = 20;
        for (let i = 0; i < responseText.length; i += chunkSize) {
          const chunk = responseText.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(chunk));
          // Small delay to make it look like it's thinking/typing
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
