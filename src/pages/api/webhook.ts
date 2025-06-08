import { NextApiRequest, NextApiResponse } from "next";
import { ProcessTelegramMessageAction } from "../../modules/telegram/actions/ProcessTelegramMessageAction";
import { ProcessCallbackAction } from "../../modules/telegram/actions/ProcessCallbackAction";

const processTelegramAction = new ProcessTelegramMessageAction();
const processCallbackAction = new ProcessCallbackAction();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log('🟢 Пришёл запрос от Telegram:');
  console.dir(req.body, { depth: null });

  // Обработка callback'ов от inline кнопок
  if (req.body?.callback_query) {
    try {
      await processCallbackAction.execute(req.body.callback_query);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("❌ Ошибка обработки callback:", error.message || error);
      return res.status(500).json({
        error: "Ошибка обработки callback",
        details: error.message || error,
      });
    }
  }

  // Обработка текстовых сообщений
  const message = req.body?.message;

  if (!message || typeof message.text !== "string" || !message.from || !message.chat) {
    console.warn("Неверный формат сообщения:", req.body);
    return res.status(200).json({ success: true });
  }

  if (message.text === '/start') {
    return res.status(200).json({ success: true });
  }

  try {
    await processTelegramAction.execute(message);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ Ошибка обработки сообщения:", error.message || error);
    return res.status(500).json({
      error: "Ошибка обработки сообщения",
      details: error.message || error,
    });
  }
}
