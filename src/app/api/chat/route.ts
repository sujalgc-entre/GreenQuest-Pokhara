import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        tip: "Keep Pokhara green! Try biking or walking today to reduce your carbon footprint." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { aqi } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Pokhara AQI is ${aqi}. Give one actionable eco-tip for today in 2 sentences. Be encouraging and specific to Pokhara's environment.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ tip: text });
    } catch (error: unknown) {
      console.error("Gemini API Error:", error instanceof Error ? error.message : error);
    // Fallback tip if API fails
    return NextResponse.json({ 
      tip: "Small actions lead to big changes. Consider reducing plastic waste today for a cleaner Pokhara." 
    });
  }
}
