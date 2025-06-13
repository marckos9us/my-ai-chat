export default async function handler(req, res) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { prompt } = req.body;

    try {
        const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "nous-hermes2-mistral-7b-dpo",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await apiRes.json();

        return res.status(200).json({
            ok: true,
            response: data.choices[0].message.content
        });
    } catch (error) {
        return res.status(500).json({ ok: false, error: "Internal Server Error" });
    }
}