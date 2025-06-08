/**
 * SendTelegramResponseAction:
 * Этот класс формирует ответ для пользователя, используя DTO TelegramResponseDto,
 * и отправляет сообщение через Telegram.
 */
import { TelegramResponseDto } from "../dto/telegram-response.dto";
import fetch from "node-fetch";
import FormData from "form-data";


export class SendTelegramResponseAction {
  private botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;

  async execute(response: TelegramResponseDto | any): Promise<void> {
    if (!this.botToken) {
      throw new Error("нет Telegram bot token");
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const payload = {
      chat_id: response.chatId,
      text: response.text,
      ...(response.parse_mode && { parse_mode: response.parse_mode }),
      ...(response.reply_markup && { reply_markup: response.reply_markup })
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Telegram API error:", res.status, errorText);
      throw new Error("сообщение не может быть отправлено");
    }
  }

  async executePhoto(params: {
    chatId: number;
    photo: Buffer;
    caption?: string;
  }): Promise<void> {
    if (!this.botToken) {
      throw new Error("нет Telegram bot token");
    }

    try {
      // Отправляем как PNG фото
      const url = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
      const formData = new FormData();

      formData.append('chat_id', params.chatId.toString());
      formData.append('photo', params.photo, {
        filename: 'presentation.png',
        contentType: 'image/png'
      });
      if (params.caption) {
        formData.append('caption', params.caption);
      }


      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders()
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Telegram API error при отправке фото:", res.status, errorText);
        throw new Error("фото не может быть отправлено");
      }
    } catch (error) {
      console.error("Ошибка при отправке фото:", error);
      throw error;
    }
  }
}
