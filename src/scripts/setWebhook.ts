import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.NEXT_PUBLIC_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

interface WebhookResult {
  ok: boolean;
  description?: string;
}

export default async function setWebhook() {
  if (!BOT_TOKEN || !WEBHOOK_URL) {
    console.warn("❌ BOT_TOKEN или WEBHOOK_URL не заданы");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: WEBHOOK_URL }),
    });

    const result: unknown = await response.json();

    if (
      typeof result !== "object" ||
      result === null ||
      !("ok" in result) ||
      typeof (result as any).ok !== "boolean"
    ) {
      throw new Error("Ответ от Telegram не соответствует ожидаемому формату.");
    }

    const webhookResult: WebhookResult = result as WebhookResult;

    if (!webhookResult.ok) {
      console.error("❌ Ошибка при установке вебхука:", webhookResult.description);
      throw new Error(`❌ Ошибка установки вебхука: ${webhookResult.description}`);
    }

    console.log("✅ Вебхук успешно установлен:", webhookResult);
  } catch (error: any) {
    console.error("❌ Ошибка при установке вебхука:", error.message);
    throw new Error(`Ошибка при установке вебхука: ${error.message}`);
  }
}
