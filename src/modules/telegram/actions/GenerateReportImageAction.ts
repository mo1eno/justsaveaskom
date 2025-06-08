/**
 * GenerateReportImageAction:
 * Генерирует красивое изображение с результатами анализа недвижимости
 */
import sharp from 'sharp';

export class GenerateReportImageAction {
  async execute(data: {
    price: number;
    count: number;
    criteria: any;
  }): Promise<Buffer> {
    try {
      // Создаем SVG изображение
      const svg = this.createSVGReport(data);
      
      // Конвертируем SVG в PNG через sharp
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      return pngBuffer;
    } catch (error) {
      console.error('Ошибка при генерации изображения:', error);
      throw error;
    }
  }

  private createSVGReport(data: {
    price: number;
    count: number;
    criteria: any;
  }): string {
    const formattedPrice = data.price.toLocaleString('ru-RU');
    const totalText = data.count === 1 ? '1 объект' :
                     data.count < 5 ? `${data.count} объекта` :
                     `${data.count} объектов`;

    // Формируем критерии поиска
    const criteriaLines = [];
    if (data.criteria) {
      if (data.criteria.type) criteriaLines.push(`Тип: ${data.criteria.type}`);
      if (data.criteria.city) criteriaLines.push(`Город: ${data.criteria.city}`);
      if (data.criteria.street) criteriaLines.push(`Улица: ${data.criteria.street}`);
      if (data.criteria.district) criteriaLines.push(`Район: ${data.criteria.district}`);
      if (data.criteria.area_range && (data.criteria.area_range.min || data.criteria.area_range.max)) {
        const min = data.criteria.area_range.min ? `от ${data.criteria.area_range.min}` : '';
        const max = data.criteria.area_range.max ? `до ${data.criteria.area_range.max}` : '';
        criteriaLines.push(`Площадь: ${min} ${max} м²`.trim());
      }
    }

    const currentDate = new Date().toLocaleDateString('ru-RU');

    return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#grad1)"/>

  <!-- Заголовок -->
  <text x="400" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">
    Анализ недвижимости
  </text>

  <!-- Основной блок с результатами -->
  <rect x="100" y="120" width="600" height="350" fill="white" rx="20" ry="20" opacity="0.95"/>

  <!-- Цена -->
  <text x="400" y="180" text-anchor="middle" fill="#333" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    Средняя цена за м²
  </text>
  <text x="400" y="235" text-anchor="middle" fill="#667eea" font-family="Arial, sans-serif" font-size="48" font-weight="bold">
    ${formattedPrice} руб.
  </text>

  <!-- Количество объектов -->
  <text x="400" y="270" text-anchor="middle" fill="#333" font-family="Arial, sans-serif" font-size="20">
    Проанализировано: ${totalText}
  </text>

  <!-- Критерии поиска -->
  ${criteriaLines.length > 0 ? `
  <text x="130" y="320" fill="#333" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
    Критерии поиска:
  </text>
  ${criteriaLines.map((line, index) => `
  <text x="150" y="${345 + index * 25}" fill="#666" font-family="Arial, sans-serif" font-size="16">
    ${line}
  </text>
  `).join('')}
  ` : ''}

  <!-- Дата и подпись -->
  <text x="400" y="520" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">
    Данные актуальны на ${currentDate}
  </text>
  <!--<text x="400" y="550" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.8">-->
  <!--  ℹ️ Информация основана на данных CRM-->
  <!--</text>-->
</svg>`;
  }
}
