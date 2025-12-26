import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages, aqi } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: "You are an eco-friendly AI assistant for Pokhara, Nepal. Give detailed, actionable advice with local context. Use emojis occasionally. Be conversational and warm. Before your final answer, provide your reasoning process inside <thinking> tags. If the user asks for an eco-illustration or to 'show' something, provide a detailed image prompt at the end of your response inside <image_prompt> tags."
    });

    const chat = model.startChat({
      history: messages.slice(-5).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    });

    const lastMessage = messages[messages.length - 1].text;
    const prompt = `Current Pokhara AQI: ${aqi}. User query: ${lastMessage}`;

    const result = await chat.sendMessageStream(prompt);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(encoder.encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
