import { UploadFileDto } from "../dto/UploadFileDto";
import fs from "fs/promises";
import path from "path";
import { chatWithGPT } from "../utils/chatWithGPT";
import { trackEvent } from "../../../pages/api/analytics"; // подключаем analytics для трекинга

const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads");

// Полный набор тестовых данных по районам Владивостока
const DEFAULT_TEST_DATA = {
  transactions: [
    {
      district: "Ленинский",
      address: "ул. Светланская, 10",
      area: 45.5,
      price: 6300000,
      date: "2023-05-15",
      type: "apartment"
    },
    {
      district: "Ленинский",
      address: "ул. Алеутская, 15",
      area: 32.7,
      price: 4905000,
      date: "2023-06-22",
      type: "apartment"
    },
    {
      district: "Фрунзенский",
      address: "ул. Русская, 25",
      area: 55.0,
      price: 7150000,
      date: "2023-04-10",
      type: "apartment"
    },
    {
      district: "Фрунзенский",
      address: "ул. Некрасовская, 8",
      area: 48.3,
      price: 6279000,
      date: "2023-07-03",
      type: "apartment"
    },
    {
      district: "Фрунзенский",
      address: "ул. Океанский проспект, 72",
      area: 67.8,
      price: 9492000,
      date: "2023-03-18",
      type: "apartment"
    },
    {
      district: "Первореченский",
      address: "ул. Сабанеева, 3",
      area: 38.6,
      price: 5404000,
      date: "2023-08-11",
      type: "apartment"
    },
    {
      district: "Первореченский",
      address: "ул. Борисенко, 12",
      area: 42.0,
      price: 5880000,
      date: "2023-09-05",
      type: "apartment"
    },
    {
      district: "Советский",
      address: "ул. Каплунова, 7",
      area: 53.2,
      price: 7452000,
      date: "2023-02-28",
      type: "apartment"
    },
    {
      district: "Советский",
      address: "ул. Фадеева, 18",
      area: 60.5,
      price: 8470000,
      date: "2023-10-14",
      type: "apartment"
    },
    {
      district: "Советский",
      address: "ул. Нейбута, 22",
      area: 47.8,
      price: 6692000,
      date: "2023-01-30",
      type: "apartment"
    }
  ]
};

export class UploadCRMDataAction {
  /**
   * Выполняет обработку данных о недвижимости
   * @param file Данные для обработки (необязательно)
   * @returns Результат анализа от GPT
   */
  async execute(file?: UploadFileDto): Promise<any> {
    try {
      let parsed: any;
      
      // Режим тестирования (если файл не передан)
      if (!file) {
        console.log("Используются тестовые данные по умолчанию");
        parsed = DEFAULT_TEST_DATA;

        // 📈 Трекинг использования тестовых данных
        trackEvent("admin", "using_default_test_data", {
          fileName: "default_test_data.json",
          testDataCount: parsed.transactions.length,
        });
      } 
      // Режим работы с реальными данными
      else {
        if (typeof file.content === "string") {
          try {
            parsed = JSON.parse(file.content);
          } catch (parseError) {
            throw new Error("Неверный формат JSON строки");
          }
        } else if (typeof file.content === "object") {
          parsed = file.content;
        } else {
          throw new Error("Неподдерживаемый тип данных");
        }

        // 📈 Трекинг использования реальных данных
        trackEvent("admin", "using_uploaded_data", {
          fileName: file.filename,
          fileSize: file.content.length,
        });
      }

      console.log("Данные для анализа:", JSON.stringify(parsed, null, 2));

      if (!parsed || typeof parsed !== "object" || !parsed.transactions) {
        throw new Error("Данные должны содержать массив transactions");
      }

      // Сохраняем на диск только реальные данные
      if (file) {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        const filePath = path.join(UPLOAD_DIR, file.filename);
        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
        console.log(`Файл сохранен: ${filePath}`);

        // 📈 Трекинг успешного сохранения файла
        trackEvent("admin", "file_saved", {
          filePath: filePath,
          fileName: file.filename,
        });
      }

      const prompt = `...`; // Ваш оригинальный prompt для GPT

      console.log("Отправка данных в GPT...");

      let gptResponse;
      try {
        gptResponse = await chatWithGPT(parsed, prompt);
      } catch (gptError) {
        console.error("Ошибка GPT:", gptError);
        throw new Error("Ошибка при анализе данных");
      }

      console.log("Анализ завершен:", gptResponse);

      // 📈 Трекинг успешного завершения анализа
      trackEvent("admin", "gpt_analysis_complete", {
        result: gptResponse,
        transactionCount: parsed.transactions.length,
      });

      return typeof gptResponse === "string" ? JSON.parse(gptResponse) : gptResponse;

    } catch (error: unknown) {
      console.error("Ошибка обработки:", error);

      // 📈 Трекинг ошибок
      trackEvent("admin", "crm_processing_error", {
        errorMessage: error instanceof Error ? error.message : "Неизвестная ошибка",
      });

      throw error instanceof Error 
        ? error 
        : new Error("Неизвестная ошибка при обработке данных");
    }
  }

  /**
   * Тестовый метод для быстрой проверки функциональности
   */
  async testAnalysis() {
    return this.execute();
  }
}
