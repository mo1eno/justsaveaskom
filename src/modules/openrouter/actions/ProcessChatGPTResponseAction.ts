/**
 * ProcessChatGPTResponseAction:
 * Обрабатывает ответ от ChatGPT, используя DTO ChatGPTResponseDto.
 * Извлекает расчетные данные из ответа и подготавливает их для дальнейшего использования.
 */
import { ChatGPTResponseDto } from "../dto/ChatGPTResponseDto";

export class ProcessChatGPTResponseAction {
  async execute(responseJson: any): Promise<ChatGPTResponseDto> {
    // Проверяем базовую структуру ответа
    if (!responseJson || typeof responseJson.success !== "boolean" || typeof responseJson.num_objects !== "number") {
      console.log("Некорректная структура ответа от GPT:", responseJson);
      throw new Error("Некорректный ответ от GPT");
    }

    // Если анализ не удался - возвращаем ошибку
    if (!responseJson.success) {
      const errorMessage = responseJson.message || "Недостаточно данных для анализа по указанным критериям";
      throw new Error(errorMessage);
    }

    // Проверяем наличие данных для успешного анализа
    if (typeof responseJson.avg_price_per_sqm !== "number" || responseJson.avg_price_per_sqm <= 0) {
      throw new Error("Не удалось рассчитать среднюю стоимость за кв.м");
    }

    return {
      averagePricePerSquareMeter: responseJson.avg_price_per_sqm,
      dealCount: responseJson.num_objects,
    };
  }
}
