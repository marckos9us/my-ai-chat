const apiKey = "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";

async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  const responseDiv = document.getElementById("response");
  responseDiv.innerText = "جارٍ المعالجة...";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "intel/neural-chat-7b",  // النموذج الصحيح
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("HTTP " + res.status + ": " + err);
    }

    const data = await res.json();
    responseDiv.innerText = data.choices[0].message.content;

  } catch (e) {
    responseDiv.innerText = "❌ حدث خطأ:\n" + e.message;
  }
}
