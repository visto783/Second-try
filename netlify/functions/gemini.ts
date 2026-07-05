import { GoogleGenAI } from "@google/genai";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export default async (request: Request) => {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: jsonHeaders,
        }
      );
    }

    const body = await request.json();

    const ai = new GoogleGenAI({});

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
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: response.text,
      }),
      {
        headers: jsonHeaders,
      }
    );
  } catch (e: any) {
    console.error("Gemini analysis failed", e);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to generate AI analysis.",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
};
