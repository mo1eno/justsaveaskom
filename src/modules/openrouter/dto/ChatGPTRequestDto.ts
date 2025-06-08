/**
 * ChatGPTRequestDto:
 * DTO для запроса к ChatGPT.
 */
export interface ChatGPTRequestDto {
  originalText: string; // Исходный текст запроса от пользователя
  crmDump: string; // JSON-строка, представляющая дамп данных из CRM
}
