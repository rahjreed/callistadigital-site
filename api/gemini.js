export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { userQuery, systemPrompt } = req.body || {};
    if (!userQuery) return res.status(400).json({ error: "Missing userQuery" });

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" +
        `?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt || "" }] },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message });

    return res.status(200).json({
      text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
