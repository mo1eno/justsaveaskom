import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.NEXT_PUBLIC_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/`;

export async function sendMessage(chatId: number, text: string) {
  const response = await fetch(`${API_URL}sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    throw new Error("Ошибка при отправке сообщения");
  }
}
