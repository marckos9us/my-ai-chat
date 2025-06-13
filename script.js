async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  const responseDiv = document.getElementById("response");
  responseDiv.innerText = "جارٍ المعالجة...";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  try {
    responseDiv.innerText = data.choices[0].message.content;
  } catch (e) {
    responseDiv.innerText = "حدث خطأ، تأكد من صيغة السؤال أو من الاتصال.";
  }
}
