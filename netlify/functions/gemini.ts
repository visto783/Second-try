export default async (request: Request) => {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Gemini function is working!"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
