import OpenAI from "openai";

const openai = new OpenAI();

const jsonHeaders = {
  "Content-Type": "application/json",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const value = message as Record<string, unknown>;
      return (
        (value.role === "user" || value.role === "assistant") &&
        typeof value.content === "string" &&
        value.content.trim().length > 0
      );
    })
    .slice(-8);
}

export default async (request: Request) => {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: jsonHeaders,
      });
    }

    const body = await request.json();
    const messages = normalizeMessages(body.messages);

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return new Response(JSON.stringify({ error: "Ask a journal question first." }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.2",
      input: [
        {
          role: "system",
          content:
            "You are a direct trading journal coach. Use only the supplied journal analytics and trades. Give practical, risk-aware guidance. Do not promise profits or financial certainty.",
        },
        {
          role: "user",
          content: `Journal context:\n${JSON.stringify(
            {
              analytics: body.analytics,
              recentTrades: Array.isArray(body.trades) ? body.trades.slice(-30) : [],
            },
            null,
            2
          )}`,
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: response.output_text,
      }),
      {
        headers: jsonHeaders,
      }
    );
  } catch (error) {
    console.error("Journal chat failed", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to answer from your journal right now.",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
};
