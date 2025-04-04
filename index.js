require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
  console.error("❌ ERRO: A variável SLACK_WEBHOOK_URL não está definida!");
  process.exit(1);
}

app.post("/github-webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log("📩 Webhook recebido:", { event, action: payload.action });

  if (event === "pull_request" && payload.action === "opened") {
    const prUrl = payload.pull_request.html_url;
    const targetBranch = payload.pull_request.base.ref;

    const message = {
      text: `<${prUrl}|${prUrl}> -> ${targetBranch}`,
    };

    try {
      await axios.post(SLACK_WEBHOOK_URL, message);
      console.log(`Mensagem enviada: ${message.text}`);
      res.sendStatus(200);
    } catch (err) {
      console.error(
        "❌ Erro ao enviar para o Slack:",
        err.response?.data || err.message
      );
      res.sendStatus(500);
    }
  } else {
    console.log("ℹ️ Evento ignorado:", event, payload.action);
    res.sendStatus(204);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
