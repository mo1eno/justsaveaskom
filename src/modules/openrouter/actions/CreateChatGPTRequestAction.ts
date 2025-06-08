import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { ChatGPTRequestDto } from "../dto/ChatGPTRequestDto";

const openai = new OpenAI({
  baseURL: 'https://api.f5ai.ru/v1',
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  defaultHeaders: {
    'X-Auth-Token': process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  },
});

export class CreateChatGPTRequestAction {
  async execute(request: ChatGPTRequestDto): Promise<any> {
    try {
      // Чтение CRM-дампа из файла
      const crmDumpPath = path.join(process.cwd(), 'resources/crm_dump.json');
      const crmDumpRaw = fs.readFileSync(crmDumpPath, 'utf-8');
      const crmData = JSON.parse(crmDumpRaw);

      const completion = await openai.chat.completions.create({
        model: 'o4-mini',
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "real_estate_analysis",
            schema: {
              type: "object",
              properties: {
                "success": {
                  "type": "boolean",
                  "description": "Указывает, удалось ли найти подходящие объекты для анализа"
                },
                "avg_price_per_sqm": {
                  "type": ["number", "null"],
                  "description": "Средняя цена за квадратный метр в рублях"
                },
                "num_objects": {
                  "type": "integer",
                  "description": "Количество объектов, использованных в расчете"
                },
                "message": {
                  "type": "string",
                  "description": "Краткое сообщение с дополнительной информацией (БЕЗ повтора цифр цены или количества объектов)"
                },
                "filtered_criteria": {
                  "type": "object",
                  "properties": {
                    "type": {"type": ["string", "null"]},
                    "area_range": {
                      "type": "object",
                      "properties": {
                        "min": {"type": ["number", "null"]},
                        "max": {"type": ["number", "null"]}
                      }
                    },
                    "city": {"type": ["string", "null"]},
                    "street": {"type": ["string", "null"]},
                    "district": {"type": ["string", "null"]}
                  },
                  "description": "Извлеченные из запроса критерии поиска"
                }
              },
              "required": ["success", "num_objects", "message"],
              "additionalProperties": false
            }
          }
        },
        messages: [
          {
            role: 'system',
            content: `Ты — аналитик недвижимости. Твоя задача:

1. Проанализировать пользовательский запрос и извлечь критерии поиска:
   - Тип объекта (квартира, дом, комната, участок)
   - Диапазон площади (если указан)
   - Местоположение: город, район, улица

   ВАЖНО: Учитывай географические названия Приморского края:
   - Владивосток, Артём, Находка, Уссурийск
   - Поселки: Раздольное, Тавричанка, Смоляниново, Шмидтовка
   - Даже одно слово может быть названием города/поселка

2. Найти в предоставленных данных объекты, соответствующие критериям

3. Структура данных:
   - type: тип недвижимости
   - total_price: общая стоимость в рублях
   - area: площадь в кв.м (для квартир/домов/комнат)
   - site_area: площадь участка (для участков)
   - address.city: город
   - address.district: административный район
   - address.street: улица

4. Для расчета цены за кв.м:
   - Используй total_price / area
   - Для участков используй total_price / site_area
   - Исключи объекты с area = 0 или отсутствующей площадью

5. Если найдено достаточно объектов (минимум 1):
   - Рассчитай среднюю стоимость за кв.м: (сумма всех price_per_sqm) / количество_объектов
   - Укажи количество использованных объектов
   - Верни success: true
   - В поле message оставь пустую строку ""

6. Если подходящих объектов не найдено:
   - Верни success: false
   - Объясни причину в сообщении (например: "По указанному городу нет данных в базе")

ВАЖНО:
- НЕ ВЫДУМЫВАЙ данные! Используй только реальные объекты из предоставленного списка
- Учитывай все варианты написания (например "Владивосток" = "владивосток")
- Если площадь = 0 или отсутствует, исключи объект из расчета`,
          },
          {
            role: 'user',
            content: `Пользовательский запрос: "${request.originalText}"

Доступные данные по недвижимости:
${JSON.stringify(crmData, null, 2)}

Проанализируй запрос и найди подходящие объекты для расчета средней стоимости.`,
          },
        ],
      });

      if (!completion.choices || completion.choices.length === 0) {
        console.error('GPT вернул пустой ответ.', completion);
        throw new Error('GPT вернул пустой ответ[1].');
      }
      const content = completion.choices[0].message.content;

      if (content) {
        return JSON.parse(content);
      } else {
        throw new Error('GPT вернул пустой ответ[2].');
      }
    } catch (error) {
      console.error('Ошибка при запросе или обработке ответа:', error);
      throw error;
    }
  }
}
