export interface TelegramResponseDto {
  chatId: number;
  text: string;
  parse_mode?: string;
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      callback_data: string;
    }>>;
  };
}
