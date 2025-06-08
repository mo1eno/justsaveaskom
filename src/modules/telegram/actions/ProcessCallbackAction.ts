/**
 * ProcessCallbackAction:
 * Обрабатывает callback'и от inline кнопок в Telegram
 */
import { GenerateReportImageAction } from "./GenerateReportImageAction";
import { SendTelegramResponseAction } from "./SendTelegramResponseAction";
import { reportDataCache } from "../utils/ReportDataCache";

export class ProcessCallbackAction {
  async execute(callbackQuery: any): Promise<void> {
    try {
      // Парсим данные из callback_data формата "report_id"
      if (callbackQuery.data.startsWith("report_")) {
        const reportId = callbackQuery.data.replace("report_", "");
        
        // Получаем данные из кеша
        const reportData = reportDataCache.get(reportId);
        
        if (!reportData) {
          const sendTelegramAction = new SendTelegramResponseAction();
          await sendTelegramAction.execute({
            chatId: callbackQuery.message.chat.id,
            text: "⚠️ Данные для генерации презентации устарели. Пожалуйста, сделайте новый запрос."
          });
          return;
        }
        
        // Уведомляем пользователя о начале генерации
        const sendTelegramAction = new SendTelegramResponseAction();
        await sendTelegramAction.execute({
          chatId: callbackQuery.message.chat.id,
          text: "🔄 Генерируем презентацию..."
        });

        // Генерируем изображение с отчетом
        const generateImageAction = new GenerateReportImageAction();
        const imageBuffer = await generateImageAction.execute({
          price: reportData.price,
          count: reportData.count,
          criteria: reportData.criteria
        });

        // Отправляем презентацию как SVG файл
        await sendTelegramAction.executePhoto({
          chatId: callbackQuery.message.chat.id,
          photo: imageBuffer,
          caption: "📊 Презентация анализа недвижимости"
        });
      }
    } catch (error) {
      console.error("Ошибка при обработке callback:", error);
      
      const sendTelegramAction = new SendTelegramResponseAction();
      await sendTelegramAction.execute({
        chatId: callbackQuery.message.chat.id,
        text: "⚠️ Ошибка при генерации презентации. Попробуйте позже."
      });
    }
  }
}