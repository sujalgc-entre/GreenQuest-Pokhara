
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey?.substring(0, 10) + "...");
  
  if (!apiKey) {
    console.error("No API key found in environment");
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.error) {
      console.error("API Error:", data.error);
    } else {
      console.log("Available Models:", data.models?.map((m: any) => m.name).join(", "));
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModels();
