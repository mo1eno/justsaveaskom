
/**
 * ProcessTelegramMessageAction:
 * Этот класс отвечает за обработку входящих сообщений Telegram.
 * Он принимает данные из Telegram, проверяет доступ пользователя (whitelist),
 * а возвращает DTO TelegramMessageDto для дальнейшей обработки
 */
import { TelegramMessageDto } from "../dto/telegram-message.dto";
import { SendTelegramResponseAction } from "./SendTelegramResponseAction";
import { CreateChatGPTRequestAction } from "../../openrouter/actions/CreateChatGPTRequestAction";
import { ProcessChatGPTResponseAction } from "../../openrouter/actions/ProcessChatGPTResponseAction";
import { reportDataCache } from "../utils/ReportDataCache";
export class ProcessTelegramMessageAction {
  private whitelist = new Set([7661449859]);

  // Экранирование специальных символов для MarkdownV2
  private escapeMarkdownV2(text: string): string {
    return text.replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
  }

  async execute(message: any): Promise<TelegramMessageDto> {
    // if (!this.whitelist.has(message.from.id)) {
    //   throw new Error("не находится в whitelist");
    // }

    /**
     * @todo
     * 1. Изучаем документацию Telegram API — узнаём, какие данные мы получаем при получении сообщения.
     * 2. Проверяем, есть ли пользователь в whitelist (черный список).
     * 3. Если пользователь не в whitelist, возвращаем ошибку или сообщение о запрете. (throw)
     * 4. Если пользователь в whitelist, преобразуем входящее сообщение в формат TelegramMessageDto.
     */


    // Пока нет реализации — возвращаем заглушку
    const telegramMessageDto: TelegramMessageDto = {
      messageId: message.message_id,
      chatId: message.chat.id,
      from: {
        id: message.from.id,
        firstName: message.from.first_name,
        lastName: message.from.last_name,
        username: message.from.username,
      },
      text: message.text,
      date: new Date(message.date * 1000),
    };


    // Запрос к GPT
    const chatGptRequest = {
      originalText: telegramMessageDto.text,
      crmDump: JSON.stringify(this.getCrmDump()),
    };

    try {
      const createChatGPTRequestAction = new CreateChatGPTRequestAction();
      const chatGptResponse = await createChatGPTRequestAction.execute(chatGptRequest);

      // Обработка ответа
      const processChatGPTResponseAction = new ProcessChatGPTResponseAction();
      const processedResponse = await processChatGPTResponseAction.execute(chatGptResponse);

      // Ответ пользователю
      const priceFormatted = Math.round(processedResponse.averagePricePerSquareMeter).toLocaleString('ru-RU');
      const totalAreaText = processedResponse.dealCount === 1 ? '1 объект' :
                           processedResponse.dealCount < 5 ? `${processedResponse.dealCount} объекта` :
                           `${processedResponse.dealCount} объектов`;

      // Добавляем информацию из GPT ответа, если доступна
      let criteriaText = '';
      if (chatGptResponse.filtered_criteria) {
        const criteria = chatGptResponse.filtered_criteria;
        const parts = [];
        if (criteria.type) parts.push(`🏠 Тип: ${this.escapeMarkdownV2(criteria.type)}`);
        if (criteria.area_range && (criteria.area_range.min || criteria.area_range.max)) {
          const min = criteria.area_range.min ? `от ${criteria.area_range.min}` : '';
          const max = criteria.area_range.max ? `до ${criteria.area_range.max}` : '';
          parts.push(`📐 Площадь: ${this.escapeMarkdownV2(`${min} ${max} м²`.trim())}`);
        }
        if (criteria.city) parts.push(`🏙 Город: ${this.escapeMarkdownV2(criteria.city)}`);
        if (criteria.street) parts.push(`🛣 Улица: ${this.escapeMarkdownV2(criteria.street)}`);
        if (criteria.district) parts.push(`📍 Район: ${this.escapeMarkdownV2(criteria.district)}`);

        if (parts.length > 0) {
          criteriaText = `\n\n📋 Критерии поиска:\n${parts.join('\n')}`;
        }
      }

      // Дополнительная информация от GPT (только если есть содержательное сообщение)
      let additionalInfo = '';
      if (chatGptResponse.message && chatGptResponse.message.trim() && chatGptResponse.message.trim() !== '') {
        additionalInfo = `\n\n💬 ${this.escapeMarkdownV2(chatGptResponse.message)}`;
      }

      // Сохраняем данные для генерации отчета в кеш
      const reportId = reportDataCache.store({
        price: Math.round(processedResponse.averagePricePerSquareMeter),
        count: processedResponse.dealCount,
        criteria: chatGptResponse.filtered_criteria
      });

      const responseDto = {
        chatId: telegramMessageDto.chatId,
        text: `📊 *Результаты анализа недвижимости*

💰 *Средняя цена за м²:* ${priceFormatted} руб\\.
📈 *Проанализировано:* ${totalAreaText}${criteriaText}${additionalInfo}

ℹ️ _Данные основаны на актуальной информации из CRM_`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            {
              text: "📄 Скачать презентацию",
              callback_data: `report_${reportId}`
            }
          ]]
        }
      };

      // Ответ пользователю в ТГ
      const sendTelegramAction = new SendTelegramResponseAction();
      await sendTelegramAction.execute(responseDto);

    } catch (error) {
      console.error("⚠️ Ошибка при обработке запроса ChatGPT:", error);

      // Определяем тип ошибки для более точного ответа пользователю
      let errorMessage = "⚠️ Произошла ошибка при обработке запроса. Пожалуйста, попробуйте чуть позже 🙏";

      if (error instanceof Error) {
        // Если это ошибка недостатка данных - показываем специальное сообщение
        if (error.message.includes("Недостаточно данных") ||
            error.message.includes("не найден") ||
            error.message.includes("не удалось рассчитать") ||
            error.message.includes("нет данных в базе") ||
            error.message.includes("не указаны критерии") ||
            error.message.includes("Объекты не отобраны")) {
          errorMessage = `📊 ${error.message}\n\n💡 Попробуйте уточнить запрос или выбрать другое местоположение.`;
        }
      }

      const responseDto = {
        chatId: telegramMessageDto.chatId,
        text: errorMessage,
      };

      const sendTelegramAction = new SendTelegramResponseAction();
      await sendTelegramAction.execute(responseDto);
    }
    return telegramMessageDto;
  }

  // CRM
  private getCrmDump() {
    return [
      { price_per_sq_meter: 50000 },
      { price_per_sq_meter: 55000 },
      { price_per_sq_meter: 60000 },
    ];
  }
}
