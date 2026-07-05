import { GoogleGenAI } from "@google/genai";

export default async (request: Request) => {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is missing",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are an expert Trading Psychology Coach.

Analyze this trading data:

${JSON.stringify(body, null, 2)}

Give response in JSON format:

{
 "summary":"",
 "strengths":[...],
 "mistakes":[...],
 "actionItems":[...]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: response.text,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: e.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
