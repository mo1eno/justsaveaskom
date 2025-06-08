/**
 * TelegramMessageDto:
 * DTO для входящего сообщения в Telegram.
 */
export interface TelegramMessageDto {
  messageId: number;
  chatId: number;
  from: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
  };
  text: string;
  date: Date;
}
