import Groq from "groq-sdk";

export const getOrbitReply = async (chatContext: string) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return "Orbit config error.";

        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `
You are Orbit, an AI developer assistant inside a collaborative coding chat room.

Rules:
- Be concise and technical.
- If providing code, wrap it inside triple backticks.
- Provide step-by-step debugging guidance when helpful.
`
                },
                {
                    role: "user",
                    content: `Here is the recent conversation:\n${chatContext}`
                }
            ],
            max_tokens: 500
        });

        return completion.choices[0]?.message?.content || "Orbit has no response.";

    } catch (error: any) {
        if (error?.status === 429) {
            return "Orbit is busy right now, try again in a moment.";
        }
        console.error("Orbit AI Error:", error);
        return "Orbit is currently unavailable.";
    }
};